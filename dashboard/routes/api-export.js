/**
 * Export / Import API
 * - POST /api/export — Export article(s) as ZIP (md + images)
 * - POST /api/import/zip — Import ZIP bundle (md + images)
 */

const express = require('express');
const router = express.Router();
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '..', '..', 'content');
const REPO_ROOT = path.resolve(__dirname, '..', '..');

/**
 * POST /api/export
 * Body: { filePaths: ["content/tech/article.md", ...] }
 * Response: ZIP file download
 */
router.post('/', (req, res) => {
    try {
        const { filePaths } = req.body;
        if (!filePaths || filePaths.length === 0) {
            return res.status(400).json({ success: false, error: 'No files to export' });
        }

        const zip = new AdmZip();

        for (const fp of filePaths) {
            // Security check
            const absPath = path.resolve(REPO_ROOT, fp);
            if (!absPath.startsWith(CONTENT_DIR)) continue;
            if (!fs.existsSync(absPath)) continue;

            // Read markdown
            const mdContent = fs.readFileSync(absPath, 'utf-8');

            // Get relative path within content/ for zip structure
            const relPath = path.relative(CONTENT_DIR, absPath);
            zip.addFile(relPath, Buffer.from(mdContent, 'utf-8'));

            // Find all image references in the markdown
            const imageRefs = extractImagePaths(mdContent);
            const mdDir = path.dirname(absPath);

            for (const imgRef of imageRefs) {
                // Try multiple possible locations for the image
                const candidates = [
                    path.resolve(mdDir, imgRef),                    // relative to md file
                    path.resolve(CONTENT_DIR, imgRef),              // relative to content/
                    path.resolve(REPO_ROOT, imgRef),                // relative to repo root
                ];

                for (const imgPath of candidates) {
                    if (fs.existsSync(imgPath) && imgPath.startsWith(REPO_ROOT)) {
                        // Add image to zip, preserving folder structure relative to the md file
                        const imgRelPath = path.dirname(relPath) + '/' + imgRef;
                        try {
                            zip.addLocalFile(imgPath, path.dirname(imgRelPath), path.basename(imgRef));
                        } catch (e) { /* skip if duplicate */ }
                        break;
                    }
                }
            }
        }

        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const name = filePaths.length === 1
            ? path.basename(filePaths[0], '.md')
            : `anypress-export-${filePaths.length}-articles`;
        const zipName = `${name}_${timestamp}.zip`;

        // Send ZIP as download
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

/**
 * POST /api/import/zip
 * Body: { zipBase64, folder (optional) }
 * Accepts base64-encoded ZIP, extracts .md + images to content/
 */
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
                // Markdown file — determine target location
                const mdContent = entry.getData().toString('utf-8');
                const baseName = path.basename(entryName);

                // If folder specified, use it; otherwise try to preserve zip structure
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
                // Security check
                if (!targetPath.startsWith(CONTENT_DIR)) {
                    errors.push({ file: entryName, error: 'Access denied' });
                    continue;
                }

                fs.writeFileSync(targetPath, mdContent, 'utf-8');
                const relPath = 'content/' + path.relative(CONTENT_DIR, targetPath).replace(/\\/g, '/');
                imported.push({ file: baseName, path: relPath, type: 'markdown' });

            } else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'].includes(ext)) {
                // Image file — place alongside the markdown or in files/ subfolder
                const imgData = entry.getData();
                const imgName = path.basename(entryName);
                const imgDir = path.dirname(entryName);

                // Determine target: if zip has folder structure, preserve it
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

/**
 * Extract image paths from markdown content
 * Matches: ![alt](path), files\image_xxx.png, etc.
 */
function extractImagePaths(md) {
    const paths = new Set();

    // Standard markdown images: ![alt](path)
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = imgRegex.exec(md)) !== null) {
        const imgPath = match[2].trim();
        // Skip URLs
        if (!imgPath.startsWith('http://') && !imgPath.startsWith('https://')) {
            paths.add(imgPath.replace(/\\/g, '/'));
        }
    }

    // Anytype-style references: files\image_xxx.png (without markdown syntax)
    const fileRefRegex = /files[\\\/][\w\-]+\.\w+/g;
    while ((match = fileRefRegex.exec(md)) !== null) {
        paths.add(match[0].replace(/\\/g, '/'));
    }

    return Array.from(paths);
}

module.exports = router;
