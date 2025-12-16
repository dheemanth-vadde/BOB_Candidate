import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "../../../css/TrackApplicationModal.css";
import { Accordion, useAccordionButton } from "react-bootstrap";

const TrackApplicationModal = ({ show, onHide, job }) => {
    const [activeKey, setActiveKey] = useState("0");
    if (!job) return null;

    const steps = [
        "Application",
        "Shortlisted",
        "Interview Scheduled",
        "Selected In Interview",
        "Offer"
    ];
  
const AccordionRow = ({ eventKey, children }) => {
  const decoratedOnClick = useAccordionButton(eventKey, () => {
    setActiveKey(prev => (prev === eventKey ? null : eventKey));
  });

  return (
    <tr onClick={decoratedOnClick} style={{ cursor: "pointer" }}>
      {children}
      <td className="text-end">
        {activeKey === eventKey ? "▲" : "▼"}
      </td>
    </tr>
  );
};
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
                <div className="query-section bank-style">
  <h6 className="section-title">Submit Your Request</h6>

  <div className="row g-4">
    {/* LEFT SIDE */}
    <div className="col-md-7">
      <div className="">
        <label className="form-label">Request Type *</label>
        <select className="form-select">
          <option value="">Select Request Type</option>
          <option value="reschedule">Interview Reschedule</option>
          <option value="query">General Query</option>
        </select>
      </div>

      <div>
        <label className="form-label">Query Details *</label>
        <textarea
          className="form-control"
          rows="3"
          placeholder="Describe your query here..."
        />
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="col-md-5">
      <label className="form-label">Attachment (Optional)</label>
      <div className="upload-card">
        <div className="upload-icon">⬆</div>
        <div className="upload-text">Upload document</div>
        <div className="upload-subtext">PDF, DOC, JPG, PNG</div>
      </div>
       {/* ACTIONS */}
  <div className="query-actions">
    <button
      className="btn btn-outline-secondary"
      onClick={onHide}
    >
      Cancel
    </button>
    <button className="btn btn-primary">Submit</button>
  </div>
    </div>
  </div>

 
</div>
                {/* ===== REQUEST HISTORY ===== */}
             <div className="query-section bank-style request-history">
  <h6 className="section-title">Request History</h6>

  <Accordion defaultActiveKey="0">

    {/* REQUEST 1 */}
    <table className="table history-table">
      <tbody>
        <AccordionRow eventKey="0">
          <td>Interview Reschedule</td>
          <td>Request to reschedule technical round due to conflict</td>
          <td>29-09-2025 02:51 PM</td>
          <td className="status approved">Approved</td>
        </AccordionRow>
      </tbody>
    </table>

    <Accordion.Collapse eventKey="0">
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
    </Accordion.Collapse>

    {/* REQUEST 2 */}
    <table className="table history-table">
      <tbody>
        <AccordionRow eventKey="1">
          <td>Document Missing</td>
          <td>Uploaded my experience document for my previous company</td>
          <td>25-09-2025 10:30 AM</td>
          <td className="status pending">Pending</td>
        </AccordionRow>
      </tbody>
    </table>

    <Accordion.Collapse eventKey="1">
      <div className="history-thread">
        <div className="thread-item candidate">
          <div className="avatar">C</div>
          <div>
            <strong>Request raised by Candidate</strong>
            <p>
              Uploaded my previous experience document as requested.
            </p>
            <span className="time">25-09-2025 10:30 AM</span>
          </div>
        </div>
      </div>
    </Accordion.Collapse>

  </Accordion>
</div>
            </Modal.Body>
        </Modal>
    );
};

export default TrackApplicationModal;
