const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const filePath = path.join(__dirname, "../data/teachers.json");

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
    const newTeacher = { _id: uuidv4(), ...req.body };
    teachers.push(newTeacher);
    writeTeachers(teachers);
    res.json(newTeacher);
});

router.delete("/:id", (req, res) => {
    let teachersList = readTeachers();
    const idToDelete = req.params.id;
    teachersList = teachersList.filter((teacher) => teacher._id !== idToDelete);
    writeTeachers(teachersList);
    res.json({ message: "Teacher deleted!" });
});

module.exports = router;
