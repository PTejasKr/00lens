import streamlit as st
import cv2
import numpy as np
import copy
from dotenv import load_dotenv

# Ensure environment is loaded
load_dotenv()

from pipeline.orchestrator import run_pipeline
from pipeline.verifier import verify_fingerprint
from pipeline.blockchain import extract_fingerprint_from_transaction
from pipeline.hashing import fingerprint_data_dict

# Re:scam style UI (Black background, terminal fonts, red/white/green accents)
st.set_page_config(page_title="FACECHAIN", layout="centered")

st.markdown("""
<style>
    body, .stApp {
        background-color: #0d0d0d;
        color: #e0e0e0;
        font-family: 'Courier New', Courier, monospace;
    }
    h1, h2, h3 {
        color: #ff3333;
        font-family: 'Courier New', Courier, monospace;
    }
    .stButton>button {
        background-color: #ff3333;
        color: white;
        border: none;
        border-radius: 2px;
        font-weight: bold;
        font-family: 'Courier New', Courier, monospace;
    }
    .stButton>button:hover {
        background-color: #ff6666;
        color: white;
    }
    .status-success { color: #00ff00; font-weight: bold; }
    .status-error { color: #ff3333; font-weight: bold; }
    .status-warning { color: #ffaa00; font-weight: bold; }
    .block-card {
        background-color: #1a1a1a;
        padding: 15px;
        border-left: 4px solid #ff3333;
        margin-bottom: 15px;
    }
</style>
""", unsafe_allow_html=True)

st.title("FACECHAIN")
st.markdown("### Face Match Discovery + Blockchain Verification")

uploaded_file = st.file_uploader("Upload Face (JPG/PNG)", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    st.image(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), width=300, caption="Uploaded Image")

    if st.button("Start Pipeline"):
        st.session_state.pipeline_result = None
        st.session_state.tampered = False
        
        status_placeholder = st.empty()
        
        def update_progress(msg):
            status_placeholder.markdown(f"**> {msg}**")
            
        with st.spinner("Processing..."):
            result = run_pipeline(image, progress_callback=update_progress)
            st.session_state.pipeline_result = result
            
        status_placeholder.empty()
        
if 'pipeline_result' in st.session_state and st.session_state.pipeline_result:
    res = st.session_state.pipeline_result
    
    if res.error:
        st.markdown(f"<div class='status-error'>✗ {res.error}</div>", unsafe_allow_html=True)
    else:
        st.markdown("---")
        st.markdown("### FACE DETECTION")
        st.markdown(f"<span class='status-success'>✓ {res.face_count} face detected</span>", unsafe_allow_html=True)
        
        st.markdown("### WEB SEARCH")
        st.markdown(f"<span class='status-success'>✓ Reverse search completed</span>", unsafe_allow_html=True)
        st.markdown(f"{res.candidates_found} candidates found")
        
        st.markdown("### BEST CANDIDATE")
        match = res.match_record
        st.markdown(f"""
        <div class='block-card'>
            <b>Source:</b> {match.source_domain}<br>
            <b>URL:</b> <a href='{match.source_url}' target='_blank' style='color:#ffaa00;'>Link</a><br>
            <b>Similarity:</b> {match.similarity:.4f}<br>
            <span class='status-success'>✓ Match</span>
        </div>
        """, unsafe_allow_html=True)
        
        if match.image_url:
            st.image(match.image_url, width=300, caption="Matched Post Image")
            
        st.markdown("### FINGERPRINT")
        st.markdown(f"**SHA-256:**\n`{res.fingerprint}`")
        
        st.markdown("### BLOCKCHAIN")
        rcpt = res.blockchain_receipt
        st.markdown(f"""
        <div class='block-card'>
            <b>Network:</b> Polygon Amoy<br>
            <b>Chain ID:</b> {rcpt['chain_id']}<br>
            <b>Block:</b> {rcpt['block_number']}<br>
            <b>Transaction:</b> <a href='https://amoy.polygonscan.com/tx/{rcpt['tx_hash']}' target='_blank' style='color:#ffaa00;'>{rcpt['tx_hash']}</a>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("### VERIFICATION")
        
        # Tamper simulation
        record_content = {
            "image_url": match.image_url or "",
            "source_domain": match.source_domain or "",
            "source_url": match.source_url or "",
            "title": match.title or "",
        }
        
        if st.session_state.get('tampered', False):
            record_content['title'] = "TAMPERED TITLE - HAHA!"
            local_fingerprint = fingerprint_data_dict(record_content)
        else:
            local_fingerprint = res.fingerprint
            
        on_chain_fingerprint = extract_fingerprint_from_transaction(rcpt['tx_hash'])
        
        st.markdown(f"**Local hash:**\n`{local_fingerprint}`")
        st.markdown(f"**On-chain hash:**\n`{on_chain_fingerprint}`")
        
        if local_fingerprint == on_chain_fingerprint:
            st.markdown("<h3 class='status-success'>✓ VERIFIED</h3>", unsafe_allow_html=True)
        else:
            st.markdown("<h3 class='status-error'>✗ TAMPER DETECTED</h3>", unsafe_allow_html=True)
            
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Verify Blockchain Record"):
                st.rerun()
        with col2:
            if st.button("Simulate Tampering"):
                st.session_state.tampered = True
                st.rerun()
