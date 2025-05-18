import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Card } from "react-bootstrap";

const StudentList = (props) => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${props.API_URL}/students/`);
            setStudents(res.data);
        };
        fetchData();
    }, []);

    const deleteStudent = async (id) => {
        await axios.delete(`${props.API_URL}/students/${id}`);
        setStudents(students.filter((student) => student.id !== id));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const name = form.elements.name.value;
        const email = form.elements.email.value;
        const password = form.elements.password.value;

        const newStudent = {
            name,
            email,
            password,
        };

        await axios.post(`${props.API_URL}/students/`, newStudent);
        setStudents([...students, newStudent]);
        form.reset();
    };

    return (
        <>
            <h2>Students</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.id}</td>
                            <td>{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.password}</td>
                            <td>
                                <Button
                                    variant="danger"
                                    onClick={() => deleteStudent(student.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <hr />
            <h2>Add New Student</h2>
            <Card className="p-4 shadow-lg">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter student name"
                            name="name"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter student email"
                            name="email"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter student Password"
                            name="password"
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Add Student
                    </Button>
                </Form>
            </Card>
        </>
    );
};

export default StudentList;
