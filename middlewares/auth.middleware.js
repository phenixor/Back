const jwt = require('jsonwebtoken');
require('dotenv').config(); // Charger les variables d'environnement à partir du fichier .env

module.exports = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            console.log(err)
            console.log(process.env.JWT_SECRET)
            console.log(token)
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        req.userId = decodedToken.userId;
        next();
    });
};
