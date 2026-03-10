/**
 * Import from Anytype Export Folder
 * 
 * Reads an Anytype Markdown export folder (contains .md + files/ with images)
 * and imports into the content directory with proper Quartz frontmatter.
 */

const express = require('express');
const router = express.Router();
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '..', '..', 'content');
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// ──────────────────────────────────────────
// POST /api/import/anytype-folder
// Body: { folderPath: "C:/path/to/Anytype.xxxxx", category: "tech" }
// ──────────────────────────────────────────
router.post('/anytype-folder', async (req, res) => {
    try {
        const { folderPath, category } = req.body;
        if (!folderPath) {
            return res.status(400).json({ success: false, error: 'Folder path required' });
        }

        const absFolder = path.resolve(folderPath);
        if (!fs.existsSync(absFolder) || !fs.statSync(absFolder).isDirectory()) {
            return res.status(400).json({ success: false, error: `Folder not found: ${absFolder}` });
        }

        // Find .md files in the folder (Anytype puts one .md per export)
        const mdFiles = fs.readdirSync(absFolder).filter(f => f.endsWith('.md'));
        if (mdFiles.length === 0) {
            return res.status(400).json({ success: false, error: 'No .md files found in folder' });
        }

        const results = [];

        for (const mdFile of mdFiles) {
            const mdPath = path.join(absFolder, mdFile);
            const rawContent = fs.readFileSync(mdPath, 'utf-8');

            // Parse Anytype frontmatter
            const parsed = parseAnytypeFrontmatter(rawContent);

            // Determine target category
            const targetCategory = category || guessCategory(parsed.tags) || 'other';
            const targetDir = path.join(CONTENT_DIR, targetCategory);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            // Generate slug from title or filename
            const title = parsed.title || mdFile.replace('.md', '');
            const slug = slugify(title);

            // Clean the markdown body (pass category to fix image paths)
            const cleanedBody = cleanMarkdownBody(parsed.body, targetCategory);

            // Extract description from body
            const description = extractDescription(cleanedBody);

            // Build proper Quartz frontmatter
            const tagList = parsed.tags.filter(t => t.toLowerCase() !== 'publish');
            const tagsYaml = tagList.length > 0 ? `\ntags:\n${tagList.map(t => `  - ${t}`).join('\n')}` : '';
            const descYaml = description ? `\ndescription: "${description.replace(/"/g, '\\"')}"` : '';
            const dateStr = parsed.creationDate || new Date().toISOString().split('T')[0];

            const quartzMd = `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndate: ${dateStr}${tagsYaml}${descYaml}\n---\n\n${cleanedBody}`;

            // Write markdown file
            const targetMdPath = path.join(targetDir, `${slug}.md`);
            fs.writeFileSync(targetMdPath, quartzMd, 'utf-8');

            // Copy images from files/ folder
            const filesDir = path.join(absFolder, 'files');
            let imagesCopied = 0;
            if (fs.existsSync(filesDir) && fs.statSync(filesDir).isDirectory()) {
                const targetFilesDir = path.join(targetDir, 'files');
                if (!fs.existsSync(targetFilesDir)) {
                    fs.mkdirSync(targetFilesDir, { recursive: true });
                }

                // Only copy images that are referenced in the markdown
                const referencedImages = extractReferencedImages(cleanedBody);
                const allFiles = fs.readdirSync(filesDir);

                for (const imgFile of allFiles) {
                    const isReferenced = referencedImages.has(imgFile) || referencedImages.size === 0;
                    if (isReferenced || isImageFile(imgFile)) {
                        const srcPath = path.join(filesDir, imgFile);
                        const destPath = path.join(targetFilesDir, imgFile);
                        if (fs.statSync(srcPath).isFile()) {
                            fs.copyFileSync(srcPath, destPath);
                            imagesCopied++;
                        }
                    }
                }
            }

            results.push({
                file: `${slug}.md`,
                path: `content/${targetCategory}/${slug}.md`,
                title,
                category: targetCategory,
                images: imagesCopied,
                tags: tagList,
            });
        }

        res.json({
            success: true,
            imported: results,
            summary: {
                articles: results.length,
                images: results.reduce((sum, r) => sum + r.images, 0),
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ──────────────────────────────────────────
// POST /api/import/zip
// Body: { zipBase64, folder (optional) }
// ──────────────────────────────────────────
router.post('/zip', (req, res) => {
    try {
        const { zipBase64, folder } = req.body;
        if (!zipBase64) {
            return res.status(400).json({ success: false, error: 'No ZIP data provided' });
        }

        const zipBuffer = Buffer.from(zipBase64, 'base64');
        const zip = new AdmZip(zipBuffer);
        const entries = zip.getEntries();

        const imported = [];
        const errors = [];

        for (const entry of entries) {
            if (entry.isDirectory) continue;

            const entryName = entry.entryName.replace(/\\/g, '/');
            const ext = path.extname(entryName).toLowerCase();

            if (ext === '.md' || ext === '.markdown') {
                const mdContent = entry.getData().toString('utf-8');
                const baseName = path.basename(entryName);

                let targetDir;
                const zipDir = path.dirname(entryName);
                if (folder) {
                    targetDir = path.join(CONTENT_DIR, folder);
                } else if (zipDir && zipDir !== '.' && zipDir !== '/') {
                    targetDir = path.join(CONTENT_DIR, zipDir);
                } else {
                    targetDir = CONTENT_DIR;
                }

                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                const targetPath = path.join(targetDir, baseName);
                if (!targetPath.startsWith(CONTENT_DIR)) {
                    errors.push({ file: entryName, error: 'Access denied' });
                    continue;
                }

                fs.writeFileSync(targetPath, mdContent, 'utf-8');
                const relPath = 'content/' + path.relative(CONTENT_DIR, targetPath).replace(/\\/g, '/');
                imported.push({ file: baseName, path: relPath, type: 'markdown' });

            } else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'].includes(ext)) {
                const imgData = entry.getData();
                const imgName = path.basename(entryName);
                const imgDir = path.dirname(entryName);

                let targetDir;
                if (folder) {
                    targetDir = path.join(CONTENT_DIR, folder, imgDir !== '.' ? imgDir : 'files');
                } else if (imgDir && imgDir !== '.' && imgDir !== '/') {
                    targetDir = path.join(CONTENT_DIR, imgDir);
                } else {
                    targetDir = path.join(CONTENT_DIR, 'files');
                }

                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                const targetPath = path.join(targetDir, imgName);
                if (!targetPath.startsWith(CONTENT_DIR)) {
                    errors.push({ file: entryName, error: 'Access denied' });
                    continue;
                }

                fs.writeFileSync(targetPath, imgData);
                imported.push({ file: imgName, path: path.relative(REPO_ROOT, targetPath).replace(/\\/g, '/'), type: 'image' });
            }
        }

        res.json({
            success: true,
            imported,
            errors,
            summary: {
                markdown: imported.filter(f => f.type === 'markdown').length,
                images: imported.filter(f => f.type === 'image').length,
                errors: errors.length,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ──────────────────────────────────────────
// POST /api/export
// Body: { filePaths: ["content/tech/article.md", ...] }
// Response: ZIP file download
// ──────────────────────────────────────────
router.post('/', (req, res) => {
    try {
        const { filePaths } = req.body;
        if (!filePaths || filePaths.length === 0) {
            return res.status(400).json({ success: false, error: 'No files to export' });
        }

        const zip = new AdmZip();

        for (const fp of filePaths) {
            const absPath = path.resolve(REPO_ROOT, fp);
            if (!absPath.startsWith(CONTENT_DIR)) continue;
            if (!fs.existsSync(absPath)) continue;

            const mdContent = fs.readFileSync(absPath, 'utf-8');
            const relPath = path.relative(CONTENT_DIR, absPath);
            zip.addFile(relPath.replace(/\\/g, '/'), Buffer.from(mdContent, 'utf-8'));

            // Find referenced images
            const imageRefs = extractAllImagePaths(mdContent);
            const mdDir = path.dirname(absPath);

            for (const imgRef of imageRefs) {
                const candidates = [
                    path.resolve(mdDir, imgRef),
                    path.resolve(CONTENT_DIR, imgRef),
                    path.resolve(REPO_ROOT, imgRef),
                ];

                for (const imgPath of candidates) {
                    if (fs.existsSync(imgPath) && imgPath.startsWith(REPO_ROOT)) {
                        const imgRelPath = path.dirname(relPath) + '/' + imgRef;
                        try {
                            zip.addLocalFile(imgPath, path.dirname(imgRelPath).replace(/\\/g, '/'), path.basename(imgRef));
                        } catch (e) { /* skip duplicate */ }
                        break;
                    }
                }
            }
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const name = filePaths.length === 1
            ? path.basename(filePaths[0], '.md')
            : `anypress-export-${filePaths.length}-articles`;
        const zipName = `${name}_${timestamp}.zip`;

        const zipBuffer = zip.toBuffer();
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${zipName}"`,
            'Content-Length': zipBuffer.length,
        });
        res.send(zipBuffer);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// ──────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────

/**
 * Parse Anytype's YAML-like frontmatter.
 * Returns: { title, tags, creationDate, body }
 */
function parseAnytypeFrontmatter(raw) {
    const result = { title: '', tags: [], creationDate: '', body: raw, links: [] };

    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fmMatch) return result;

    const fm = fmMatch[1];
    result.body = fmMatch[2];

    // Extract title from first heading in body, or from filename
    const h1Match = result.body.match(/^#\s+(.+?)[\s]*$/m);
    if (h1Match) result.title = h1Match[1].trim();

    // Parse tags
    const tagSection = fm.match(/Tag:\n((?:\s+-\s+.+\n?)*)/);
    if (tagSection) {
        result.tags = tagSection[1]
            .split('\n')
            .map(l => l.replace(/^\s+-\s+/, '').trim())
            .filter(Boolean);
    }

    // Parse creation date
    const dateMatch = fm.match(/Creation date:\s*"?(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) result.creationDate = dateMatch[1];

    return result;
}

/**
 * Clean Anytype markdown body for Quartz
 */
function cleanMarkdownBody(md, category) {
    // Remove the duplicate frontmatter block that appears in body
    md = md.replace(/^---\n[\s\S]*?\n---\n?/m, '');

    // Fix bold formatting
    md = md.replace(/\*\*([^*\n]+?)\s+\*\*/g, '**$1**');
    md = md.replace(/^(\d+)\.\*\*/gm, '$1. **');
    md = md.replace(/^(\d+\.\s+)\*\*\s+/gm, '$1**');

    // Fix image paths: files\image → {category}/files/image (content-root-relative for Quartz)
    md = md.replace(/files\\/g, 'files/');
    if (category) {
        // Rewrite relative image refs to content-root-relative
        // files/image.png → tech/files/image.png
        md = md.replace(
            /(!\[[^\]]*\]\()files\//g,
            `$1${category}/files/`
        );
    }

    // Fix trailing whitespace on lines
    md = md.replace(/\s{3,}$/gm, '');

    let lines = md.split('\n');

    // Strip excessive indentation
    lines = lines.map(line => {
        const trimmed = line.trimStart();
        const indent = line.length - trimmed.length;

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
            const level = Math.floor(indent / 4);
            if (level > 0) return '    '.repeat(level - 1) + trimmed;
        }

        if (trimmed.startsWith('|')) return cleanTableRow(trimmed);

        return trimmed.replace(/\s+$/, '');
    });

    // Fix structural issues
    let result = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const prev = result.length > 0 ? result[result.length - 1] : '';
        const isHeading = /^#{1,6}\s/.test(line);
        const isRule = /^---+$/.test(line);
        const prevIsEmpty = prev.trim() === '';

        if (isRule && result.length === 0) continue;
        if (isRule && result.every(l => l.trim() === '')) continue;

        if (isHeading && !prevIsEmpty && result.length > 0) result.push('');
        if (isRule && !prevIsEmpty && result.length > 0) result.push('');

        if (line.startsWith('>') && !prevIsEmpty && !prev.startsWith('>') && result.length > 0) {
            result.push('');
        }

        result.push(line);

        if (isHeading && i + 1 < lines.length && lines[i + 1].trim() !== '') result.push('');
        if (isRule && i + 1 < lines.length && lines[i + 1].trim() !== '') result.push('');
    }

    return result.join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim() + '\n';
}

function cleanTableRow(row) {
    const cells = row.split('|');
    const cleaned = cells.map(cell => {
        const trimmed = cell.trim();
        if (trimmed === '') return '';
        if (/^:?-+:?$/.test(trimmed)) return trimmed;
        return ' ' + trimmed + ' ';
    });
    return cleaned.join('|');
}

function extractDescription(md, maxLen = 250) {
    const lines = md.split('\n');
    const collected = [];
    for (const line of lines) {
        const t = line.trim();
        if (!t) {
            if (collected.length > 0) break;
            continue;
        }
        if (t.startsWith('#') || t.startsWith('-') || t.startsWith('*') ||
            t.startsWith('>') || t.startsWith('`') || t.startsWith('|') ||
            /^\d+\./.test(t) || /^---+$/.test(t) || t.startsWith('![')) {
            if (collected.length > 0) break;
            continue; // skip non-paragraph content
        }
        collected.push(t);
    }
    return collected.join(' ').substring(0, maxLen).trim();
}

/**
 * Guess category from Anytype tags
 */
function guessCategory(tags = []) {
    const tagNames = tags.map(t => (typeof t === 'string' ? t : '').toLowerCase());
    const mapping = [
        { folder: 'books', match: ['sach', 'book', 'books'] },
        { folder: 'insights', match: ['knowledge', 'kien-thuc', 'insights', 'insight'] },
        { folder: 'journal', match: ['daily', 'nhat-ky', 'journal', 'diary'] },
        { folder: 'tech', match: ['tech', 'technology', 'cong-nghe', 'lap-trinh', 'coding', 'datadog'] },
    ];
    for (const { folder, match } of mapping) {
        if (tagNames.some(t => match.includes(t))) return folder;
    }
    return null;
}

function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function isImageFile(name) {
    return /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(name);
}

function extractReferencedImages(md) {
    const images = new Set();
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = imgRegex.exec(md)) !== null) {
        const p = match[2].trim().replace(/\\/g, '/');
        if (!p.startsWith('http')) {
            images.add(path.basename(p));
        }
    }
    // Also match bare file references
    const bareRegex = /files\/[\w\-]+\.\w+/g;
    while ((match = bareRegex.exec(md)) !== null) {
        images.add(path.basename(match[0]));
    }
    return images;
}

function extractAllImagePaths(md) {
    const paths = new Set();
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = imgRegex.exec(md)) !== null) {
        const p = match[2].trim();
        if (!p.startsWith('http://') && !p.startsWith('https://')) {
            paths.add(p.replace(/\\/g, '/'));
        }
    }
    const fileRefRegex = /files[\\\/][\w\-]+\.\w+/g;
    while ((match = fileRefRegex.exec(md)) !== null) {
        paths.add(match[0].replace(/\\/g, '/'));
    }
    return Array.from(paths);
}

module.exports = router;
