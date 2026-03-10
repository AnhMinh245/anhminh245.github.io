const express = require('express');
const router = express.Router();
const anytypeClient = require('../services/anytype-client');
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '..', '..', 'content');

// POST /api/sync — Sync content from Anytype (all spaces or selected)
router.post('/', async (req, res) => {
    try {
        // Check connection
        const conn = await anytypeClient.checkConnection();
        if (!conn.connected) {
            return res.json({
                success: false,
                error: `Cannot connect to Anytype: ${conn.error}. Make sure Anytype is running.`
            });
        }

        // Get spaces to sync: use provided spaceIds or all spaces
        const spacesResult = await anytypeClient.listSpaces();
        if (!spacesResult.success) {
            return res.json({ success: false, error: spacesResult.error });
        }

        let spaces = spacesResult.spaces;
        const requestedSpaceIds = req.body.spaceIds;
        if (requestedSpaceIds && requestedSpaceIds.length > 0) {
            spaces = spaces.filter(s => requestedSpaceIds.includes(s.id));
        }

        const tag = req.body.tag || 'publish';
        let totalSynced = 0, totalFailed = 0, totalFound = 0;
        const syncedFiles = [];
        const perSpace = [];

        // Loop through each space
        for (const space of spaces) {
            const result = await anytypeClient.listObjects(tag, space.id);
            if (!result.success) {
                perSpace.push({ id: space.id, name: space.name, found: 0, synced: 0, failed: 0, error: result.error });
                continue;
            }

            let synced = 0, failed = 0;

            for (const obj of result.objects) {
                try {
                    const exported = await anytypeClient.exportMarkdown(obj.id, undefined, space.id);
                    if (exported.success && exported.markdown) {
                        const slug = slugify(obj.name || obj.title || obj.id);
                        const subfolder = exported.targetFolder || '';
                        const targetDir = subfolder
                            ? path.join(CONTENT_DIR, subfolder)
                            : CONTENT_DIR;

                        if (!fs.existsSync(targetDir)) {
                            fs.mkdirSync(targetDir, { recursive: true });
                        }

                        const filePath = path.join(targetDir, `${slug}.md`);
                        fs.writeFileSync(filePath, exported.markdown, 'utf-8');

                        const relPath = subfolder
                            ? `content/${subfolder}/${slug}.md`
                            : `content/${slug}.md`;
                        syncedFiles.push({ name: slug, path: relPath, folder: subfolder, space: space.name });
                        synced++;
                    } else {
                        failed++;
                    }
                } catch (e) {
                    failed++;
                }
            }

            perSpace.push({ id: space.id, name: space.name, found: result.objects.length, synced, failed });
            totalFound += result.objects.length;
            totalSynced += synced;
            totalFailed += failed;
        }

        res.json({
            success: true,
            total: totalFound,
            synced: totalSynced,
            failed: totalFailed,
            spaces: perSpace,
            files: syncedFiles
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/sync/status — Check Anytype connection
router.get('/status', async (req, res) => {
    const conn = await anytypeClient.checkConnection();
    res.json(conn);
});

// GET /api/sync/spaces — List all available spaces
router.get('/spaces', async (req, res) => {
    const result = await anytypeClient.listSpaces();
    res.json(result);
});

function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

module.exports = router;
