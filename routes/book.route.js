const express = require("express");
const multer = require("multer");
const bookController = require("../controllers/book.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Crée un router Express
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/books", authMiddleware, upload.single("image"), bookController.createBook);
router.get("/books", bookController.getAllBooks);
router.get("/books/:id", bookController.getBookById);
router.get("/books/bestrating", bookController.getBooksByRating);
router.post("/books/:id/rating", authMiddleware, bookController.addRating);
router.delete("/books/:id", authMiddleware, bookController.deleteBook);

module.exports = router;