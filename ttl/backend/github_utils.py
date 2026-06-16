import os
import git
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def log_suspicious_action(action: str, details: dict):
    """Push a suspicious action log to a dedicated GitHub branch.
    The function creates/updates a JSON file `suspicious_log.json` in the repo root,
    commits it to a branch named `invorated-bugs` (creating the branch if needed),
    and pushes to the remote.
    """
    repo_path = os.getenv('REPO_PATH')
    if not repo_path:
        raise RuntimeError('REPO_PATH environment variable not set')
    repo = git.Repo(repo_path)
    branch_name = 'invorated-bugs'
    if branch_name not in repo.heads:
        repo.git.checkout('-b', branch_name)
    else:
        repo.git.checkout(branch_name)
    log_path = os.path.join(repo_path, 'suspicious_log.json')
    # Load existing log entries if file exists
    if os.path.exists(log_path):
        with open(log_path, 'r') as f:
            try:
                logs = json.load(f)
            except Exception:
                logs = []
    else:
        logs = []
    # Append new entry
    logs.append({
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'action': action,
        'details': details
    })
    with open(log_path, 'w') as f:
        json.dump(logs, f, indent=2)
    repo.index.add([log_path])
    repo.index.commit(f"[AI-AGENT] Log suspicious action: {action}")
    try:
        repo.remotes.origin.push(branch_name)
    except Exception as e:
        logger.exception('Failed to push suspicious log branch')
        raise
