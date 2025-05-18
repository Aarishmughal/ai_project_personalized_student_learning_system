const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// const authenticationRouter = require("./routes/auth");
const studentsRouter = require("./routes/students");
const coursesRouter = require("./routes/courses");
const teachersRouter = require("./routes/teachers");

// app.use("/auth", authenticationRouter);
app.use("/api/students", studentsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/teachers", teachersRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
