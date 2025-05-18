const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const filePath = path.join(__dirname, "../data/courses.json");

let courseIdCounter = 103;

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
    courseIdCounter++;
    const newCourse = { id: courseIdCounter, ...req.body };
    courses.push(newCourse);
    writeCourses(courses);
    res.json(newCourse);
});

router.delete("/:id", (req, res) => {
    let courses = readCrouses();
    const idToDelete = parseInt(req.params.id);
    courses = courses.filter((course) => course.id !== idToDelete);
    writeCourses(courses);
    courseIdCounter--;
    res.json({ message: "Course deleted" });
});

module.exports = router;
