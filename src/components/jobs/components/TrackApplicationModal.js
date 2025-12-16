import React from "react";
import { Modal } from "react-bootstrap";
import "../../../css/TrackApplicationModal.css";

const TrackApplicationModal = ({ show, onHide, job }) => {
    if (!job) return null;

    const steps = [
        "Application",
        "Shortlisted",
        "Interview Scheduled",
        "Selected In Interview",
        "Offer"
    ];

    // Example current stage index (can come from API later)
    const currentIndex = 2; // Interview Scheduled

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    Track Application Status
                    <div className="job-subtitle">{job.position_title}</div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>

                {/* ===== STATUS STEPPER ===== */}
                <div className="status-stepper">
                    {steps.map((step, index) => {
                        const state =
                            index < currentIndex
                                ? "completed"
                                : index === currentIndex
                                    ? "current"
                                    : "pending";

                        return (
                            <div className={`step ${state}`} key={index}>
                                <div className="main">
                                    <div className={`circle ${state}`}>
                                        {state === "completed" && "✓"}
                                    </div>

                                    <div className="step-label">{step}</div>

                                    <div className={`step-status ${state}`}>
                                        {state === "completed"
                                            ? "Completed"
                                            : state === "current"
                                                ? "Current Stage"
                                                : "Pending"}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ===== SUBMIT REQUEST ===== */}
                <div className="query-section">
                    <h6>Submit Your Request</h6>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Request Type *</label>
                            <select className="form-select">
                                <option value="">Select Request Type</option>
                                <option value="query">Query</option>
                                <option value="clarification">Clarification</option>
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Attachment (Optional)</label>
                            <div className="upload-box">
                                Upload document
                                <small>PDF, DOC, JPG, PNG</small>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Query Details *</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Describe your query here..."
                                />
                            </div>
                             <div className="modal-actions col-md-6 mb-3">
                            <button className="btn btn-outline-secondary" onClick={onHide}>
                                Cancel
                            </button>
                            <button className="btn btn-primary">Submit</button>
                        </div>
                        </div>
                       
                    </div>



                </div>

                {/* ===== REQUEST HISTORY ===== */}
                <div className="request-history">
                    <h6 className="section-title">Request History</h6>

                    <table className="table history-table">
                        <thead>
                            <tr>
                                <th>Request Type</th>
                                <th>Description</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Interview Reschedule</td>
                                <td>
                                    Request to reschedule technical round due to conflict
                                </td>
                                <td>29-09-2025 02:51 PM</td>
                                <td className="status approved">Approved</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="history-thread">
                        <div className="thread-item recruiter">
                            <div className="avatar">R</div>
                            <div>
                                <strong>Request reviewed and approved by Recruiter</strong>
                                <p>
                                    Approved and rescheduled your technical round. Please check
                                    updated details in your email.
                                </p>
                                <span className="time">29-09-2025 06:15 PM</span>
                            </div>
                        </div>

                        <div className="thread-item candidate">
                            <div className="avatar">C</div>
                            <div>
                                <strong>Request raised by Candidate</strong>
                                <p>
                                    Requesting to reschedule the technical round due to a scheduling
                                    conflict.
                                </p>
                                <span className="time">29-09-2025 03:01 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    );
};

export default TrackApplicationModal;
