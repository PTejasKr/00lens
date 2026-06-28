// generate_summary.js – Helper script for GitHub Actions (Node 20)
// This script fetches PR metadata, enumerates changed files, and formats a markdown summary.
// Outputs are provided via the modern GITHUB_OUTPUT mechanism.

const { execSync } = require('child_process');
const fs = require('fs');

// Environment variables injected by the workflow
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO;
const PR_NUMBER = process.env.PR_NUMBER;

/** Perform a GET request to the GitHub REST API */
async function ghApi(path) {
  const url = `https://api.github.com/repos/${REPO}/${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Retrieve basic PR information */
async function getPrInfo() {
  return ghApi(`pulls/${PR_NUMBER}`);
}

/** Retrieve the list of files changed in the PR */
async function getChangedFiles() {
  const files = await ghApi(`pulls/${PR_NUMBER}/files`);
  return files
    .map((f) => `- ${f.filename} (+${f.additions}/-${f.deletions})`)
    .join('\n');
}

/** Extract commit messages from the PR's head branch */
function getCommitMessages() {
  try {
    const log = execSync('git log --format=%s HEAD~$(git rev-list --count HEAD)..HEAD', {
      encoding: 'utf-8',
    }).trim();
    return log || 'No commit messages found.';
  } catch (e) {
    return 'Unable to retrieve commit messages.';
  }
}

/** Write an output variable using GITHUB_OUTPUT when available */
function writeOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}<<EOF\n${value}\nEOF\n`);
  } else {
    // Fallback for older runners (deprecated)
    console.log(`::set-output name=${name}::${value}`);
  }
}

(async () => {
  try {
    const pr = await getPrInfo();
    const filesList = await getChangedFiles();
    const commits = getCommitMessages();

    const summary = `## PR #${PR_NUMBER}: ${pr.title}\n` +
      `**Author:** ${pr.user.login}\n` +
      `**Merged at:** ${new Date().toISOString()}\n\n` +
      `### Description\n${pr.body || 'No description provided.'}\n\n` +
      `### Files Changed\n${filesList}\n\n` +
      `### Commits\n${commits}`;

    writeOutput('summary', summary);
    writeOutput('changelog', summary);
  } catch (err) {
    console.error('Failed to generate PR summary:', err);
    process.exit(1);
  }
})();
