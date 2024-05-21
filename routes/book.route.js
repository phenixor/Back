const express = require("express");
const bookController = require("../controllers/book.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require('../middlewares/multerConfig.middleware');
const convertImage = require('../middlewares/convertImage.middleware');

const router = express.Router();

router.get("/books/bestrating", bookController.getBooksByRating);
router.post("/books", authMiddleware, upload, convertImage, bookController.createBook);
router.get("/books", bookController.getAllBooks);
router.get("/books/:id", bookController.getBookById);
router.put("/books/:id", authMiddleware, upload, convertImage, bookController.updateBook);
router.post("/books/:id/rating", authMiddleware, bookController.addRating);
router.delete("/books/:id", authMiddleware, bookController.deleteBook);

module.exports = router;
