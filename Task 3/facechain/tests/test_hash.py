import pytest
import json
from pipeline.candidates import MatchRecord
from pipeline.hashing import canonicalize_record, fingerprint_record, sha256_text

def test_canonicalize_record():
    record = MatchRecord(
        source_url="http://example.com",
        source_domain="example.com",
        image_url="http://example.com/image.jpg",
        title="Test Title",
        similarity=0.9,
        detected_face_count=1,
        discovered_at=12345.0
    )
    
    canonical = canonicalize_record(record)
    expected = json.dumps({
        "image_url": "http://example.com/image.jpg",
        "source_domain": "example.com",
        "source_url": "http://example.com",
        "title": "Test Title"
    }, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    
    assert canonical == expected

def test_fingerprint_record():
    record = MatchRecord(
        source_url="a",
        source_domain="b",
        image_url="c",
        title="d",
        similarity=1.0,
        detected_face_count=1,
        discovered_at=0.0
    )
    h1 = fingerprint_record(record)
    
    record.title = "e"
    h2 = fingerprint_record(record)
    
    assert h1 != h2
    assert len(h1) == 64
