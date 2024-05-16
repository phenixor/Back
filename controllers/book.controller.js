const Book = require("../models/book.model");
const fs = require("fs");
const path = require("path");

exports.createBook = async (req, res) => {
    try {
        const { book } = req.body;
        const bookObject = JSON.parse(book);
        const imageUrl = req.file.path; // Récupérer le chemin de l'image enregistrée par Multer
        const userId = req.userId; // Récupérer l'ID de l'utilisateur à partir du token JWT

        const newBook = new Book({
            ...bookObject,
            imageUrl: imageUrl,
            userId: userId, // Associer l'ID de l'utilisateur au livre
        });

        await newBook.save();

        return res.status(201).json({ message: "Book created successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getAllBooks = (req, res) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(500).json({ error }));
};

exports.getBookById = (req, res) => {
    const { id } = req.params;

    Book.findById(id)
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: "Book not found" });
            }
            res.status(200).json(book);
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getBooksByRating = async (req, res) => {
    try {
        const books = await Book.find();
        const sortedBooks = books.sort((a, b) => b.averageRating - a.averageRating);
        const topThreeBooks = sortedBooks.slice(0, 3);
        res.status(200).json(topThreeBooks);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
    }
};


exports.addRating = async (req, res) => {
    const { rating } = req.body;
    const userId = req.userId;
    const { id } = req.params;

    if (typeof rating !== "number" || rating < 0 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({ message: "Rating must be an integer between 0 and 5" });
    }

    try {
        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        const userRating = book.ratings.find(rating => rating.userId.toString() === userId);
        if (userRating) {
            return res.status(400).json({ message: "User has already rated this book" });
        }

        book.ratings.push({ userId, grade: rating });

        const sumRatings = book.ratings.reduce((total, current) => total + current.grade, 0);
        book.averageRating = sumRatings / book.ratings.length;

        await book.save();

        return res.status(201).json({ message: "Rating added successfully", book });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.deleteBook = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.userId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You are not authorized to delete this book" });
        }

        if (book.imageUrl) {
            fs.unlinkSync(book.imageUrl);
        }

        await book.remove();

        return res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { title, author, year, genre } = req.body;
        let imageUrl = req.body.imageUrl;

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.userId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You are not authorized to update this book" });
        }

        if (req.file) {
            imageUrl = req.file.path;
            if (book.imageUrl) {
                fs.unlinkSync(book.imageUrl);
            }
        }

        book.title = title;
        book.author = author;
        book.year = year;
        book.genre = genre;
        book.imageUrl = imageUrl;

        await book.save();

        return res.status(200).json({ message: "Book updated successfully", book });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
