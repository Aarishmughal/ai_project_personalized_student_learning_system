const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { readJSON } = require("../utils/fileHandler");

const JWT_SECRET = "123";

router.post("/login", (req, res) => {
    const { email, password, role } = req.body;

    if (!["student", "teacher"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    const data = readJSON(`${role}s.json`);
    const user = data.find((u) => u.email === email && u.password === password);

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, {
        expiresIn: "2h",
    });
    res.json({ token, user: { id: user._id, name: user.name, role } });
});

module.exports = router;
