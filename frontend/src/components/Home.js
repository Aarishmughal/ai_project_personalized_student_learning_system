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
            <div className="row row-cols-1 row-cols-md-4 g-4 justify-content-center align-items-stretch">
                <div className="col d-flex">
                    <Nav.Link as={Link} to="/students" className="flex-fill">
                        <Card className="bg-success text-white p-4 home-card-custom h-100">
                            <i
                                class="bi bi-people-fill m-0"
                                style={{ fontSize: "96px" }}
                            ></i>
                            <h4 className="display-5 fst-italic">
                                Manage Students
                            </h4>
                        </Card>
                    </Nav.Link>
                </div>
                <div className="col d-flex">
                    <Nav.Link as={Link} to="/ai-corner" className="flex-fill">
                        <Card className="bg-warning p-4 home-card-custom h-100">
                            <i
                                class="bi bi-stars m-0"
                                style={{ fontSize: "96px" }}
                            ></i>
                            <h4 className="display-5 fst-italic">AI Corner</h4>
                        </Card>
                    </Nav.Link>
                </div>
                <div className="col d-flex">
                    <Nav.Link as={Link} to="/assessments" className="flex-fill">
                        <Card className="bg-primary text-white p-4 home-card-custom h-100">
                            <i
                                class="bi bi-clipboard-data-fill m-0"
                                style={{ fontSize: "96px" }}
                            ></i>
                            <h4 className="display-5 fst-italic">
                                Assessments
                            </h4>
                        </Card>
                    </Nav.Link>
                </div>
            </div>
            <div className="mt-3 d-flex justify-content-center align-items-center gap-4"></div>
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
