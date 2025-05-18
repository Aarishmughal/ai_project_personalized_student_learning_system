import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/Home";
import StudentList from "./components/StudentList";
import CourseList from "./components/CourseList";
import TeacherList from "./components/TeacherList";
import "./App.css";

const App = () => {
    const API_URL = "http://localhost:5000/api";
    return (
        <Router>
            <Navbar bg="primary" variant="primary">
                <Container>
                    <Navbar.Brand href="/">
                        <img
                            src="/logo.png"
                            height="100"
                            className="d-inline-block align-top rounded-4"
                            alt="Student Management System"
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link
                                as={Link}
                                to="/students"
                                className="nav-link-custom mx-2"
                            >
                                <i class="bi bi-people-fill me-2"></i>
                                Students
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/courses"
                                className="nav-link-custom mx-2"
                            >
                                <i class="bi bi-book me-2"></i>
                                Courses
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/teachers"
                                className="nav-link-custom mx-2"
                            >
                                <i class="bi bi-people me-2"></i>
                                Teachers
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="mt-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/students"
                        element={<StudentList API_URL={API_URL} />}
                    />
                    <Route
                        path="/courses"
                        element={<CourseList API_URL={API_URL} />}
                    />
                    <Route
                        path="/teachers"
                        element={<TeacherList API_URL={API_URL} />}
                    />
                </Routes>
            </Container>
        </Router>
    );
};

export default App;
