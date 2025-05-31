import React from "react";
import { useState } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { MutatingDots } from "react-loader-spinner";

const AiCorner = (props) => {
    const [processing, setProcessing] = useState(false);
    const [loadingType, setLoadingType] = useState(null);
    const [showPredictModal, setShowPredictModal] = useState(false);
    const [students, setStudents] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedAssessment, setSelectedAssessment] = useState("");
    const [predictionResult, setPredictionResult] = useState(null);

    // Fetch students and assessments on mount
    React.useEffect(() => {
        axios.get(`${props.API_URL}/students`).then((res) => {
            setStudents(res.data);
        });
        axios.get(`${props.API_URL}/assessments`).then((res) => {
            setAssessments(res.data);
        });
    }, [props.API_URL]);

    const handleRunPreprocess = async () => {
        setProcessing(true);
        setLoadingType("preprocess");
        try {
            await axios.post(`${props.API_URL}/run-preprocess`);
            alert("Preprocessing complete! training_data.csv updated.");
        } catch (err) {
            alert(
                "Failed to run preprocess: " +
                    (err.response?.data?.error || err.message)
            );
        }
        setProcessing(false);
        setLoadingType(null);
    };

    const handleTrainModel = async () => {
        setProcessing(true);
        setLoadingType("train");
        try {
            const response = await axios.post(`${props.API_URL}/train-model`);
            alert(response.data.message || "Model training complete!");
        } catch (err) {
            alert(
                "Failed to train model: " +
                    (err.response?.data?.error || err.message)
            );
        }
        setProcessing(false);
        setLoadingType(null);
    };

    const handleShowPredictModal = () => {
        setPredictionResult(null);
        setSelectedStudent("");
        setSelectedAssessment("");
        setShowPredictModal(true);
    };
    const handleClosePredictModal = () => {
        setShowPredictModal(false);
    };

    const handleStudentChange = (e) => {
        setSelectedStudent(e.target.value);
    };

    const handleAssessmentChange = (e) => {
        setSelectedAssessment(e.target.value);
    };

    const handlePredict = async () => {
        if (!selectedStudent || !selectedAssessment) return;
        setProcessing(true);
        setLoadingType("predict");
        try {
            // Fetch grades
            const gradesRes = await axios.get(
                `${props.API_URL}/assessment-grades/student/${selectedStudent}`
            );
            const grades = gradesRes.data;
            // Find selected assessment
            const assessment = assessments.find(
                (a) => a._id === selectedAssessment
            );
            if (!assessment) throw new Error("Assessment not found");
            const colName = `${assessment.type}_${assessment._id.slice(0, 5)}`;
            const rawScore = grades[colName];
            const totalMarks = Number(assessment.totalMarks);
            const weightage = Number(assessment.weightage);
            let weightedScore = null;
            if (rawScore !== undefined && rawScore !== null) {
                const normScore = rawScore / totalMarks;
                weightedScore = normScore * (weightage / 100.0);
            }
            // Only send the selected assessment's weighted score
            const weightedGrades = { [colName]: weightedScore };
            const predictRes = await axios.post(`${props.API_URL}/predict`, {
                student_id: selectedStudent,
                previous_grades: weightedGrades,
            });
            setPredictionResult({
                ...predictRes.data,
                formatted: {
                    weightedScore,
                    rawScore,
                    totalMarks,
                    weightage,
                    colName,
                    assessmentTitle: assessment.title,
                },
            });
        } catch (err) {
            setPredictionResult({
                error: err.response?.data?.error || err.message,
            });
        }
        setProcessing(false);
        setLoadingType(null);
    };

    return (
        <div className="d-flex flex-column gap-4 align-items-start">
            <div className="d-flex gap-4 align-items-start">
                <h2>Get Training Data</h2>
                <Button
                    variant="warning"
                    onClick={handleRunPreprocess}
                    disabled={processing}
                    className="m-0"
                >
                    {processing && loadingType === "preprocess" ? (
                        <MutatingDots
                            visible={true}
                            height="100"
                            width="100"
                            color="#000000"
                            secondaryColor="#000000"
                            radius="12.5"
                            ariaLabel="mutating-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                    ) : (
                        "Generate Training Data"
                    )}
                </Button>
                <Button
                    variant="success"
                    onClick={handleTrainModel}
                    disabled={processing}
                    className="m-0"
                >
                    {processing && loadingType === "train" ? (
                        <MutatingDots
                            visible={true}
                            height="100"
                            width="100"
                            color="#000000"
                            secondaryColor="#000000"
                            radius="12.5"
                            ariaLabel="mutating-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                    ) : (
                        "Train Model"
                    )}
                </Button>
                <Button
                    variant="info"
                    onClick={handleShowPredictModal}
                    disabled={processing}
                    className="m-0"
                >
                    Predict Student Score
                </Button>
            </div>
            <Modal show={showPredictModal} onHide={handleClosePredictModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Predict Student Score</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Student</Form.Label>
                        <Form.Select
                            value={selectedStudent}
                            onChange={handleStudentChange}
                            disabled={processing}
                        >
                            <option value="">-- Select Student --</option>
                            {students.map((student) => (
                                <option key={student._id} value={student._id}>
                                    {student.name} ({student.email})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Assessment</Form.Label>
                        <Form.Select
                            value={selectedAssessment}
                            onChange={handleAssessmentChange}
                            disabled={processing}
                        >
                            <option value="">-- Select Assessment --</option>
                            {assessments.map((assessment) => (
                                <option key={assessment._id} value={assessment._id}>
                                    {assessment.title} ({assessment.type})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button
                        variant="primary"
                        onClick={handlePredict}
                        disabled={
                            processing || !selectedStudent || !selectedAssessment
                        }
                        className="mt-2"
                    >
                        {processing && loadingType === "predict" ? (
                            <MutatingDots
                                visible={true}
                                height="100"
                                width="100"
                                color="#000000"
                                secondaryColor="#000000"
                                radius="12.5"
                                ariaLabel="mutating-dots-loading"
                                wrapperStyle={{}}
                                wrapperClass=""
                            />
                        ) : (
                            "Predict"
                        )}
                    </Button>
                    {predictionResult && (
                        <div className="mt-3">
                            {predictionResult.error ? (
                                <div className="text-danger">
                                    Error: {predictionResult.error}
                                </div>
                            ) : (
                                <div className="text-success">
                                    <div>
                                        <b>Assessment:</b>{" "}
                                        {
                                            predictionResult.formatted
                                                .assessmentTitle
                                        }
                                    </div>
                                    <div>
                                        <b>Raw Score:</b>{" "}
                                        {predictionResult.formatted.rawScore} /{" "}
                                        {predictionResult.formatted.totalMarks}
                                    </div>
                                    <div>
                                        <b>Weighted Score:</b>{" "}
                                        {(
                                            predictionResult.formatted
                                                .weightedScore * 100
                                        ).toFixed(2)}
                                        %
                                    </div>
                                    <div>
                                        <b>Predicted Final Score:</b>{" "}
                                        {(
                                            predictionResult.predicted_score * 100
                                        ).toFixed(2)}
                                        %
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AiCorner;