import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Modal } from "react-bootstrap";

const GradeAssessment = (props) => {
    const [assessments, setAssessments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${props.API_URL}/assessments/`);
            setAssessments(res.data);
        };
        fetchData();
    }, [props.API_URL]);

    const deleteAssessment = async (id) => {
        await axios.delete(`${props.API_URL}/assessments/${id}`);
        setAssessments(
            assessments.filter((assessment) => assessment._id !== id)
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const title = form.elements.title.value;
        const date = form.elements.date.value;
        const totalMarks = form.elements.totalMarks.value;
        const newAssessment = { title, date, totalMarks };

        const res = await axios.post(
            `${props.API_URL}/assessments/`,
            newAssessment
        );
        setAssessments([...assessments, res.data]);
        form.reset();
    };
    
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return (
        <>
            <section className="mb-4">
                <div className="d-flex justify-content-start align-items-start gap-4">
                    <h2>Grade Assessment</h2>
                    <Button
                        variant="primary"
                        onClick={handleShow}
                        className="m-0"
                    >
                        Add New Assessment
                    </Button>
                </div>
                <hr />
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assessments.map((assessment, index) => (
                            <tr key={assessment._id}>
                                <td>{index + 1}</td>
                                <td>{assessment.title}</td>
                                <td>{assessment.date}</td>
                                <td>
                                    <Button
                                        variant="danger"
                                        onClick={() =>
                                            deleteAssessment(assessment._id)
                                        }
                                    >
                                        <i class="bi bi-x-circle-fill"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Assessment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Assessment Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Assessment Title"
                                    name="title"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control type="date" name="date" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Total Marks</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter Assessment Total Marks"
                                    name="totalMarks"
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Add Assessment
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </section>
        </>
    );
};

export default GradeAssessment;
