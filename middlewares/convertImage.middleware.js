const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const convertImage = (req, res, next) => {
    // Check if req.file is present, if not, pass control to the next middleware
    if (!req.file) return next();

    // Destructure originalname and buffer from req.file
    const { originalname, buffer } = req.file;

    // Extract the original file name without extension
    const originalFileName = path.parse(originalname).name;

    // Construct the output path with a timestamped filename in the uploads directory
    const outputPath = path.join(__dirname, '../uploads', `${originalFileName}-${Date.now()}.webp`);

    // Ensure the directory path exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Use sharp to convert the image buffer to WebP format with quality 80 and save it to the output path
    sharp(buffer)
        .webp({ quality: 80 })
        .toFile(outputPath)
        .then(() => {
            // Update req.file with the new path and filename
            req.file.path = outputPath;
            req.file.filename = path.basename(outputPath);
            next();
        })
        .catch(err => {
            // Log error and send a 500 status response if image processing fails
            console.error('Sharp error:', err);
            res.status(500).json({ error: 'Error processing image' });
        });
};

module.exports = convertImage;

