const express = require('express');
const router = express.Router();
const gitManager = require('../services/git-manager');
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '..', '..', 'content');

// GET /api/content — List all content files with git status
router.get('/', async (req, res) => {
    try {
        const allFiles = await gitManager.listAllContent();
        const changes = await gitManager.getContentStatus();

        // Merge status info into file list
        const files = allFiles.map(file => {
            const change = changes.find(c => c.path === file.path);
            return {
                ...file,
                status: change ? change.status : 'unmodified',
                hasChanges: !!change
            };
        });

        // Add new files that aren't yet tracked
        for (const change of changes) {
            if (change.status === 'new' && !files.find(f => f.path === change.path)) {
                files.push({
                    path: change.path,
                    name: change.name,
                    status: 'new',
                    hasChanges: true,
                    size: 0,
                    modified: new Date()
                });
            }
        }

        // Add deleted files
        for (const change of changes) {
            if (change.status === 'deleted') {
                files.push({
                    path: change.path,
                    name: change.name,
                    status: 'deleted',
                    hasChanges: true
                });
            }
        }

        res.json({
            success: true,
            files,
            totalChanged: changes.length,
            total: files.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/content/:filename — Read a single markdown file
router.get('/:filename', (req, res) => {
    try {
        const filePath = path.join(CONTENT_DIR, `${req.params.filename}.md`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({ success: true, content, filename: req.params.filename });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/content/new — Create a new markdown file
router.post('/new', (req, res) => {
    try {
        const { title, folder, tags, content } = req.body;
        if (!title) return res.status(400).json({ success: false, error: 'Title required' });

        const slug = title
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Determine target directory
        const targetDir = folder
            ? path.join(CONTENT_DIR, folder)
            : CONTENT_DIR;

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Build frontmatter
        const date = new Date().toISOString().split('T')[0];
        let frontmatter = `---\ntitle: "${title}"\ndate: ${date}`;

        if (tags && tags.trim()) {
            const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
            if (tagList.length > 0) {
                frontmatter += `\ntags:\n${tagList.map(t => `  - ${t}`).join('\n')}`;
            }
        }

        frontmatter += `\n---\n\n`;

        // Build markdown content
        const body = content && content.trim()
            ? content
            : `# ${title}\n\n`;

        const mdContent = frontmatter + body;
        const filePath = path.join(targetDir, `${slug}.md`);
        fs.writeFileSync(filePath, mdContent, 'utf-8');

        const relPath = folder
            ? `content/${folder}/${slug}.md`
            : `content/${slug}.md`;

        res.json({ success: true, path: relPath, slug });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/content/delete — Delete a content file
router.post('/delete', (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath) return res.status(400).json({ success: false, error: 'File path required' });

        // Security: resolve and check the file is within CONTENT_DIR
        const absPath = path.resolve(__dirname, '..', '..', filePath);
        if (!absPath.startsWith(CONTENT_DIR)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absPath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        fs.unlinkSync(absPath);
        res.json({ success: true, deleted: filePath });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
