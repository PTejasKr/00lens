import logging
import requests
import cv2
import numpy as np
import time
from typing import List, Optional
from pipeline.search import SearchCandidate
from pipeline.face import detect_faces, cosine_similarity

logger = logging.getLogger(__name__)

class MatchRecord:
    def __init__(self, source_url: str, source_domain: str, image_url: Optional[str], 
                 title: str, similarity: float, detected_face_count: int, discovered_at: float):
        self.source_url = source_url
        self.source_domain = source_domain
        self.image_url = image_url
        self.title = title
        self.similarity = similarity
        self.detected_face_count = detected_face_count
        self.discovered_at = discovered_at

def download_candidate_image(url: str, timeout: int = 5) -> Optional[np.ndarray]:
    """Downloads candidate image using a strict timeout."""
    if not url:
        return None
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        # Avoid processing massive files or HTML pages
        content_type = response.headers.get('Content-Type', '')
        if 'text' in content_type.lower():
            return None
            
        image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        logger.debug(f"Failed to download image from {url}: {e}")
        return None

def evaluate_candidates(candidates: List[SearchCandidate], input_embedding: np.ndarray, threshold: float = 0.4) -> List[dict]:
    """Downloads and verifies candidate images independently."""
    results = []
    
    for idx, candidate in enumerate(candidates):
        # We only try the first few to save time, or do all if small
        if idx >= 15:
            break
            
        image = download_candidate_image(candidate.image_url)
        if image is None:
            image = download_candidate_image(candidate.thumbnail_url)
            
        if image is None:
            results.append({
                "candidate": candidate,
                "similarity": 0.0,
                "face_count": 0,
                "status": "IMAGE INACCESSIBLE"
            })
            continue
            
        faces = detect_faces(image)
        face_count = len(faces)
        
        best_sim = 0.0
        for face in faces:
            sim = cosine_similarity(input_embedding, face.normed_embedding)
            if sim > best_sim:
                best_sim = sim
                
        status = "MATCH" if best_sim >= threshold else ("REVIEW" if best_sim >= threshold * 0.7 else "NO MATCH")
        
        results.append({
            "candidate": candidate,
            "similarity": best_sim,
            "face_count": face_count,
            "status": status
        })
        
    # Rank descending by similarity
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results

def select_best_match(evaluated_candidates: List[dict], threshold: float = 0.4) -> Optional[MatchRecord]:
    for result in evaluated_candidates:
        if result["status"] == "MATCH" and result["similarity"] >= threshold:
            cand = result["candidate"]
            return MatchRecord(
                source_url=cand.source_url,
                source_domain=cand.domain,
                image_url=cand.image_url or cand.thumbnail_url,
                title=cand.title,
                similarity=result["similarity"],
                detected_face_count=result["face_count"],
                discovered_at=time.time()
            )
    return None
