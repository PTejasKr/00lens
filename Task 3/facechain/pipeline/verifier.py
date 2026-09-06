from pipeline.blockchain import extract_fingerprint_from_transaction
import logging

logger = logging.getLogger(__name__)

def verify_fingerprint(tx_hash: str, current_fingerprint: str) -> str:
    """Verifies a locally computed fingerprint against the blockchain record."""
    try:
        on_chain_fingerprint = extract_fingerprint_from_transaction(tx_hash)
        if not on_chain_fingerprint:
            return "INVALID TRANSACTION"
            
        if on_chain_fingerprint == current_fingerprint:
            return "VERIFIED"
        else:
            return "TAMPER DETECTED"
    except Exception as e:
        logger.error(f"Verification error: {e}")
        return "NETWORK ERROR"
