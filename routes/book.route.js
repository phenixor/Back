const express = require("express");
const bookController = require("../controllers/book.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require('../middlewares/multerConfig.middleware'); // Importez le middleware Multer

// Crée un router Express
const router = express.Router();

router.post("/books", authMiddleware, upload.single("imageUrl"), bookController.createBook); // Utilisez Multer pour gérer le téléchargement d'une seule image
router.get("/books", bookController.getAllBooks);
router.get("/books/:id", bookController.getBookById);
router.get("/books/bestrating", bookController.getBooksByRating);
router.post("/books/:id/rating", authMiddleware, bookController.addRating);
router.delete("/books/:id", authMiddleware, bookController.deleteBook);

module.exports = router;
