const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = (req, res) => {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    User.findOne({ email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // Hasher le mot de passe
            bcrypt.hash(password, 10)
                .then(hashedPassword => {
                    // Créer un nouvel utilisateur avec le mot de passe hashé
                    const user = new User({
                        email,
                        password: hashedPassword
                    });

                    // Enregistrer l'utilisateur dans la base de données
                    user.save()
                        .then(() => res.status(201).json({ message: "User created" }))
                        .catch(error => res.status(500).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'utilisateur existe
  User.findOne({ email })
      .then(user => {
          if (!user) {
              return res.status(401).json({ message: "Authentication failed" });
          }

          // Vérifier le mot de passe
          bcrypt.compare(password, user.password)
              .then(validPassword => {
                  if (!validPassword) {
                      return res.status(401).json({ message: "Authentication failed" });
                  }

                  // Générer un jeton JWT
                  const token = jwt.sign(
                      { userId: user._id },
                      process.env.JWT_SECRET,
                      { expiresIn: "24h" }
                  );
                  res.status(200).json({ token, userId:user._id });
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
}
