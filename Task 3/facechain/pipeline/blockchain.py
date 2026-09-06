import os
import logging
from web3 import Web3

logger = logging.getLogger(__name__)

def get_web3():
    rpc_url = os.getenv("POLYGON_RPC_URL")
    if not rpc_url:
        return None
    return Web3(Web3.HTTPProvider(rpc_url))

def anchor_fingerprint(fingerprint: str) -> dict:
    w3 = get_web3()
    private_key = os.getenv("PRIVATE_KEY")
    wallet_address = os.getenv("WALLET_ADDRESS")
    
    if not w3 or not private_key or not wallet_address:
        logger.error("Blockchain credentials missing in environment.")
        return None
        
    try:
        chain_id = w3.eth.chain_id
        if chain_id != 80002:
            logger.error(f"Expected chain_id 80002 for Polygon Amoy, got {chain_id}")
            return None
            
        data = f"FACECHAIN:{fingerprint}".encode('utf-8')
        
        tx = {
            'to': wallet_address, # Send to self
            'value': 0,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(wallet_address),
            'data': data,
            'chainId': chain_id
        }
        
        try:
            gas_estimate = w3.eth.estimate_gas(tx)
            tx['gas'] = int(gas_estimate * 1.2) # Add some buffer
        except Exception as e:
            logger.warning(f"Gas estimation failed, using fallback: {e}")
            tx['gas'] = 150000
            
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        logger.info(f"Transaction sent: {tx_hash.hex()}. Waiting for receipt...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        return {
            'tx_hash': tx_hash.hex(),
            'block_number': receipt.blockNumber,
            'sender': receipt['from'],
            'chain_id': chain_id
        }
    except Exception as e:
        logger.error(f"Blockchain anchoring failed: {e}")
        return None

def extract_fingerprint_from_transaction(tx_hash: str) -> str:
    w3 = get_web3()
    if not w3:
        return None
        
    try:
        tx = w3.eth.get_transaction(tx_hash)
        input_data = tx['input']
        # Depending on web3py version, input_data can be string or bytes
        if isinstance(input_data, str):
            if input_data.startswith('0x'):
                input_data = bytes.fromhex(input_data[2:])
            else:
                input_data = bytes.fromhex(input_data)
                
        decoded = input_data.decode('utf-8', errors='ignore')
        if decoded.startswith("FACECHAIN:"):
            return decoded.split("FACECHAIN:")[1].strip()
        return None
    except Exception as e:
        logger.error(f"Failed to read transaction {tx_hash}: {e}")
        return None
