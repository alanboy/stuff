const textOutput  = document.getElementById('text-output');
const statusEl    = document.getElementById('status');
const copyBtn     = document.getElementById('copy-btn');
const smartBtn    = document.getElementById('btn-smart');
const fullBtn     = document.getElementById('btn-full');
const aiBtn       = document.getElementById('btn-ai');
const aiPanel     = document.getElementById('ai-panel');
const aiIdle      = document.getElementById('ai-idle');
const aiSpinner   = document.getElementById('ai-spinner');
const aiResults   = document.getElementById('ai-results');
const aiError     = document.getElementById('ai-error');
const aiExtractBtn = document.getElementById('ai-extract-btn');

let smartText = '';
let fullText  = '';
let activeMode = 'smart';
let aiData = null;
let currentTabUrl = '';
let userContext = '';

// ── Content extraction (injected read-only into the tab) ────────────────────

function extractBoth() {
  function getSmartText() {
    if (location.hostname.includes('linkedin.com')) {
      const jd = document.querySelector('.jobs-description-content');
      if (jd) return (jd.innerText || '').trim();
    }
    if (location.hostname.includes('workatastartup.com')) {
      const jd = document.querySelector('.my-4.rounded-md.border.border-gray-300.bg-beige-lighter.px-4.py-6');
      if (jd) return (jd.innerText || '').trim();
    }

    const bodyText = (document.body.innerText || '').trim();
    if (!bodyText) return '';

    let best = document.body, bestScore = 0;
    for (const el of document.querySelectorAll('article, main, [role="main"], [role="article"], section, div')) {
      const text = (el.innerText || '').trim();
      if (text.length < 300) continue;
      const textRatio = text.length / bodyText.length;
      if (textRatio < 0.05 || textRatio > 0.98) continue;
      const nodeCount = el.querySelectorAll('*').length + 1;
      const density = text.length / nodeCount;
      const tag = el.tagName.toLowerCase();
      const role = (el.getAttribute('role') || '').toLowerCase();
      const bonus = (tag === 'article' || tag === 'main' || role === 'main' || role === 'article') ? 2 : 1;
      const score = density * bonus;
      if (score > bestScore) { bestScore = score; best = el; }
    }
    return (best.innerText || '').trim();
  }

  return {
    smart: getSmartText(),
    full: (document.body.innerText || '').trim(),
  };
}

// ── UI helpers ──────────────────────────────────────────────────────────────

function setMode(mode) {
  activeMode = mode;
  smartBtn.classList.toggle('active', mode === 'smart');
  fullBtn.classList.toggle('active',  mode === 'full');
  aiBtn.classList.toggle('active',    mode === 'ai');

  textOutput.style.display = (mode === 'ai') ? 'none' : '';
  aiPanel.style.display    = (mode === 'ai') ? 'flex' : 'none';
  copyBtn.style.display    = (mode === 'ai') ? 'none' : '';

  if (mode === 'smart' || mode === 'full') {
    const text = mode === 'smart' ? smartText : fullText;
    textOutput.textContent = text || '(No text found)';
    textOutput.className = 'text-panel' + (text ? '' : ' null');
    if (text) {
      const words = text.split(/\s+/).filter(Boolean).length;
      statusEl.textContent = `${words.toLocaleString()} words · ${text.length.toLocaleString()} chars`;
    } else {
      statusEl.textContent = '';
    }
  } else {
    statusEl.textContent = '';
  }
}

// ── Load page text on popup open ────────────────────────────────────────────

// Load personal context file
fetch(chrome.runtime.getURL('context.txt'))
  .then(r => r.text())
  .then(t => { userContext = t.trim(); })
  .catch(() => {});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  currentTabUrl = tab.url || '';
  chrome.scripting.executeScript(
    { target: { tabId: tab.id }, func: extractBoth },
    (results) => {
      if (chrome.runtime.lastError) {
        textOutput.textContent = 'Error: ' + chrome.runtime.lastError.message;
        textOutput.className = 'text-panel error';
        return;
      }
      const data = results?.[0]?.result ?? { smart: '', full: '' };
      smartText = data.smart;
      fullText  = data.full;
      setMode('smart');
    }
  );
});

smartBtn.addEventListener('click', () => setMode('smart'));
fullBtn.addEventListener('click',  () => setMode('full'));
aiBtn.addEventListener('click',    () => setMode('ai'));

copyBtn.addEventListener('click', () => {
  const text = activeMode === 'smart' ? smartText : fullText;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = orig), 1500);
  });
});

// ── Claude API extraction ───────────────────────────────────────────────────

