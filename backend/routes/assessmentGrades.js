const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const filePath = path.join(__dirname, "../data/assessmentGrades.json");

const readGrades = () => {
    if (!fs.existsSync(filePath)) return {};
    const data = fs.readFileSync(filePath, "utf8");
    if (!data.trim()) return {};
    try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
            // Migrate from array to object if needed
            return {};
        }
        return parsed;
    } catch (e) {
        return {};
    }
};

const writeGrades = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// POST /api/assessment-grades/score
router.post("/score", (req, res) => {
    const { student_id, scores } = req.body;
    if (!student_id || !scores || typeof scores !== "object") {
        return res
            .status(400)
            .json({ error: "student_id and scores object required" });
    }
    let grades = readGrades();
    if (!grades[student_id]) grades[student_id] = {};
    for (const [assessmentId, score] of Object.entries(scores)) {
        grades[student_id][assessmentId] = Number(score);
    }
    writeGrades(grades);
    res.json({ message: "Scores updated successfully" });
});

// Optionally, add a GET route to fetch grades for a student or all students
router.get("/student/:student_id", (req, res) => {
    const grades = readGrades();
    res.json(grades[req.params.student_id] || {});
});

router.get("/", (req, res) => {
    const grades = readGrades();
    res.json(grades);
});

module.exports = router;
