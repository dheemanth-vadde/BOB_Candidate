import React from "react";
import { Modal } from "react-bootstrap";
import "../../../css/Relevantjobs.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSearch,
  faLightbulb,
   faCalendarAlt,
  faCalendarTimes
} from "@fortawesome/free-solid-svg-icons";
const KnowMoreModal = ({ show, onHide, selectedJob }) => {
  if (!selectedJob) return null;
  console.log("knowmore selected Job", selectedJob)

    const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="job-detail-modal"
    >
      <Modal.Header closeButton className="knowmore-header">
        <div className="header-content w-100">
          
          {/* ===== Top Row: Requisition + Dates ===== */}
          <div className="req-date-row">
            <span className="req-code">
              {selectedJob?.requisition_code}
            </span>

            <span className="date-item">
              <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
              Start: {formatDate(selectedJob?.registration_start_date)}
            </span>

            <span className="date-divider">|</span>

            <span className="date-item">
              <FontAwesomeIcon icon={faCalendarTimes} className="date-icon" />
              End: {formatDate(selectedJob?.registration_end_date)}
            </span>
          </div>

          {/* ===== Job Title ===== */}
          <div className="job-title-main">
            {selectedJob?.position_title}
          </div>

        </div>
      </Modal.Header>


      <Modal.Body className="p-4">
        {/* Top Stats Box */}
        <div className="stats-container mb-3">
          <div className="row">
            <div className="col-md-4 mb-2">
              <span className="stat-label">Employment Type:</span> <span className="stat-value">{selectedJob.employment_type || "N/A"}</span>
            </div>
            {selectedJob.employment_type === "contract" && (
            <div className="col-md-4 mb-2">
              <span className="stat-label">Contract Period:</span> <span className="stat-value">{selectedJob.contract_period || "N/A"}</span>
            </div>
            )}
            <div className="col-md-4 mb-2">
              <span className="stat-label">Eligibility Age:</span> <span className="stat-value">{selectedJob.eligibility_age_min} -{" "}
                      {selectedJob.eligibility_age_max} years</span>
            </div>
            <div className="col-md-4 mb-2">
              <span className="stat-label">Experience:</span> <span className="stat-value">  {selectedJob.mandatory_experience} years</span>
            </div>
            <div className="col-md-4">
              <span className="stat-label">Department:</span> <span className="stat-value">{selectedJob.dept_name}</span>
            </div>
            <div className="col-md-4">
              <span className="stat-label">Vacancies:</span> <span className="stat-value">{selectedJob.no_of_vacancies}</span>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="info-card mb-3">
          <h6 className="card-section-header">Mandatory Education:</h6>
           <ul className="custom-list">
            {selectedJob.mandatory_qualification ? (
              <li>{selectedJob.mandatory_qualification}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
          <h6 className="card-section-header">Preferred Education:</h6>
          <ul className="custom-list">
            {selectedJob.preferred_qualification ? (
              <li>{selectedJob.preferred_qualification}</li>
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
       {/* ================= VACANCY DISTRIBUTION ================= */}
{/* ================= VACANCY DISTRIBUTION TABLE ================= */}
{selectedJob.vacancy_distribution?.length > 0 && (
  <div className="info-card mt-4">
    <h6 className="card-section-header">Vacancy Distribution (State-wise)</h6>

    <div className="table-responsive">
      <table className="table table-bordered vacancy-table">
        <thead>
          <tr>
            <th rowSpan="2">State Name</th>
            <th rowSpan="2">Vacancies</th>
            <th colSpan="6" className="text-center">Category</th>
            <th colSpan="5" className="text-center">Out of Which (Disability)</th>
          </tr>
          <tr>
            <th>SC</th>
            <th>ST</th>
            <th>OBC</th>
            <th>EWS</th>
            <th>GEN</th>
            <th>TOTAL</th>
            <th>OC</th>
            <th>HI</th>
            <th>VI</th>
            <th>ID</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {selectedJob.vacancy_distribution.map((dist, index) => {
            const disabilityTotal =
              (dist.disability?.OC || 0) +
              (dist.disability?.HI || 0) +
              (dist.disability?.VI || 0) +
              (dist.disability?.ID || 0);

            return (
              <tr key={index}>
                <td>{dist.state_name}</td>
                <td>{dist.total}</td>

                <td>{dist.general.SC}</td>
                <td>{dist.general.ST}</td>
                <td>{dist.general.OBC}</td>
                <td>{dist.general.EWS}</td>
                <td>{dist.general.GEN}</td>
                <td>{dist.total}</td>

                <td>{dist.disability.OC}</td>
                <td>{dist.disability.HI}</td>
                <td>{dist.disability.VI}</td>
                <td>{dist.disability.ID}</td>
                <td>{disabilityTotal}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}

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