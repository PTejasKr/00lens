def compute_allocation_velocity(tasks: int, efficiency: float) -> float:
    """tasks * efficiency, basically throughput estimate."""
    if tasks < 0 or efficiency <= 0:
        raise ValueError("tasks must be >= 0, efficiency must be > 0")
    return float(tasks * efficiency)
