const Book = require("../models/book.model");
const fs = require("fs");
const path = require("path");

exports.createBook = async (req, res) => {
    try {
        // Extraire les données du corps de la requête
        const { title, author, year, genre } = req.body;
        const imageUrl = req.file.path; // Récupérer le chemin de l'image enregistrée par Multer
        const userId = req.userId; // Récupérer l'ID de l'utilisateur à partir du token JWT

        // Créer un nouveau livre avec les données fournies, y compris l'ID de l'utilisateur
        const newBook = new Book({
            title: title,
            author: author,
            year: year,
            genre: genre,
            imageUrl: imageUrl,
            userId: userId, // Associer l'ID de l'utilisateur au livre
            averageRating: 0, // Initialiser la note moyenne à 0
            ratings: [] // Initialiser le tableau de notation avec un tableau vide
        });

        // Enregistrer le nouveau livre dans la base de données
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
}

exports.getBookById = (req, res) => {
  const { id } = req.params;

  Book.findById(id)
      .then(book => {
          if (!book) {
              return res.status(404).json({ message: "Livre non trouvé" });
          }
          res.status(200).json(book);
      })
      .catch(error => res.status(500).json({ error }));
}

exports.getBooksByRating = (req, res) => {
  Book.find()
      .sort({ rating: -1 }) // Trier les livres par note décroissante
      .then(books => {
          // Inclure le rating dans la réponse pour chaque livre
          const booksWithRating = books.map(book => ({
              _id: book._id,
              title: book.title,
              rating: book.rating
          }));
          res.status(200).json(booksWithRating);
      })
      .catch(error => res.status(500).json({ error }));
}

exports.addRating = async (req, res) => {
  const { userId, rating } = req.body;
  const { id } = req.params;

  // Vérifier que la note est un nombre entre 0 et 5 inclusivement
  if (typeof rating !== "number" || rating < 0 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: "Rating must be an integer between 0 and 5" });
  }

  try {
      // Récupérer le livre par son ID
      const book = await Book.findById(id);

      if (!book) {
          return res.status(404).json({ message: "Book not found" });
      }

      // Vérifier si l'utilisateur a déjà noté ce livre
      const userRating = book.ratings.find(rating => rating.userId === userId);
      if (userRating) {
          return res.status(400).json({ message: "User has already rated this book" });
      }

      // Ajouter la nouvelle note au tableau de notations
      book.ratings.push({ userId, rating });

      // Recalculer la note moyenne du livre
      const sumRatings = book.ratings.reduce((total, current) => total + current.rating, 0);
      book.averageRating = sumRatings / book.ratings.length;

      // Enregistrer les modifications dans la base de données
      await book.save();

      return res.status(201).json({ message: "Rating added successfully", book });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // ID de l'utilisateur connecté

  try {
      // Recherchez le livre dans la base de données par son ID
      const book = await Book.findById(id);

      if (!book) {
          return res.status(404).json({ message: "Book not found" });
      }

      // Vérifiez si l'utilisateur connecté est l'auteur du livre
      if (book.author.toString() !== userId) {
          return res.status(403).json({ message: "Unauthorized: You are not authorized to delete this book" });
      }

      // Supprimez le livre de la base de données
      await book.remove();

      return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId; // Récupérer l'ID de l'utilisateur à partir du token JWT
        const { title, author, year, genre } = req.body;
        let imageUrl = req.body.imageUrl; // Récupérer le chemin de la nouvelle image

        // Vérifier si le livre existe
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Vérifier si l'utilisateur est autorisé à mettre à jour ce livre
        if (book.userId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You are not authorized to update this book" });
        }

        // Si une nouvelle image est téléchargée, mettre à jour le chemin de l'image
        if (req.file) {
            imageUrl = req.file.path;
            // Supprimer l'ancienne image si elle existe
            if (book.imageUrl) {
                fs.unlinkSync(book.imageUrl);
            }
        }

        // Mettre à jour les données du livre
        book.title = title;
        book.author = author;
        book.year = year;
        book.genre = genre;
        book.imageUrl = imageUrl;

        // Enregistrer les modifications dans la base de données
        await book.save();

        return res.status(200).json({ message: "Book updated successfully", book });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};