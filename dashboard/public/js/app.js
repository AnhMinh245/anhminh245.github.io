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

    // Separate articles from system files (_index, index)
    const articles = filtered.filter(f => !f.name.startsWith('_index') && f.name !== 'index');
    const systemFiles = filtered.filter(f => f.name.startsWith('_index') || f.name === 'index');

    // Update article count (only real articles)
    document.getElementById('articleCount').textContent = `(${articles.length} bài viết)`;

    let html = articles.map(file => renderFileRow(file)).join('');

    if (systemFiles.length > 0) {
        html += `<div class="system-files-divider" onclick="toggleSystemFiles()">
            <span id="systemToggle">▸</span> Trang danh mục (${systemFiles.length})
        </div>
        <div class="system-files-list hidden" id="systemFilesList">
            ${systemFiles.map(file => renderFileRow(file, true)).join('')}
        </div>`;
    }

    list.innerHTML = html;
}

function renderFileRow(file, isSystem = false) {
    const parts = file.path.replace('content/', '').split('/');
    const folder = parts.length > 1 ? parts.slice(0, -1).join('/') + '/' : '';
    const isSelected = selectedFiles.has(file.path);
    const escapedPath = file.path.replace(/'/g, "\\'");
    const escapedName = file.name.replace(/'/g, "\\'");

    return `
      <div class="content-item ${isSelected ? 'selected' : ''} ${isSystem ? 'system-file' : ''}" onclick="toggleFile('${escapedPath}')">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFile('${escapedPath}')">
        <span class="file-name">${file.name}${folder ? `<span class="file-folder">${folder}</span>` : ''}</span>
        <span class="file-status ${file.status}">${statusLabel(file.status)}</span>
        <button class="btn btn-ghost btn-preview" onclick="event.stopPropagation(); previewFile('${escapedPath}')" title="Preview">👁️</button>
        <button class="btn btn-ghost btn-delete" onclick="event.stopPropagation(); promptDeleteSingle('${escapedPath}', '${escapedName}')" title="Xóa">🗑️</button>
      </div>`;
}

function toggleSystemFiles() {
    const list = document.getElementById('systemFilesList');
    const toggle = document.getElementById('systemToggle');
    list.classList.toggle('hidden');
    toggle.textContent = list.classList.contains('hidden') ? '▸' : '▾';
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
    const btnDel = document.getElementById('btnBulkDelete');
    const btnExport = document.getElementById('btnExport');
    if (selectedFiles.size > 0) {
        btnDel.classList.remove('hidden');
        btnDel.textContent = `🗑️ Xóa (${selectedFiles.size})`;
        btnExport.classList.remove('hidden');
        btnExport.textContent = `📤 Export (${selectedFiles.size})`;
    } else {
        btnDel.classList.add('hidden');
        btnExport.classList.add('hidden');
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
async function previewFile(filePath) {
    try {
        const res = await fetch('/api/content/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath })
        });
        const data = await res.json();
        if (data.success) {
            const frame = document.getElementById('previewFrame');
            const placeholder = document.getElementById('previewPlaceholder');
            placeholder.classList.add('hidden');
            frame.classList.remove('hidden');

            // Strip frontmatter
            const content = data.content.replace(/^---[\s\S]*?---\n/m, '');

            // Render with marked.js via CDN
            const html = `<!DOCTYPE html>
<html><head>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
body { font-family: 'Inter', sans-serif; padding: 28px 32px; max-width: 760px; margin: 0 auto; line-height: 1.75; color: #e6edf3; background: #0d1117; }
h1 { font-size: 1.8em; border-bottom: 1px solid #21262d; padding-bottom: 8px; margin: 1.2em 0 0.6em; }
h2 { font-size: 1.4em; border-bottom: 1px solid #21262d; padding-bottom: 6px; margin: 1.2em 0 0.5em; color: #58a6ff; }
h3 { font-size: 1.15em; margin: 1em 0 0.4em; color: #79c0ff; }
a { color: #58a6ff; text-decoration: none; }
a:hover { text-decoration: underline; }
p { margin: 0.6em 0; }
blockquote { border-left: 3px solid #58a6ff; margin: 1em 0; padding: 0.5em 1em; background: rgba(88,166,255,0.06); border-radius: 0 6px 6px 0; color: #8b949e; }
blockquote p { margin: 0.3em 0; }
pre { background: #161b22; padding: 14px 18px; border-radius: 8px; overflow-x: auto; border: 1px solid #30363d; }
code { background: #161b22; padding: 2px 6px; border-radius: 4px; font-size: 0.88em; font-family: 'Consolas', 'Fira Code', monospace; color: #79c0ff; }
pre code { background: none; padding: 0; color: #e6edf3; }
table { width: 100%; border-collapse: collapse; margin: 1em 0; }
th { background: #161b22; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #30363d; color: #58a6ff; }
td { padding: 8px 12px; border: 1px solid #21262d; }
tr:nth-child(even) { background: rgba(255,255,255,0.02); }
img { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }
ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
li { margin: 0.25em 0; }
hr { border: none; border-top: 1px solid #21262d; margin: 1.5em 0; }
details { margin: 0.5em 0; background: #161b22; padding: 8px 12px; border-radius: 6px; }
summary { cursor: pointer; font-weight: 600; }
strong { color: #f0f6fc; }
</style>
</head><body>
<div id="content"></div>
<script>
document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(content)});
<\/script>
</body></html>`;
            frame.srcdoc = html;
        }
    } catch (err) {
        toast('Cannot load preview: ' + err.message, 'error');
    }
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
    if (e.key === 'Escape') { hideNewPostModal(); hideImportModal(); hideDeleteModal(); }
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
    document.getElementById('anytypeFolderPath').value = '';
    document.getElementById('anytypeCategory').value = '';
    switchImportTab('anytype');
    document.getElementById('importModal').classList.remove('hidden');
}

function switchImportTab(tab) {
    document.getElementById('tabAnytype').classList.toggle('active', tab === 'anytype');
    document.getElementById('tabFile').classList.toggle('active', tab === 'file');
    document.getElementById('importTabAnytype').classList.toggle('hidden', tab !== 'anytype');
    document.getElementById('importTabFile').classList.toggle('hidden', tab !== 'file');
}

async function importAnytypeFolder() {
    const folderPath = document.getElementById('anytypeFolderPath').value.trim();
    if (!folderPath) {
        toast('Vui lòng nhập đường dẫn thư mục export từ Anytype', 'error');
        return;
    }

    const category = document.getElementById('anytypeCategory').value;
    const btn = document.getElementById('btnImportAnytype');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Importing...';

    try {
        const res = await fetch('/api/import/anytype-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderPath, category })
        });
        const data = await res.json();

        if (data.success) {
            const s = data.summary;
            let msg = `Import thành công: ${s.articles} bài viết`;
            if (s.images > 0) msg += ` + ${s.images} ảnh`;
            if (data.imported.length > 0) {
                const item = data.imported[0];
                msg += ` → ${item.category}/`;
                if (item.tags.length > 0) msg += ` [${item.tags.join(', ')}]`;
            }
            toast(msg, 'success');
            hideImportModal();
            loadContent();
        } else {
            toast('Import lỗi: ' + data.error, 'error');
        }
    } catch (err) {
        toast('Lỗi: ' + err.message, 'error');
    }

    btn.disabled = false;
    btn.textContent = '📦 Import';
}

function hideImportModal() {
    document.getElementById('importModal').classList.add('hidden');
    pendingImportFiles = [];
}

function handleImportDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f =>
        f.name.endsWith('.md') || f.name.endsWith('.markdown') || f.name.endsWith('.zip')
    );
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

    // Check if any file is a ZIP
    const zipFiles = pendingImportFiles.filter(f => f.name.endsWith('.zip'));
    const mdFiles = pendingImportFiles.filter(f => !f.name.endsWith('.zip'));

    let success = 0, failed = 0, imgCount = 0;

    // Handle ZIP files via /api/import/zip
    for (const file of zipFiles) {
        try {
            const base64 = await readFileAsBase64(file);
            const res = await fetch('/api/import/zip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ zipBase64: base64, folder })
            });
            const data = await res.json();
            if (data.success) {
                success += data.summary.markdown;
                imgCount += data.summary.images;
            } else {
                failed++;
            }
        } catch (err) {
            failed++;
        }
    }

    // Handle regular .md files
    for (const file of mdFiles) {
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

    let msg = `Imported: ${success} bài viết`;
    if (imgCount > 0) msg += ` + ${imgCount} ảnh`;
    if (failed > 0) msg += `, ${failed} lỗi`;
    toast(msg, success > 0 ? 'success' : 'error');
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

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            resolve(dataUrl.split(',')[1]); // strip data:...;base64, prefix
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
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
// Export
// ========================================
async function exportSelected() {
    if (selectedFiles.size === 0) return;

    const filePaths = Array.from(selectedFiles);
    toast(`Đang tạo ZIP cho ${filePaths.length} bài viết...`, 'info');

    try {
        const res = await fetch('/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePaths })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Export failed');
        }

        // Download the ZIP
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'export.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast(`Xuất thành công ${filePaths.length} bài viết + ảnh đính kèm`, 'success');
    } catch (err) {
        toast('Export lỗi: ' + err.message, 'error');
    }
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
