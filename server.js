const mongoose = require("mongoose");
const userRouter = require("./routes/user.route");
const bookRouter = require("./routes/book.route");
require('dotenv').config();


const express = require('express')
const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

mongoose
  .connect("mongodb+srv://phenixor:7LcS7yhh7ZEAoqdv@tquesnel.agiozhu.mongodb.net/mon-vieux-grimoire?retryWrites=true&w=majority&appName=Tquesnel")
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());

// Indique les routes à utiliser pour un point End Point
app.use("/api/auth", userRouter);
app.use("/api", bookRouter);