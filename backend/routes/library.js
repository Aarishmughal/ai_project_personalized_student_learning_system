const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const filePath = path.join(__dirname, "../data/library.json");

const readBooks = () => {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
};

const writeBooks = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

router.get("/", (req, res) => {
    const books = readBooks();
    res.json(books);
});

router.post("/", (req, res) => {
    const books = readBooks();
    const newBook = { _id: uuidv4(), ...req.body };
    books.push(newBook);
    writeBooks(books);
    res.json(newBook);
});

router.delete("/:id", (req, res) => {
    let books = readBooks();
    const idToDelete = req.params.id;
    books = books.filter((book) => book._id !== idToDelete);
    writeBooks(books);
    res.json({ message: "Book deleted!" });
});

module.exports = router;
