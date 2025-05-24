const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const filePath = path.join(__dirname, "../data/assessments.json");

const readAssessments = () => {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
};

const writeAssessments = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

router.get("/", (req, res) => {
    const assessments = readAssessments();
    res.json(assessments);
});

router.post("/", (req, res) => {
    const assessments = readAssessments();
    const newAssessment = { _id: uuidv4(), ...req.body };
    assessments.push(newAssessment);
    writeAssessments(assessments);
    res.json(newAssessment);
});

router.delete("/:id", (req, res) => {
    let assessmentsList = readAssessments();
    const idToDelete = req.params.id;
    assessmentsList = assessmentsList.filter(
        (assessment) => assessment._id !== idToDelete
    );
    writeAssessments(assessmentsList);
    res.json({ message: "Assessment deleted!" });
});

module.exports = router;
