import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";

// --- Utility/API functions ---
const fetchStudents = async (API_URL) => {
    const res = await axios.get(`${API_URL}/students/`);
    return res.data;
};
const fetchAssessments = async (API_URL) => {
    const res = await axios.get(`${API_URL}/assessments/`);
    return res.data;
};
const fetchStudentGrades = async (API_URL, studentId) => {
    const res = await axios.get(
        `${API_URL}/assessment-grades/student/${studentId}`
    );
    return res.data;
};
const addStudent = async (API_URL, student) => {
    const res = await axios.post(`${API_URL}/students/`, student);
    return res.data;
};
const updateStudent = async (API_URL, studentId, student) => {
    const res = await axios.put(`${API_URL}/students/${studentId}`, student);
    return res.data;
};
const deleteStudentAPI = async (API_URL, studentId) => {
    await axios.delete(`${API_URL}/students/${studentId}`);
};
const submitScores = async (API_URL, studentId, scores) => {
    await axios.post(`${API_URL}/assessment-grades/score`, {
        student_id: studentId,
        scores,
    });
};
// --- End Utility/API functions ---

const StudentList = (props) => {
    const [students, setStudents] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [addShow, setAddShow] = useState(false);
    const [detailShow, setDetailShow] = useState(false);
    const [scoreModalShow, setScoreModalShow] = useState(false);
    const [bulkModalShow, setBulkModalShow] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [scoreInputs, setScoreInputs] = useState({});
    const [studentGrades, setStudentGrades] = useState({});
    const [gradesLoading, setGradesLoading] = useState(false);
    const [bulkJson, setBulkJson] = useState("");
    const [filterText, setFilterText] = useState("");

    useEffect(() => {
        fetchStudents(props.API_URL).then(setStudents);
        fetchAssessments(props.API_URL).then(setAssessments);
    }, [props.API_URL]);

    const filteredStudents = students.filter(
        (s) =>
            s.name.toLowerCase().includes(filterText.toLowerCase()) ||
            s.email.toLowerCase().includes(filterText.toLowerCase())
    );
    const columns = [
        {
            name: "ID",
            selector: (row, index) => index + 1,
            width: "60px",
            sortable: true,
        },
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
            width: "200px",
            cell: (row) => (
                <span
                    style={{
                        cursor: "pointer",
                        color: "#007bff",
                        textDecoration: "underline",
                    }}
                    onClick={() => handleDetailShow(row)}
                >
                    {row.name}
                </span>
            ),
        },
        {
            name: "Email",
            selector: (row) => row.email,
            sortable: true,
            width: "600px",
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex align-items-start gap-2 m-2">
                    <Button
                        variant="danger"
                        onClick={() => handleDeleteStudent(row._id)}
                    >
                        <i className="bi bi-x-circle-fill"></i>
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => handleDetailShow(row)}
                    >
                        <i className="bi bi-pen-fill"></i>
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => handleScoreModalShow(row)}
                        title="Add Assessment Score"
                    >
                        <i className="bi bi-clipboard-plus"></i>
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const name = form.elements.name.value;
        const email = form.elements.email.value;
        if (selectedStudent) {
            try {
                const updated = await updateStudent(
                    props.API_URL,
                    selectedStudent._id,
                    { name, email }
                );
                setStudents((students) =>
                    students.map((s) =>
                        s._id === selectedStudent._id ? updated : s
                    )
                );
                setSelectedStudent(null);
                setDetailShow(false);
                alert("Student updated successfully!");
            } catch (err) {
                alert("Failed to update student.");
            }
        } else {
            try {
                const newStudent = await addStudent(props.API_URL, {
                    name,
                    email,
                });
                setStudents([...students, newStudent]);
                setAddShow(false);
            } catch (err) {
                alert("Failed to add student.");
            }
        }
        form.reset();
    };

    const handleAddClose = () => setAddShow(false);
    const handleAddShow = () => setAddShow(true);

    const handleDetailClose = () => {
        setDetailShow(false);
        setSelectedStudent(null);
    };
    const handleDetailShow = async (student) => {
        setSelectedStudent(student);
        setGradesLoading(true);
        setDetailShow(true);
        try {
            const grades = await fetchStudentGrades(props.API_URL, student._id);
            setStudentGrades(grades);
        } catch (err) {
            setStudentGrades({});
        } finally {
            setGradesLoading(false);
        }
    };

    const handleScoreModalClose = () => {
        setScoreModalShow(false);
        setSelectedStudent(null);
        setScoreInputs({});
    };
    const handleScoreModalShow = (student) => {
        setSelectedStudent(student);
        setScoreModalShow(true);
    };

    const handleScoreInputChange = (assessmentId, value) => {
        setScoreInputs((prev) => ({ ...prev, [assessmentId]: value }));
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm("Are you sure you want to delete this student?"))
            return;
        await deleteStudentAPI(props.API_URL, studentId);
        setStudents(students.filter((student) => student._id !== studentId));
    };

    const handleScoreSubmit = async (event) => {
        event.preventDefault();
        for (const assessment of assessments) {
            const val = scoreInputs[assessment._id];
            if (val === undefined || val === "") {
                alert(`Please enter a score for ${assessment.title}`);
                return;
            }
            if (val < 0 || val > assessment.totalMarks) {
                alert(
                    `Score for ${assessment.title} must be between 0 and ${assessment.totalMarks}`
                );
                return;
            }
        }
        try {
            await submitScores(props.API_URL, selectedStudent._id, scoreInputs);
            handleScoreModalClose();
            setScoreInputs({});
            alert("Scores submitted successfully!");
        } catch (err) {
            alert("Failed to submit scores. Please try again.");
        }
    };

    const handleBulkModalClose = () => {
        setBulkModalShow(false);
        setBulkJson("");
    };
    const handleBulkModalShow = () => setBulkModalShow(true);

    const handleBulkJsonChange = (e) => setBulkJson(e.target.value);

    const handleBulkJsonSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = JSON.parse(bulkJson);
            if (!Array.isArray(data)) {
                alert("Bulk data must be a JSON array of students.");
                return;
            }
            // Optionally, validate each object
            const added = [];
            for (const student of data) {
                if (student.name && student.email) {
                    const res = await addStudent(props.API_URL, student);
                    added.push(res);
                }
            }
            setStudents((prev) => [...prev, ...added]);
            alert(`${added.length} students added successfully!`);
            handleBulkModalClose();
        } catch (err) {
            alert("Invalid JSON or failed to add students.");
        }
    };

    return (
        <>
            <section className="mb-4">
                <div className="d-flex justify-content-start align-items-start gap-4">
                    <h2>Students List</h2>
                    <Button
                        variant="primary"
                        onClick={handleAddShow}
                        className="m-0"
                    >
                        Add New Student
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleBulkModalShow}
                        className="m-0"
                    >
                        Bulk Add Students
                    </Button>
                    <Form.Control
                        type="text"
                        placeholder="Search by name or email"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{ maxWidth: 250 }}
                    />
                </div>
                <hr />
                <DataTable
                    columns={columns}
                    data={filteredStudents}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                    striped
                    dense
                />
                <Modal show={addShow} onHide={handleAddClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Student</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
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
                            <Button variant="primary" type="submit">
                                Add Student
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
                <Modal show={detailShow} onHide={handleDetailClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Update {selectedStudent?.name}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter student name"
                                    name="name"
                                    defaultValue={selectedStudent?.name || ""}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter student email"
                                    name="email"
                                    defaultValue={selectedStudent?.email || ""}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Update Student
                            </Button>
                        </Form>
                        <hr />
                        <h5>Assessment Grades</h5>
                        {gradesLoading ? (
                            <div>Loading grades...</div>
                        ) : (
                            <Table striped bordered size="sm">
                                <thead>
                                    <tr>
                                        <th>Assessment</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assessments.map((assessment) => (
                                        <tr key={assessment._id}>
                                            <td>{assessment.title}</td>
                                            <td>
                                                {studentGrades[
                                                    assessment._id
                                                ] !== undefined ? (
                                                    studentGrades[
                                                        assessment._id
                                                    ]
                                                ) : (
                                                    <span className="text-muted">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Modal.Body>
                </Modal>
                <Modal show={scoreModalShow} onHide={handleScoreModalClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Add Assessment Score for {selectedStudent?.name}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <Form onSubmit={handleScoreSubmit}>
                            {assessments.map((assessment) => (
                                <Form.Group
                                    className="mb-3"
                                    key={assessment._id}
                                >
                                    <Form.Label>{assessment.title}</Form.Label>
                                    <div className="input-group">
                                        <Form.Control
                                            type="number"
                                            placeholder={`Enter ${assessment.title} Obtained score`}
                                            value={
                                                scoreInputs[assessment._id] ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleScoreInputChange(
                                                    assessment._id,
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                        <span className="input-group-text">
                                            / {assessment.totalMarks}
                                        </span>
                                    </div>
                                </Form.Group>
                            ))}
                            <Button variant="success" type="submit">
                                Submit Score
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
                <Modal show={bulkModalShow} onHide={handleBulkModalClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Bulk Add Students (Paste JSON Array)
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleBulkJsonSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Paste JSON Array</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={8}
                                    value={bulkJson}
                                    onChange={handleBulkJsonChange}
                                    placeholder='[{"name": "John Doe", "email": "john@example.com"}, ...]'
                                />
                            </Form.Group>
                            <Button variant="success" type="submit">
                                Upload
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </section>
        </>
    );
};

export default StudentList;
