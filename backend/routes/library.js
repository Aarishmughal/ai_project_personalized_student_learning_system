const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const filePath = path.join(__dirname, "../data/library.json");

let bookIdCounter = 0;

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
    bookIdCounter++;
    const newBook = { id: bookIdCounter, ...req.body };
    books.push(newBook);
    writeBooks(books);
    res.json(newBook);
});

router.delete("/:id", (req, res) => {
    let books = readBooks();
    const idToDelete = parseInt(req.params.id);
    books = books.filter((book) => book.id !== idToDelete);
    writeBooks(books);
    bookIdCounter--;
    res.json({ message: "Book deleted!" });
});

module.exports = router;
