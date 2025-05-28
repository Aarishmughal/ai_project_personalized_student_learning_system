const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// const authenticationRouter = require("./routes/auth");
const studentsRouter = require("./routes/students");
const coursesRouter = require("./routes/courses");
const teachersRouter = require("./routes/teachers");
const libraryRouter = require("./routes/library");
const assessmentsRouter = require("./routes/assessments");
const assessmentGradesRouter = require("./routes/assessmentGrades");

// app.use("/auth", authenticationRouter);
app.use("/api/students", studentsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/teachers", teachersRouter);
app.use("/api/library", libraryRouter);
app.use("/api/assessments", assessmentsRouter);
app.use("/api/assessment-grades", assessmentGradesRouter);

app.post("/api/run-preprocess", (req, res) => {
    exec("python data/preprocess.py", (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr || error.message });
        }
        res.json({ message: "Preprocessing complete", output: stdout });
    });
});

app.get("/api/training_data.csv", (req, res) => {
    const csvPath = path.join(__dirname, "data", "training_data.csv");
    if (fs.existsSync(csvPath)) {
        res.setHeader("Content-Type", "text/csv");
        fs.createReadStream(csvPath).pipe(res);
    } else {
        res.status(404).send("training_data.csv not found");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
