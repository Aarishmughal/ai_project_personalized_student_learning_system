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

const studentsRouter = require("./routes/students");
const coursesRouter = require("./routes/courses");
const teachersRouter = require("./routes/teachers");
const libraryRouter = require("./routes/library");
const assessmentsRouter = require("./routes/assessments");
const assessmentGradesRouter = require("./routes/assessmentGrades");

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

const { spawn } = require("child_process");

app.post("/api/predict", (req, res) => {
    const input = JSON.stringify(req.body);
    const py = spawn("python", [
        path.join(__dirname, "data", "model.py"),
        "--action",
        "predict",
        "--input",
        input,
    ]);

    let result = "";
    let errorResult = "";
    py.stdout.on("data", (data) => {
        result += data.toString();
    });

    py.stderr.on("data", (data) => {
        // Only treat as error if not just INFO logs
        const msg = data.toString();
        // Filter out INFO log lines
        const filtered = msg.split("\n").filter(line => line && !line.startsWith("INFO:")).join("\n");
        if (filtered) errorResult += filtered;
    });

    py.on("close", (code) => {
        if (code !== 0 || errorResult) {
            return res.status(500).json({
                error: errorResult || "Python process failed",
                details: result,
            });
        }
        try {
            res.json(JSON.parse(result));
        } catch (e) {
            res.status(500).json({
                error: "Failed to parse Python output",
                details: result,
            });
        }
    });
});

app.post("/api/train-model", (req, res) => {
    exec("python data/model.py --action train", (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr || error.message });
        }
        res.json({ message: "Model training complete", output: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
