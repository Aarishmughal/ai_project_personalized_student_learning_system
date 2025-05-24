import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Card } from "react-bootstrap";

const TeacherList = (props) => {
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${props.API_URL}/teachers/`);
            setTeachers(res.data);
        };
        fetchData();
    }, [props.API_URL]);

    const deleteTeacher = async (id) => {
        await axios.delete(`${props.API_URL}/teachers/${id}`);
        setTeachers(teachers.filter((teacher) => teacher._id !== id));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const name = form.elements.name.value;
        const email = form.elements.email.value;
        const subject = form.elements.subject.value;

        const newTeacher = {
            name,
            email,
            subject,
        };

        const res = await axios.post(`${props.API_URL}/teachers/`, newTeacher);
        setTeachers([...teachers, res.data]);
        form.reset();
    };

    return (
        <>
            <h2>Teachers</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email Address</th>
                        <th>Subject</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map((teacher, index) => (
                        <tr key={teacher._id}>
                            <td>{index + 1}</td>
                            <td>{teacher.name}</td>
                            <td>{teacher.email}</td>
                            <td className="fst-italic">{teacher.subject}</td>
                            <td>
                                <Button
                                    variant="danger"
                                    onClick={() => deleteTeacher(teacher._id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <hr />
            <h2>Add New Teacher</h2>
            <Card className="p-4 shadow-lg">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Teacher Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Teacher Name"
                            name="name"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Teacher Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter Teacher Email Address"
                            name="email"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Teacher Subject</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Teacher Subject"
                            name="subject"
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Add Teacher
                    </Button>
                </Form>
            </Card>
        </>
    );
};

export default TeacherList;
