const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const filePath = path.join(__dirname, "../data/teachers.json");

let teacherIdCounter = 1;

const readTeachers = () => {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
};

const writeTeachers = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

router.get("/", (req, res) => {
    const courses = readTeachers();
    res.json(courses);
});

router.post("/", (req, res) => {
    const teachers = readTeachers();
    teacherIdCounter++;
    const newTeacher = { id: teacherIdCounter, ...req.body };
    teachers.push(newTeacher);
    writeTeachers(teachers);
    res.json(newTeacher);
});

router.delete("/:id", (req, res) => {
    let teachers = readTeachers();
    const idToDelete = parseInt(req.params.id);
    teachers = teachers.filter((teacher) => teacher.id !== idToDelete);
    writeTeachers(teachers);
    teacherIdCounter--;
    res.json({ message: "Teacher deleted!" });
});

module.exports = router;
