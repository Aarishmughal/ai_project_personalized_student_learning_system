import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/Home";
import StudentList from "./components/StudentList";
import CourseList from "./components/CourseList";
import TeacherList from "./components/TeacherList";
import "./App.css";
import Library from "./components/Library";
import AiCorner from "./components/AiCorner";
import Assessments from "./components/Assessments";
import GradeAssessment from "./components/GradeAssessment";

const App = () => {
    const API_URL = "http://localhost:5000/api";
    return (
        <Router>
            <Navbar bg="primary" variant="primary">
                <Container>
                    <Nav.Link as={Link} to="/">
                        <Navbar.Brand>
                            <img
                                src="/logo.png"
                                height="100"
                                className="d-inline-block align-top rounded-4"
                                alt="Student Management System"
                            />
                        </Navbar.Brand>
                    </Nav.Link>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link
                                as={Link}
                                to="/students"
                                className="nav-link-custom mx-2"
                            >
                                <i className="bi bi-people-fill me-2"></i>
                                Students
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/courses"
                                className="nav-link-custom mx-2"
                            >
                                <i className="bi bi-book me-2"></i>
                                Courses
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/teachers"
                                className="nav-link-custom mx-2"
                            >
                                <i className="bi bi-people me-2"></i>
                                Teachers
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/library"
                                className="nav-link-custom mx-2"
                            >
                                <i className="bi bi-book me-2"></i>
                                Library
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/ai-corner"
                                className="nav-link-custom mx-2"
                            >
                                <i className="bi bi-stars me-2"></i>
                                AI Corner
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/assessments"
                                className="nav-link-custom mx-2"
                            >
                                <i className="bi bi-clipboard-data-fill me-2"></i>
                                Assessments
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/grade-assessment"
                                className="nav-link-custom mx-2"
                            >
                                <i className="bi bi-clipboard-check me-2"></i>
                                Grade Assesments
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
                    <Route
                        path="/library"
                        element={<Library API_URL={API_URL} />}
                    />
                    <Route
                        path="/ai-corner"
                        element={<AiCorner API_URL={API_URL} />}
                    />
                    <Route
                        path="/assessments"
                        element={<Assessments API_URL={API_URL} />}
                    />
                    <Route
                        path="/grade-assessment"
                        element={<GradeAssessment API_URL={API_URL} />}
                    />
                </Routes>
            </Container>
        </Router>
    );
};

export default App;
