import cv2
import numpy as np
from insightface.app import FaceAnalysis
import logging

logger = logging.getLogger(__name__)

# Global cache for the model so it loads only once
_model = None

def load_face_model():
    global _model
    if _model is None:
        logger.info("Loading InsightFace model (buffalo_l)...")
        # ctx_id=-1 forces CPU which is safer for basic deployment
        _model = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        _model.prepare(ctx_id=-1, det_size=(640, 640))
        logger.info("InsightFace model loaded.")
    return _model

def detect_faces(image: np.ndarray):
    """Detect faces in an image."""
    try:
        app = load_face_model()
        faces = app.get(image)
        return faces
    except Exception as e:
        logger.error(f"Error detecting faces: {e}")
        return []

def get_embedding(image: np.ndarray, face_index: int = 0):
    """Get normed embedding for the specified face index."""
    faces = detect_faces(image)
    if not faces or face_index >= len(faces):
        return None
    return faces[face_index].normed_embedding

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate cosine similarity between two embeddings."""
    if a is None or b is None:
        return 0.0
    # insightface embeddings are usually already L2-normalized
    # but we can do it explicitly just in case
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def compare_face_images(image_a: np.ndarray, image_b: np.ndarray) -> float:
    """Compare the primary face in two images and return similarity score."""
    emb_a = get_embedding(image_a)
    emb_b = get_embedding(image_b)
    return cosine_similarity(emb_a, emb_b)
