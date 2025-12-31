import React from "react";
import { Modal } from "react-bootstrap";
import "../../../css/Relevantjobs.css";

const KnowMoreModal = ({ show, onHide, selectedJob }) => {
  if (!selectedJob) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="job-detail-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="job-title-main">
           {selectedJob?.position_title || "Job Details"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Top Stats Box */}
        <div className="stats-container mb-3">
          <div className="row">
            <div className="col-md-4 mb-2">
              <span className="stat-label">Employment Type:</span> <span className="stat-value">{selectedJob.employment_type || "N/A"}</span>
            </div>
            <div className="col-md-4 mb-2">
              <span className="stat-label">Eligibility Age:</span> <span className="stat-value">{selectedJob.eligibility_age_min} -{" "}
                      {selectedJob.eligibility_age_max} years</span>
            </div>
            <div className="col-md-4 mb-2">
              <span className="stat-label">Experience:</span> <span className="stat-value">  {selectedJob.mandatory_experience} years</span>
            </div>
            <div className="col-md-4">
              <span className="stat-label">Department:</span> <span className="stat-value">Digital</span>
            </div>
            <div className="col-md-4">
              <span className="stat-label">Vacancies:</span> <span className="stat-value">5</span>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="info-card mb-3">
          <h6 className="card-section-header">Mandatory Education:</h6>
           <ul className="custom-list">
            {selectedJob.mandatory_education ? (
              <li>{selectedJob.mandatory_education}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
          <h6 className="card-section-header">Preferred Education:</h6>
          <ul className="custom-list">
            {selectedJob.preferred_education ? (
              <li>{selectedJob.preferred_education}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
        </div>

        {/* Experience Section */}
        <div className="info-card mb-3">
          <h6 className="card-section-header">Mandatory Experience:</h6>
         <ul className="custom-list">
            {selectedJob.mandatory_experience ? (
              <li>{selectedJob.mandatory_experience}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
          <h6 className="card-section-header">Preferred Experience:</h6>
          <ul className="custom-list">
            {selectedJob.preferred_experience ? (
              <li>{selectedJob.preferred_experience}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
        </div>

        {/* Responsibilities Section */}
        <div className="info-card">
          <h6 className="card-section-header">Key Responsibilities:</h6>
          <ul className="custom-list">
            {selectedJob.roles_responsibilities ? (
              <li>{selectedJob.roles_responsibilities}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pb-4">
        <button className="ok-btn" onClick={onHide}>
          OK
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default KnowMoreModal;