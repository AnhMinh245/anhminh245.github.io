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
let searchQuery = '';
let pendingDeletePaths = [];

async function loadContent() {
    const list = document.getElementById('contentList');
    try {
        const res = await fetch('/api/content');
        const data = await res.json();
        contentFiles = data.files || [];

        // Update article count
        document.getElementById('articleCount').textContent = `(${contentFiles.length})`;

        renderContentList();
        updateDeployButton();
    } catch (err) {
        list.innerHTML = `<div class="loading" style="color: var(--red)">Error: ${err.message}</div>`;
    }
}

function filterContent(query) {
    searchQuery = query.toLowerCase();
    renderContentList();
}

function renderContentList() {
    const list = document.getElementById('contentList');

    const filtered = contentFiles.filter(file =>
        !searchQuery ||
        file.name.toLowerCase().includes(searchQuery) ||
        file.path.toLowerCase().includes(searchQuery)
    );

    if (filtered.length === 0) {
        list.innerHTML = `<div class="loading">${searchQuery ? 'Không tìm thấy bài viết nào.' : 'Chưa có bài viết. Hãy Sync hoặc tạo mới.'}</div>`;
        return;
    }

    list.innerHTML = filtered.map((file) => {
        const parts = file.path.replace('content/', '').split('/');
        const folder = parts.length > 1 ? parts.slice(0, -1).join('/') + '/' : '';
        const isSelected = selectedFiles.has(file.path);

        return `
      <div class="content-item ${isSelected ? 'selected' : ''}" onclick="toggleFile('${file.path}')">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFile('${file.path}')">
        <span class="file-name">${file.name}${folder ? `<span class="file-folder">${folder}</span>` : ''}</span>
        <span class="file-status ${file.status}">${statusLabel(file.status)}</span>
        <button class="btn btn-ghost btn-preview" onclick="event.stopPropagation(); previewFile('${file.name}')">👁️</button>
        <button class="btn btn-ghost btn-delete" onclick="event.stopPropagation(); promptDeleteSingle('${file.path}', '${file.name}')" title="Xóa bài viết">🗑️</button>
      </div>`;
    }).join('');
}

function statusLabel(status) {
    const labels = { new: 'NEW', modified: 'MODIFIED', deleted: 'DELETED', unmodified: 'unchanged' };
    return labels[status] || status;
}

function toggleFile(path) {
    if (selectedFiles.has(path)) selectedFiles.delete(path);
    else selectedFiles.add(path);
    renderContentList();
    updateDeployButton();
    updateBulkDeleteButton();
}

function selectAll() {
    contentFiles.forEach(f => selectedFiles.add(f.path));
    renderContentList();
    updateDeployButton();
    updateBulkDeleteButton();
}

function selectNone() {
    selectedFiles.clear();
    renderContentList();
    updateDeployButton();
    updateBulkDeleteButton();
}

function updateBulkDeleteButton() {
    const btn = document.getElementById('btnBulkDelete');
    if (selectedFiles.size > 0) {
        btn.classList.remove('hidden');
        btn.textContent = `🗑️ Xóa (${selectedFiles.size})`;
    } else {
        btn.classList.add('hidden');
    }
}

