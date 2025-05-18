import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Card } from "react-bootstrap";

const CourseList = (props) => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${props.API_URL}/courses/`);
            const teachers = await axios.get(`${props.API_URL}/teachers/`);
            setCourses(res.data);
            setTeachers(teachers.data);
        };
        fetchData();
    }, []);

    const deleteCourse = async (id) => {
        await axios.delete(`${props.API_URL}/courses/${id}`);
        setCourses(courses.filter((course) => course.id !== id));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const title = form.elements.title.value;
        const teacher_id = Number(form.elements.teacher_id.value);

        const newCourse = {
            title,
            teacher_id,
        };

        await axios.post(`${props.API_URL}/courses/`, newCourse);
        setCourses([...courses, newCourse]);
        form.reset();
    };

    return (
        <>
            <h2>Courses</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Course Teacher</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
                        <tr key={course.id}>
                            <td>{course.id}</td>
                            <td>{course.title}</td>
                            <td>
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
                            <td>
                                <Button
                                    variant="danger"
                                    onClick={() => deleteCourse(course.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <hr />
            <h2>Add New Course</h2>
            <Card className="p-4 shadow-lg">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Course Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter course title"
                            name="title"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Course Teacher</Form.Label>
                        <Form.Select className="mb-3" name="teacher_id">
                            <option selected disabled>
                                -- Select an Option --
                            </option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button variant="success" type="submit">
                        Add Course
                    </Button>
                </Form>
            </Card>
        </>
    );
};

export default CourseList;
