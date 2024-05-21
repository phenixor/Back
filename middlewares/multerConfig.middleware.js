const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() }).single('image'); // 'image' should match the field name used by the client

module.exports = upload;
