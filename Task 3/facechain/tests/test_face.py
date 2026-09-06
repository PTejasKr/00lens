import numpy as np
import pytest
from pipeline.face import cosine_similarity, load_face_model

def test_cosine_similarity():
    a = np.array([1, 0, 0])
    b = np.array([1, 0, 0])
    assert cosine_similarity(a, b) == 1.0

    c = np.array([0, 1, 0])
    assert cosine_similarity(a, c) == 0.0

    assert cosine_similarity(None, a) == 0.0

def test_load_model():
    app = load_face_model()
    assert app is not None
