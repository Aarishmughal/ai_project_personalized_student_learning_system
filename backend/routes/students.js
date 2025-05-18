const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const filePath = path.join(__dirname, "../data/students.json");

let studentIdCounter = 3;

const readStudents = () => {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
};

const writeStudents = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

router.get("/", (req, res) => {
    const students = readStudents();
    res.json(students);
});

router.post("/", (req, res) => {
    const students = readStudents();
    studentIdCounter++;
    const newStudent = { id: studentIdCounter, ...req.body };
    students.push(newStudent);
    writeStudents(students);
    res.json(newStudent);
});

router.delete("/:id", (req, res) => {
    let students = readStudents();
    const idToDelete = parseInt(req.params.id);
    students = students.filter((student) => student.id !== idToDelete);
    writeStudents(students);
    studentIdCounter--;
    res.json({ message: "Student deleted" });
});

module.exports = router;
