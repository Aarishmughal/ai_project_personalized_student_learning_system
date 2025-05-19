import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Card, Modal } from "react-bootstrap";

const Library = (props) => {
    const [books, setBooks] = useState([]);
    const [courses, setCourses] = useState([]);
    const booksCount = books.length;

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${props.API_URL}/library/`);
            setBooks(res.data);
            const courseRes = await axios.get(`${props.API_URL}/courses/`);
            setCourses(courseRes.data);
        };
        fetchData();
    }, []);

    const deleteBook = async (id) => {
        await axios.delete(`${props.API_URL}/library/${id}`);
        setBooks(books.filter((book) => book.id !== id));
    };

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
        newBook.id = booksCount + 1;
        setBooks([...books, newBook]);
        form.reset();
    };

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return (
        <>
            <div className="d-flex justify-content-start align-items-start gap-4">
                <h2>Library</h2>
                <Button variant="primary" onClick={handleShow} className="m-0">
                    Add Book
                </Button>
            </div>
            <hr />
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>For Course</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book.id}>
                            <td>{book.id}</td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td className="fst-italic">
                                {courses.map((course) => {
                                    if (course.id === book.course_id) {
                                        return (
                                            <span key={course.id}>
                                                {course.title}
                                            </span>
                                        );
                                    }
                                })}
                            </td>
                            <td>
                                <Button
                                    variant="danger"
                                    onClick={() => deleteBook(book.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <hr />
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Book</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Book Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Book Title"
                                name="title"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Book Author</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Book Author"
                                name="author"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Best Suitable for Course</Form.Label>
                            <Form.Select className="mb-3" name="course_id">
                                <option selected disabled>
                                    -- Select an Option --
                                </option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Add Book
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

export default Library;
