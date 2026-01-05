// Downloads Folder Scanner
// Allows voice search of local Downloads folder

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get downloads folder path
const getDownloadsPath = () => {
    return path.join(os.homedir(), 'Downloads');
};

// Scan downloads folder for files
const scanDownloads = (filter = null) => {
    const downloadsPath = getDownloadsPath();
    
    try {
        const files = fs.readdirSync(downloadsPath);
        
        let fileList = files.map(file => {
            const filePath = path.join(downloadsPath, file);
            const stats = fs.statSync(filePath);
            const ext = path.extname(file).toLowerCase();
            
            return {
                name: file,
                path: filePath,
                size: stats.size,
                modified: stats.mtime,
                extension: ext,
                type: getFileType(ext)
            };
        }).filter(f => !f.name.startsWith('.')); // Hide hidden files
        
        // Apply filter if provided
        if (filter) {
            const lowerFilter = filter.toLowerCase();
            fileList = fileList.filter(f => 
                f.name.toLowerCase().includes(lowerFilter) ||
                f.type.toLowerCase().includes(lowerFilter)
            );
        }
        
        // Sort by modified date (newest first)
        fileList.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        
        return fileList;
    } catch (err) {
        console.error('Error scanning downloads:', err);
        return [];
    }
};

// Get file type from extension
const getFileType = (ext) => {
    const types = {
        '.pdf': 'PDF Document',
        '.xlsx': 'Excel Spreadsheet',
        '.xls': 'Excel Spreadsheet',
        '.csv': 'CSV Data',
        '.docx': 'Word Document',
        '.doc': 'Word Document',
        '.jpg': 'Image',
        '.jpeg': 'Image',
        '.png': 'Image',
        '.gif': 'Image',
        '.webp': 'Image',
        '.mp4': 'Video',
        '.mov': 'Video',
        '.webm': 'Video',
        '.dwg': 'CAD Drawing',
        '.dxf': 'CAD Drawing',
        '.glb': '3D Model',
        '.gltf': '3D Model',
        '.obj': '3D Model',
        '.fbx': '3D Model',
        '.zip': 'Archive',
        '.rar': 'Archive'
    };
    return types[ext] || 'File';
};

// Search for specific file by voice query
const findFileByVoice = (voiceQuery) => {
    const files = scanDownloads();
    const query = voiceQuery.toLowerCase()
        .replace(/download|folder|the|file|called|named|find|get|upload/g, '')
        .trim();
    
    if (!query) return [];
    
    // Score each file
    const scored = files.map(file => {
        const name = file.name.toLowerCase();
        let score = 0;
        
        // Exact match
        if (name === query) score += 100;
        
        // Starts with query
        if (name.startsWith(query)) score += 50;
        
        // Contains query
        if (name.includes(query)) score += 30;
        
        // Contains all words from query
        const words = query.split(/\s+/);
        const matchedWords = words.filter(w => name.includes(w));
        score += (matchedWords.length / words.length) * 20;
        
        // Prefer PDFs and catalogs
        if (file.extension === '.pdf') score += 5;
        if (name.includes('catalog') || name.includes('catalogue')) score += 10;
        if (name.includes('vistaview') || name.includes('vista')) score += 15;
        
        return { ...file, score };
    });
    
    // Return top matches
    return scored
        .filter(f => f.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
};

module.exports = {
    scanDownloads,
    findFileByVoice,
    getDownloadsPath
};

// Express routes
if (typeof app !== 'undefined') {
    // List downloads
    app.get('/api/downloads', (req, res) => {
        const { filter, type } = req.query;
        let files = scanDownloads(filter);
        
        if (type) {
            files = files.filter(f => f.extension === `.${type}` || f.type.toLowerCase().includes(type.toLowerCase()));
        }
        
        res.json({
            path: getDownloadsPath(),
            files: files.slice(0, 50) // Limit to 50 files
        });
    });
    
    // Voice search downloads
    app.post('/api/downloads/voice-search', (req, res) => {
        const { query } = req.body;
        const matches = findFileByVoice(query);
        
        res.json({
            query,
            matches,
            bestMatch: matches.length > 0 ? matches[0] : null
        });
    });
    
    // Read file for upload
    app.get('/api/downloads/file/:filename', (req, res) => {
        const filePath = path.join(getDownloadsPath(), req.params.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        res.sendFile(filePath);
    });
    
    console.log('✅ Downloads scanner routes loaded');
}