function buildPrompt() {
  const hasContext = userContext && !userContext.startsWith('#');

  const contextSection = hasContext
    ? `CANDIDATE CONTEXT:\n${userContext}\n\n---\n\n`
    : '';

  const recommendationFields = hasContext ? `
- recommendation_score (integer 1–10 | null — how well this role matches the candidate; 10 = perfect fit)
- recommendation_reason (string | null — 2-3 sentences explaining the score, referencing specifics from both the role and the candidate's background)` : `
- recommendation_score (null — no candidate context provided)
- recommendation_reason (null — no candidate context provided)`;

  return `You are a job search assistant helping a candidate evaluate opportunities.

${contextSection}Extract structured data from the job description below and return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

Even if the text does not appear to be a job description, still attempt to fill every field you can infer. Set is_job_description to false but do not leave everything else null.

Fields to extract:
- is_job_description (boolean)
- summary (string | null — one short sentence describing the role, e.g. "A hands-on CTO that can code for an early-stage startup". Capture seniority, function, and context.)
- title (string | null)
- company_name (string | null)
- company_url (string | null)
- salary_min (number, yearly USD | null — convert hourly/monthly if needed)
- salary_max (number, yearly USD | null)
- location (string, city | null)
- remote (boolean)
- type ("management" | "IC" | null — management = people manager / director / VP / executive, IC = individual contributor)
- years_experience (integer, total years required | null)
- years_management_experience (integer | null — only fill if management/executive role)
- stack (array of strings — programming languages, frameworks, tools, platforms)
- vertical (string | null — industry or domain, e.g. "FinTech", "HealthTech", "SaaS B2B")${recommendationFields}

Text to parse:
`;
}

function showAiState(state) {
  aiIdle.style.display    = state === 'idle'    ? 'flex'  : 'none';
  aiSpinner.style.display = state === 'loading' ? 'flex'  : 'none';
  aiResults.style.display = state === 'results' ? 'flex'  : 'none';
  aiError.style.display   = state === 'error'   ? 'block' : 'none';
}

function fmt(val) {
  if (val === null || val === undefined) return '<span class="field-value null">—</span>';
  if (typeof val === 'boolean')
    return val
      ? '<span class="field-value yes">Yes</span>'
      : '<span class="field-value no">No</span>';
  return `<span class="field-value">${String(val)}</span>`;
}

function fmtSalary(min, max) {
  if (!min && !max) return '<span class="field-value null">—</span>';
  const f = n => n ? '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '?';
  if (min && max) return `<span class="field-value">${f(min)} – ${f(max)}</span>`;
  return `<span class="field-value">${f(min || max)}</span>`;
}

function fmtStack(stack) {
  if (!Array.isArray(stack) || stack.length === 0)
    return '<span class="field-value null">—</span>';
  return `<span class="field-value tag-list">${stack.map(t => `<span class="tag">${t}</span>`).join('')}</span>`;
}

function renderResults(d) {
  const rows = [
    ['Job description?', fmt(d.is_job_description)],
    ['Summary',          fmt(d.summary)],
    ['Title',            fmt(d.title)],
    ['Company',          fmt(d.company_name)],
    ['Company URL',      fmt(d.company_url)],
    ['Salary (yearly)',  fmtSalary(d.salary_min, d.salary_max)],
    ['Location',         fmt(d.location)],
    ['Remote',           fmt(d.remote)],
    ['Type',             fmt(d.type)],
    ['Experience needed', d.years_experience != null ? fmt(d.years_experience + ' yrs') : fmt(null)],
    ['Mgmt experience',  d.years_management_experience != null ? fmt(d.years_management_experience + ' yrs') : fmt(null)],
    ['Stack',            fmtStack(d.stack)],
    ['Vertical',         fmt(d.vertical)],
  ];

  const title   = d.title        || 'Untitled';
  const company = d.company_name || 'Unknown';
  const dealName = `${title} @ ${company}`;

  const score = d.recommendation_score;
  const scoreColor = !score ? '#aaa'
    : score >= 8 ? '#2e7d32'
    : score >= 5 ? '#e65100'
    : '#c00';

  const recommendationHtml = (score || d.recommendation_reason) ? `
    <div class="rec-block">
      <div class="rec-header">
        <span class="rec-label">Should I apply?</span>
        ${score ? `<span class="rec-score" style="color:${scoreColor}">${score}<span class="rec-denom">/10</span></span>` : ''}
      </div>
      ${d.recommendation_reason ? `<p class="rec-reason">${d.recommendation_reason}</p>` : ''}
    </div>` : '';

  aiResults.innerHTML =
    rows.map(([label, value]) =>
      `<div class="field-row">
        <span class="field-label">${label}</span>
        ${value}
      </div>`
    ).join('') +
    recommendationHtml +
    `<div class="hs-row">
      <button id="hs-btn" data-deal="${dealName.replace(/"/g, '&quot;')}">
        Create HubSpot Deal
      </button>
      <span id="hs-status"></span>
    </div>`;

  document.getElementById('hs-btn').addEventListener('click', createHubSpotDeal);
}

