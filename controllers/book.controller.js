const Book = require("../models/book.model");
const fs = require("fs");
const path = require("path");


exports.createBook = async (req, res) => {
    try {
        const { book } = req.body;
        const { filename } = req.file || '';
        const { userId } = req;

        const newBookData = {
            ...JSON.parse(book),
            imageUrl: filename ? `http://localhost:4000/uploads/${filename}` : '',
            userId,
        };

        const newBook = new Book(newBookData);
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

exports.getBooksByRating = (req, res) => {
    Book.find()
        .then(books => {
            return books;
        })
        .then(books => {
            const sortedBooks = books.sort((a, b) => b.averageRating - a.averageRating);
            const topThreeBooks = sortedBooks.slice(0, 3);
            res.status(200).json(topThreeBooks);
        })
        .catch(error => {
            console.error("Error retrieving books:", error); // Log des erreurs
            res.status(500).json({ error: 'Error retrieving top rated books' });
        });
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

        // Return only the rating in the response
        return res.status(201).json(book);
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
            const filename = book.imageUrl.split("http://localhost:4000/uploads")[1]
            const directory = path.join(__dirname, '../uploads', filename)
            fs.unlinkSync(directory);
        }

        await book.deleteOne();

        return res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const {book} = req.body;
        const bookjson = req.file ? JSON.parse(book) : req.body;
        const { title, author, year, genre} = bookjson;

        const bookAPI = await Book.findById(id);
        if (!bookAPI) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (bookAPI.userId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You are not authorized to update this book" });
        }

        if(req.file){
            bookAPI.imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
        }
        

        bookAPI.title = title;
        bookAPI.author = author;
        bookAPI.year = year;
        bookAPI.genre = genre;

        await bookAPI.save();

        return res.status(200).json({ message: "Book updated successfully", book });
    } catch (error) {
        console.error("Error updating book:", error);
        return res.status(500).json({ error: error.message });
    }
};
