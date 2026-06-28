import pytest
from app import compute_allocation_velocity


def test_basic_calculation():
    assert compute_allocation_velocity(10, 1.5) == 15.0
    assert compute_allocation_velocity(0, 2.0) == 0.0


def test_high_volume():
    result = compute_allocation_velocity(10000, 0.95)
    assert result == 9500.0


def test_negative_tasks_raises():
    with pytest.raises(ValueError):
        compute_allocation_velocity(-5, 1.0)


def test_zero_efficiency_raises():
    with pytest.raises(ValueError):
        compute_allocation_velocity(10, 0)


def test_negative_efficiency_raises():
    with pytest.raises(ValueError):
        compute_allocation_velocity(10, -1.0)
