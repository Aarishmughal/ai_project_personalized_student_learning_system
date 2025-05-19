import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Card, Modal } from "react-bootstrap";

const AiCorner = (props) => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [age, setAge] = useState(50);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${props.API_URL}/courses/`);
            setCourses(res.data);
            const res2 = await axios.get(`${props.API_URL}/teachers/`);
            setTeachers(res2.data);
        };
        fetchData();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const title = form.elements.title.value;
        const author = form.elements.author.value;
        const course_id = Number(form.elements.course_id.value);

        const newBook = {
            title,
            author,
            course_id,
        };

        await axios.post(`${props.API_URL}/library/`, newBook);
        // newBook.id = booksCount + 1;
        // setBooks([...books, newBook]);
        form.reset();
    };

    const handleAgeUpdate = (event) => {
        const value = event.target.value;
        setAge(value);
    };

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <div className="d-flex justify-content-start align-items-start gap-4">
                <h2>Recommended Courses</h2>
                <Button variant="primary" onClick={handleShow} className="m-0">
                    Get Started &rarr;
                </Button>
            </div>
            <hr />
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Teacher</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
                        <tr key={course.id}>
                            <td>{course.id}</td>
                            <td>{course.title}</td>
                            <td className="fst-italic">
                                {teachers.map((teacher) => {
                                    if (teacher.id === course.teacher_id) {
                                        return (
                                            <span key={teacher.id}>
                                                {teacher.name}
                                            </span>
                                        );
                                    }
                                })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <hr />
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter You Data</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Age: {age}</Form.Label>
                            <Form.Range
                                className="bg-dark rounded-5"
                                onChange={handleAgeUpdate}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Interests</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Interests"
                                name="author"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            <i className="bi bi-stars me-1"></i>Perform AI
                            Search
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            className="ms-2"
                        >
                            Cancel
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AiCorner;
