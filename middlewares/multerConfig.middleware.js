const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Définir le dossier de destination où Multer stockera les fichiers téléchargés
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Utiliser un nom de fichier unique en ajoutant un horodatage au nom d'origine du fichier
    }
});

const upload = multer({ storage: storage });

module.exports = upload;