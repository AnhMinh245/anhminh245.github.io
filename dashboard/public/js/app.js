/**
 * Anypress Dashboard — Frontend Controller
 */

// State
let contentFiles = [];
let selectedFiles = new Set();
let previewRunning = false;

// ========================================
// Init
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    checkSettings();
    loadSpaces();
    loadContent();
    loadCI();
    checkPreviewStatus();

    // Auto-refresh CI every 30s
    setInterval(loadCI, 30000);
});

async function checkSettings() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');

        // Check Anytype connection
        const syncRes = await fetch('/api/sync/status');
        const syncData = await syncRes.json();

        if (syncData.connected) {
            dot.className = 'status-dot connected';
            text.textContent = 'Anytype connected';
        } else {
            dot.className = 'status-dot error';
            text.textContent = 'Anytype offline — ' + (syncData.error || 'Hãy mở Anytype');
        }
    } catch (err) {
        document.getElementById('statusDot').className = 'status-dot error';
        document.getElementById('statusText').textContent = 'Dashboard error';
    }
}

async function loadSpaces() {
    const container = document.getElementById('spacesList');
    try {
        const res = await fetch('/api/sync/spaces');
        const data = await res.json();
        if (data.success && data.spaces.length > 0) {
            container.innerHTML = `
                <div class="spaces-header">📂 Workspaces (${data.spaces.length})</div>
                <div class="spaces-tags">
                    ${data.spaces.map(s => `<span class="space-tag" title="${s.id}">${s.icon || '📦'} ${s.name}</span>`).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '';
        }
    } catch (err) {
        container.innerHTML = '';
    }
}

// ========================================
// Sync Panel
// ========================================
async function syncContent() {
    const btn = document.getElementById('btnSync');
    const info = document.getElementById('syncInfo');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Syncing...';
    info.innerHTML = '<span class="text-muted">Đang kết nối Anytype...</span>';

    try {
        const res = await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tag: 'publish' }) });
        const data = await res.json();

        if (data.success) {
            // Per-space breakdown
            const spaceRows = (data.spaces || []).map(s => {
                const icon = s.synced > 0 ? '✅' : (s.error ? '❌' : '⬜');
                return `<div class="space-sync-row">${icon} <strong>${s.name}</strong>: ${s.synced} synced / ${s.found} found</div>`;
            }).join('');

            info.innerHTML = `
                <div class="sync-result">
                    <span class="sync-stat">📦 ${data.total} found</span>
                    <span class="sync-stat">✅ ${data.synced} synced</span>
                    ${data.failed > 0 ? `<span class="sync-stat">❌ ${data.failed} failed</span>` : ''}
                </div>
                ${spaceRows ? `<div class="space-sync-details">${spaceRows}</div>` : ''}
            `;
            toast(`Synced ${data.synced} bài viết từ ${(data.spaces || []).length} workspace`, 'success');
            loadContent();
        } else {
            info.innerHTML = `<span style="color: var(--red)">❌ ${data.error}</span>`;
            toast(data.error, 'error');
        }
    } catch (err) {
        info.innerHTML = `<span style="color: var(--red)">❌ ${err.message}</span>`;
        toast('Sync failed: ' + err.message, 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🔄</span> Sync Now';
}

// ========================================
// Content Panel
// ========================================
async function loadContent() {
    const list = document.getElementById('contentList');
    try {
        const res = await fetch('/api/content');
        const data = await res.json();
        contentFiles = data.files || [];

        if (contentFiles.length === 0) {
            list.innerHTML = '<div class="loading">Chưa có bài viết. Hãy Sync hoặc tạo mới.</div>';
            return;
        }

        list.innerHTML = contentFiles.map((file, i) => `
      <div class="content-item ${selectedFiles.has(file.path) ? 'selected' : ''}" onclick="toggleFile('${file.path}')">
        <input type="checkbox" ${selectedFiles.has(file.path) ? 'checked' : ''} onclick="event.stopPropagation(); toggleFile('${file.path}')">
        <span class="file-name">${file.name}</span>
        <span class="file-status ${file.status}">${statusLabel(file.status)}</span>
        <button class="btn btn-ghost btn-preview" onclick="event.stopPropagation(); previewFile('${file.name}')">Preview</button>
      </div>
    `).join('');

        updateDeployButton();
    } catch (err) {
        list.innerHTML = `<div class="loading" style="color: var(--red)">Error: ${err.message}</div>`;
    }
}

function statusLabel(status) {
    const labels = { new: '➕ new', modified: '✏️ modified', deleted: '🗑️ deleted', unmodified: '— unchanged' };
    return labels[status] || status;
}

function toggleFile(path) {
    if (selectedFiles.has(path)) {
        selectedFiles.delete(path);
    } else {
        selectedFiles.add(path);
    }
    loadContent();
}

function selectAll() {
    contentFiles.forEach(f => selectedFiles.add(f.path));
    loadContent();
}

function selectNone() {
    selectedFiles.clear();
    loadContent();
}

function updateDeployButton() {
    const btn = document.getElementById('btnDeploy');
    const count = document.getElementById('selectedCount');
    count.textContent = selectedFiles.size;
    btn.disabled = selectedFiles.size === 0;
}

// ========================================
// Preview Panel
// ========================================
async function previewFile(filename) {
    try {
        const res = await fetch(`/api/content/${filename}`);
        const data = await res.json();
        if (data.success) {
            const frame = document.getElementById('previewFrame');
            const placeholder = document.getElementById('previewPlaceholder');
            placeholder.classList.add('hidden');
            frame.classList.remove('hidden');

            // Render simple markdown preview
            const html = `<!DOCTYPE html>
        <html><head>
        <style>body{font-family:Inter,sans-serif;padding:24px;max-width:700px;margin:0 auto;line-height:1.7;color:#333;}
        h1,h2,h3{margin-top:1.5em;} pre{background:#f5f5f5;padding:12px;border-radius:6px;overflow-x:auto;}
        code{background:#f5f5f5;padding:2px 4px;border-radius:3px;font-size:0.9em;}</style>
        </head><body>${simpleMarkdown(data.content)}</body></html>`;
            frame.srcdoc = html;
        }
    } catch (err) {
        toast('Cannot load preview: ' + err.message, 'error');
    }
}

function simpleMarkdown(md) {
    return md
        .replace(/^---[\s\S]*?---\n/m, '') // strip frontmatter
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/g, '<p>').replace(/$/g, '</p>')
        .replace(/<p><h/g, '<h').replace(/<\/h(\d)><\/p>/g, '</h$1>');
}

async function togglePreview() {
    const btn = document.getElementById('btnPreviewToggle');
    if (previewRunning) {
        await fetch('/api/preview', { method: 'DELETE' });
        previewRunning = false;
        btn.textContent = '▶️ Start Preview';
        toast('Preview stopped', 'info');
    } else {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Starting...';
        try {
            const res = await fetch('/api/preview', { method: 'POST' });
            const data = await res.json();
            if (data.running) {
                previewRunning = true;
                btn.textContent = '⏹️ Stop Preview';
                const frame = document.getElementById('previewFrame');
                const placeholder = document.getElementById('previewPlaceholder');
                placeholder.classList.add('hidden');
                frame.classList.remove('hidden');
                frame.src = data.url || 'http://localhost:8080';
                toast('Preview running at localhost:8080', 'success');
            }
        } catch (err) {
            toast('Preview failed: ' + err.message, 'error');
        }
        btn.disabled = false;
    }
}

async function checkPreviewStatus() {
    try {
        const res = await fetch('/api/preview');
        const data = await res.json();
        previewRunning = data.running;
        if (previewRunning) {
            document.getElementById('btnPreviewToggle').textContent = '⏹️ Stop Preview';
        }
    } catch { }
}

// ========================================
// Deploy
// ========================================
async function deploySelected() {
    if (selectedFiles.size === 0) return;

    const btn = document.getElementById('btnDeploy');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Deploying...';

    try {
        const res = await fetch('/api/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                files: Array.from(selectedFiles),
                message: `Publish ${selectedFiles.size} article(s)`
            })
        });
        const data = await res.json();

        if (data.success) {
            toast(`✅ Published ${data.filesDeployed} article(s) — commit ${data.commit}`, 'success');
            selectedFiles.clear();
            loadContent();
            setTimeout(loadCI, 5000); // Refresh CI after push
        } else {
            toast('Deploy failed: ' + data.error, 'error');
        }
    } catch (err) {
        toast('Deploy error: ' + err.message, 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '🚀 Publish Selected';
}

// ========================================
// CI/CD Panel
// ========================================
async function loadCI() {
    const list = document.getElementById('ciList');
    try {
        const res = await fetch('/api/ci');
        const data = await res.json();

        if (!data.runs || data.runs.length === 0) {
            list.innerHTML = '<span class="text-muted">Chưa có CI/CD runs. Push code lên GitHub trước.</span>';
            return;
        }

        list.innerHTML = data.runs.map(run => {
            const icon = getStatusIcon(run.status, run.conclusion);
            const time = timeAgo(new Date(run.updatedAt));
            const msg = (run.commitMessage || run.name || '').split('\n')[0].substring(0, 80);
            return `
        <div class="ci-item">
          <span class="ci-icon">${icon}</span>
          <span class="ci-message">${msg}</span>
          <span class="ci-time">${time}</span>
        </div>
      `;
        }).join('');
    } catch (err) {
        list.innerHTML = `<span class="text-muted">Cannot load CI status</span>`;
    }
}

function getStatusIcon(status, conclusion) {
    if (status === 'completed') {
        if (conclusion === 'success') return '✅';
        if (conclusion === 'failure') return '❌';
        return '⚠️';
    }
    return '🔄';
}

// ========================================
// New Post Modal
// ========================================
function showNewPostModal() {
    document.getElementById('newPostModal').classList.remove('hidden');
    document.getElementById('newPostTitle').focus();
}

function hideNewPostModal() {
    document.getElementById('newPostModal').classList.add('hidden');
    document.getElementById('newPostTitle').value = '';
}

async function createNewPost() {
    const title = document.getElementById('newPostTitle').value.trim();
    if (!title) return;

    try {
        const res = await fetch('/api/content/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        const data = await res.json();
        if (data.success) {
            toast(`Created: ${data.slug}.md`, 'success');
            hideNewPostModal();
            loadContent();
        } else {
            toast(data.error, 'error');
        }
    } catch (err) {
        toast('Error: ' + err.message, 'error');
    }
}

// Listen for Enter key in modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('newPostModal').classList.contains('hidden')) {
        createNewPost();
    }
    if (e.key === 'Escape') hideNewPostModal();
});

// ========================================
// Utilities
// ========================================
function toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'vừa xong';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' phút trước';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' giờ trước';
    return Math.floor(seconds / 86400) + ' ngày trước';
}
