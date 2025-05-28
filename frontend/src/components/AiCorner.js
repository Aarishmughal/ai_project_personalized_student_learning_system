import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Card, Modal } from "react-bootstrap";

const AiCorner = (props) => {
    const [processing, setProcessing] = useState(false);

    const handleRunPreprocess = async () => {
        setProcessing(true);
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
    };

    return (
        <div className="d-flex justify-content-start align-items-start gap-4">
            <h2>Get Training Data</h2>
            {/* <Button variant="primary" onClick={handleShow} className="m-0">
                Get Started &rarr;
            </Button> */}
            <Button
                variant="warning"
                onClick={handleRunPreprocess}
                disabled={processing}
                className="m-0"
            >
                {processing ? "Processing..." : "Generate Training Data"}
            </Button>
        </div>
    );
};

export default AiCorner;