// ── HubSpot deal creation ───────────────────────────────────────────────────

async function createHubSpotDeal() {
  const btn      = document.getElementById('hs-btn');
  const hsStatus = document.getElementById('hs-status');
  const dealName = btn.dataset.deal;

  const token = window.HUBSPOT_ACCESS_TOKEN;
  if (!token || token === 'YOUR_HUBSPOT_TOKEN') {
    hsStatus.className = 'hs-error';
    hsStatus.textContent = 'Set HUBSPOT_ACCESS_TOKEN in config.js first.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating…';
  hsStatus.textContent = '';

  const hs = (path, body) => fetch(`https://api.hubapi.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  try {
    // 1. Create the deal
    const jdField = window.HUBSPOT_JD_FIELD || 'job_description';
    const dealProps = {
      dealname:  dealName,
      pipeline:  window.HUBSPOT_PIPELINE_ID  || 'default',
      dealstage: window.HUBSPOT_DEAL_STAGE_ID || 'appointmentscheduled',
      [jdField]: smartText || fullText,
    };

    const dealResp = await hs('/crm/v3/objects/deals', { properties: dealProps });
    if (!dealResp.ok) {
      const e = await dealResp.json().catch(() => ({}));
      throw new Error(e?.message || `Deal creation failed: HTTP ${dealResp.status}`);
    }
    const deal = await dealResp.json();

    // 2. Create a note with extracted details + source URL
    const d = aiData;
    const sal = (d.salary_min || d.salary_max)
      ? [d.salary_min, d.salary_max].filter(Boolean)
          .map(n => '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 }))
          .join(' – ')
      : null;

    const noteLines = [
      d.summary                         && `📝 ${d.summary}`,
      ``,
      d.title                           && `Title:       ${d.title}`,
      d.company_name                    && `Company:     ${d.company_name}`,
      d.company_url                     && `Company URL: ${d.company_url}`,
      sal                               && `Salary:      ${sal} / yr`,
      d.location                        && `Location:    ${d.location}`,
      (d.remote !== null && d.remote !== undefined) && `Remote:      ${d.remote ? 'Yes' : 'No'}`,
      d.type                            && `Type:        ${d.type}`,
      d.years_experience != null        && `Experience:  ${d.years_experience} yrs`,
      d.years_management_experience != null && `Mgmt exp:    ${d.years_management_experience} yrs`,
      d.vertical                        && `Vertical:    ${d.vertical}`,
      (Array.isArray(d.stack) && d.stack.length) && `Stack:       ${d.stack.join(', ')}`,
      ``,
      d.recommendation_score != null    && `Should I apply? ${d.recommendation_score}/10`,
      d.recommendation_reason           && `${d.recommendation_reason}`,
      ``,
      currentTabUrl                     && `Source: ${currentTabUrl}`,
    ].filter(Boolean).join('\n');

    const noteResp = await hs('/crm/v3/objects/notes', {
      properties: {
        hs_note_body: noteLines,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [{
        to: { id: deal.id },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 214 }],
      }],
    });

    if (!noteResp.ok) {
      // Deal was created — warn but don't fail hard
      const e = await noteResp.json().catch(() => ({}));
      btn.textContent = '✓ Deal created';
      hsStatus.className = 'hs-error';
      hsStatus.textContent = `Note failed: ${e?.message || `HTTP ${noteResp.status}`}`;
      return;
    }

    btn.textContent = '✓ Deal created';
    hsStatus.className = 'hs-ok';
    hsStatus.textContent = `Deal ${deal.id} + note added`;

  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Create HubSpot Deal';
    hsStatus.className = 'hs-error';
    hsStatus.textContent = err.message;
  }
}

aiExtractBtn.addEventListener('click', async () => {
  const text = smartText || fullText;
  if (!text) {
    showAiState('error');
    aiError.textContent = 'No text extracted from the page yet.';
    return;
  }

  const apiKey = window.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    showAiState('error');
    aiError.textContent = 'API key not set. Edit config.js and replace YOUR_KEY_HERE with your Anthropic API key.';
    return;
  }

  showAiState('loading');

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: buildPrompt() + text.slice(0, 8000),
        }],
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${resp.status}`);
    }

    const result = await resp.json();
    const raw = result.content?.[0]?.text?.trim() ?? '';

    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    aiData = JSON.parse(jsonStr);

    renderResults(aiData);
    showAiState('results');

  } catch (err) {
    showAiState('error');
    aiError.textContent = 'Error: ' + err.message;
  }
});

showAiState('idle');
