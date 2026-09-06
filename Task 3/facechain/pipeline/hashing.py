import hashlib
import json
from pipeline.candidates import MatchRecord

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().lower()

def sha256_text(text: str) -> str:
    return sha256_bytes(text.encode('utf-8'))

def canonicalize_record(record: MatchRecord) -> str:
    """Create a deterministic JSON string from the record fields that matter."""
    # We intentionally exclude similarity, timestamps, etc. as they are transient.
    # We include standard stable fields.
    content = {
        "image_url": record.image_url or "",
        "source_domain": record.source_domain or "",
        "source_url": record.source_url or "",
        "title": record.title or "",
    }
    # Sort keys, compact representation, UTF-8 encoded logic
    return json.dumps(content, sort_keys=True, separators=(',', ':'), ensure_ascii=False)

def fingerprint_record(record: MatchRecord) -> str:
    """Generate SHA-256 fingerprint for the canonical record."""
    canonical_text = canonicalize_record(record)
    return sha256_text(canonical_text)

def fingerprint_data_dict(content: dict) -> str:
    canonical_text = json.dumps(content, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    return sha256_text(canonical_text)
