import time
import numpy as np
import logging
from pipeline.face import get_embedding
from pipeline.search import reverse_image_search
from pipeline.candidates import evaluate_candidates, select_best_match
from pipeline.hashing import fingerprint_record
from pipeline.blockchain import anchor_fingerprint
from pipeline.verifier import verify_fingerprint

logger = logging.getLogger(__name__)

class PipelineResult:
    def __init__(self):
        self.face_count = 0
        self.embedding = None
        self.candidates_found = 0
        self.evaluated_candidates = []
        self.match_record = None
        self.fingerprint = None
        self.blockchain_receipt = None
        self.error = None

def run_pipeline(image: np.ndarray, progress_callback=None) -> PipelineResult:
    result = PipelineResult()
    try:
        if progress_callback: progress_callback("Detecting face and generating embedding...")
        # Get primary face embedding
        embedding = get_embedding(image)
        if embedding is None:
            result.error = "No face detected in the image."
            return result
        
        result.embedding = embedding
        result.face_count = 1 # primary face
        
        if progress_callback: progress_callback("Running SerpApi reverse image search...")
        
        # Resize/compress image to stay under SerpApi's 500KB limit
        import cv2
        max_dim = 800
        h, w = image.shape[:2]
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            search_img = cv2.resize(image, (int(w * scale), int(h * scale)))
        else:
            search_img = image
            
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
        _, encoded_img = cv2.imencode('.jpg', search_img, encode_param)
        image_bytes = encoded_img.tobytes()
        
        candidates = reverse_image_search(image_bytes)
        result.candidates_found = len(candidates)
        
        if result.candidates_found == 0:
            result.error = "Reverse search failed or found no candidates."
            return result
            
        if progress_callback: progress_callback("Downloading and matching candidates...")
        evaluated = evaluate_candidates(candidates, embedding)
        result.evaluated_candidates = evaluated
        
        if progress_callback: progress_callback("Selecting best match...")
        best_match = select_best_match(evaluated)
        if not best_match:
            result.error = "No candidate passed the matching threshold."
            return result
            
        result.match_record = best_match
        
        if progress_callback: progress_callback("Generating deterministic SHA-256 fingerprint...")
        result.fingerprint = fingerprint_record(best_match)
        
        if progress_callback: progress_callback("Anchoring fingerprint to Polygon Amoy blockchain...")
        receipt = anchor_fingerprint(result.fingerprint)
        if not receipt:
            result.error = "Blockchain connection failed"
            return result
            
        result.blockchain_receipt = receipt
        if progress_callback: progress_callback("Pipeline complete.")
        
    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        result.error = str(e)
        
    return result
