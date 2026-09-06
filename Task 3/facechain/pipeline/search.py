import os
import requests
import logging
from typing import List, Optional
import io

logger = logging.getLogger(__name__)

class SearchCandidate:
    def __init__(self, source_url: str, title: str, domain: str, image_url: Optional[str], thumbnail_url: Optional[str], result_type: str = "lens"):
        self.source_url = source_url
        self.title = title
        self.domain = domain
        self.image_url = image_url
        self.thumbnail_url = thumbnail_url
        self.result_type = result_type

def upload_image_to_serpapi(image_bytes: bytes, api_key: str) -> Optional[str]:
    """Uploads an image to SerpApi and returns the image_id."""
    try:
        logger.info("Uploading image to SerpApi...")
        url = "https://serpapi.com/image"
        files = {'image': ('upload.jpg', image_bytes, 'image/jpeg')}
        data = {'api_key': api_key}
        response = requests.post(url, files=files, data=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result.get("image_id")
    except Exception as e:
        logger.error(f"Failed to upload image to SerpApi: {e}")
        return None

def reverse_image_search(image_bytes: bytes) -> List[SearchCandidate]:
    """Perform a genuine reverse-image search using SerpApi Google Lens."""
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key:
        logger.error("SERPAPI_KEY not found in environment.")
        return []

    image_id = upload_image_to_serpapi(image_bytes, api_key)
    if not image_id:
        return []

    logger.info(f"Running Google Lens search for image_id: {image_id}")
    search_url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_lens",
        "image_id": image_id,
        "api_key": api_key
    }
    
    candidates = []
    try:
        response = requests.get(search_url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        visual_matches = data.get("visual_matches", [])
        for match in visual_matches:
            source_url = match.get("link")
            title = match.get("title", "")
            domain = match.get("source", "")
            thumbnail_url = match.get("thumbnail")
            # Google Lens visual matches often have thumbnail and link
            image_url = match.get("actual_image_url") or thumbnail_url
            
            if source_url:
                candidates.append(SearchCandidate(
                    source_url=source_url,
                    title=title,
                    domain=domain,
                    image_url=image_url,
                    thumbnail_url=thumbnail_url
                ))
        logger.info(f"Found {len(candidates)} candidates from SerpApi.")
    except Exception as e:
        logger.error(f"Error during SerpApi search: {e}")
        
    return candidates