// ── Delete Modal ──
function promptDeleteSingle(filePath, fileName) {
    pendingDeletePaths = [filePath];
    document.getElementById('deleteModalTitle').textContent = 'Xóa bài viết';
    document.getElementById('deleteModalDesc').textContent =
        `Bạn có chắc muốn xóa "${fileName}"?`;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function promptBulkDelete() {
    pendingDeletePaths = Array.from(selectedFiles);
    document.getElementById('deleteModalTitle').textContent = `Xóa ${pendingDeletePaths.length} bài viết`;
    document.getElementById('deleteModalDesc').textContent =
        `Bạn sắp xóa ${pendingDeletePaths.length} bài viết đã chọn. Hành động này không thể hoàn tác.`;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function hideDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    pendingDeletePaths = [];
}

async function confirmDelete() {
    const deploy = document.getElementById('optUnpublish').checked;
    const btn = document.getElementById('btnConfirmDelete');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Đang xóa...';

    try {
        const res = await fetch('/api/content/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filePaths: pendingDeletePaths,
                deploy
            })
        });
        const data = await res.json();

        if (data.success) {
            const n = data.deleted.length;
            if (data.deployed) {
                toast(`Đã xóa ${n} bài viết và gỡ khỏi website (commit ${data.commit})`, 'success');
                setTimeout(loadCI, 4000);
            } else if (data.deployError) {
                toast(`Đã xóa ${n} bài viết nhưng deploy thất bại: ${data.deployError}`, 'info');
            } else {
                toast(`Đã xóa ${n} bài viết. Nhớ Deploy để cập nhật website.`, 'success');
            }
            data.deleted.forEach(p => selectedFiles.delete(p));
            hideDeleteModal();
            loadContent();
            updateBulkDeleteButton();
        } else {
            toast('Lỗi: ' + data.error, 'error');
        }
    } catch (err) {
        toast('Lỗi: ' + err.message, 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Xóa';
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
    document.getElementById('newPostFolder').value = '';
    document.getElementById('newPostTags').value = '';
    document.getElementById('newPostContent').value = '';
}

async function createNewPost() {
    const title = document.getElementById('newPostTitle').value.trim();
    if (!title) return;

    const folder = document.getElementById('newPostFolder').value;
    const tags = document.getElementById('newPostTags').value.trim();
    const content = document.getElementById('newPostContent').value;

    try {
        const res = await fetch('/api/content/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, folder, tags, content })
        });
        const data = await res.json();
        if (data.success) {
            toast(`Đã tạo: ${data.path}`, 'success');
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
    if (e.key === 'Escape') { hideNewPostModal(); hideImportModal(); }
});

// ========================================
// Import Modal
// ========================================
let pendingImportFiles = [];

function showImportModal() {
    pendingImportFiles = [];
    document.getElementById('importFileList').innerHTML = '';
    document.getElementById('importFolder').value = '';
    document.getElementById('btnImport').disabled = true;
    document.getElementById('importFileInput').value = '';
    document.getElementById('importModal').classList.remove('hidden');
}

function hideImportModal() {
    document.getElementById('importModal').classList.add('hidden');
    pendingImportFiles = [];
}

function handleImportDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.md') || f.name.endsWith('.markdown'));
    if (files.length > 0) addImportFiles(files);
}

function handleImportFiles(fileList) {
    addImportFiles(Array.from(fileList));
}

function addImportFiles(files) {
    for (const f of files) {
        if (!pendingImportFiles.find(p => p.name === f.name)) {
            pendingImportFiles.push(f);
        }
    }
    renderImportFileList();
}

function removeImportFile(index) {
    pendingImportFiles.splice(index, 1);
    renderImportFileList();
}

function renderImportFileList() {
    const container = document.getElementById('importFileList');
    const btn = document.getElementById('btnImport');
    if (pendingImportFiles.length === 0) {
        container.innerHTML = '';
        btn.disabled = true;
        return;
    }
    btn.disabled = false;
    btn.textContent = `Import ${pendingImportFiles.length} file`;
    container.innerHTML = `<div class="import-files">${pendingImportFiles.map((f, i) =>
        `<div class="import-file-item">
            <span>\ud83d\udcc4 ${f.name}</span>
            <span class="text-muted">${(f.size / 1024).toFixed(1)} KB</span>
            <button class="btn btn-ghost btn-sm" onclick="removeImportFile(${i})">\u274c</button>
        </div>`
    ).join('')}</div>`;
}

async function importFiles() {
    const folder = document.getElementById('importFolder').value;
    const btn = document.getElementById('btnImport');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Importing...';

    let success = 0, failed = 0;

    for (const file of pendingImportFiles) {
        try {
            const content = await readFileAsText(file);
            const title = extractTitleFromMarkdown(content, file.name);

            const res = await fetch('/api/content/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, folder, content })
            });
            const data = await res.json();
            if (data.success) success++;
            else failed++;
        } catch (err) {
            failed++;
        }
    }

    toast(`Imported: ${success} th\u00e0nh c\u00f4ng${failed > 0 ? `, ${failed} l\u1ed7i` : ''}`, success > 0 ? 'success' : 'error');
    hideImportModal();
    loadContent();
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function extractTitleFromMarkdown(content, filename) {
    // Try to get title from frontmatter
    const fmMatch = content.match(/^---\s*\n[\s\S]*?title:\s*["']?(.+?)["']?\s*\n[\s\S]*?---/m);
    if (fmMatch) return fmMatch[1];
    // Try first heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1];
    // Fall back to filename
    return filename.replace(/\.(md|markdown)$/, '').replace(/[-_]/g, ' ');
}

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
