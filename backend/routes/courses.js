const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const filePath = path.join(__dirname, "../data/courses.json");

const readCrouses = () => {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
};

const writeCourses = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

router.get("/", (req, res) => {
    const courses = readCrouses();
    res.json(courses);
});

router.post("/", (req, res) => {
    const courses = readCrouses();
    const newCourse = { _id: uuidv4(), ...req.body };
    courses.push(newCourse);
    writeCourses(courses);
    res.json(newCourse);
});

router.delete("/:id", (req, res) => {
    let courses = readCrouses();
    const idToDelete = req.params.id;
    courses = courses.filter((course) => course._id !== idToDelete);
    writeCourses(courses);
    res.json({ message: "Course deleted" });
});

module.exports = router;
