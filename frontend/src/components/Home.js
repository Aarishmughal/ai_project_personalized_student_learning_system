import React from "react";
import { Nav, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../App.css";
const Home = () => (
    <Card className="text-center">
        <Card.Body className="px-5 pt-3">
            <Card.Title className="display-1">
                AI Powered Student LMS
            </Card.Title>
            <hr />
            <div className="d-flex justify-content-center align-items-center gap-4">
                <Nav.Link as={Link} to="/students">
                    <Card className="bg-success text-white p-4 home-card-custom">
                        <i
                            class="bi bi-people-fill m-0"
                            style={{ fontSize: "96px" }}
                        ></i>
                        <h4 className="display-5 fst-italic">
                            Manage Students
                        </h4>
                    </Card>
                </Nav.Link>
                <Nav.Link as={Link} to="/courses">
                    <Card className="bg-primary text-white p-4 home-card-custom">
                        <i
                            class="bi bi-book m-0"
                            style={{ fontSize: "96px" }}
                        ></i>
                        <h4 className="display-5 fst-italic">Manage Courses</h4>
                    </Card>
                </Nav.Link>
                <Nav.Link as={Link} to="/teachers">
                    <Card className="bg-danger text-white p-4 home-card-custom">
                        <i
                            class="bi bi-people m-0"
                            style={{ fontSize: "96px" }}
                        ></i>
                        <h4 className="display-5 fst-italic">
                            Manage Teachers
                        </h4>
                    </Card>
                </Nav.Link>
            </div>
            <Card.Footer className="mt-4 ">
                <h5 className="text-muted fw-normal">
                    Artificial Intelligence Semester Project <br />
                    Developed with{" "}
                    <a
                        href="#"
                        target="_blank"
                        className="text-decoration-none"
                    >
                        <strong>ReactJs, ExpressJs & ♥</strong>
                    </a>
                </h5>
                <p className="text-muted fst-italic mb-0 small">Ver 0.5.3</p>
            </Card.Footer>
        </Card.Body>
    </Card>
);

export default Home;
