import React from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faCalendar, faUser, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import "../../css/Relevantjobs.css";

const KnowMoreModal = ({ show, onHide, selectedJob }) => {
  if (!selectedJob) return null;

  return (
     <Modal show={show} onHide={onHide} centered  size="lg"  className="modalwidth">
         <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="text-primary">
            {selectedJob?.position_title || "Job Details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {selectedJob && (
            <div className="job-details">
              <h5 className="section-header">Job Description</h5>
              <p className="mb-4">
                {selectedJob.description || "No description available"}
              </p>

              <div className="row">
                <div className="col-md-6">
                  <h6 className="section-header">Key Details</h6>
                  <ul className="list-unstyled">
                    <li>
                      <strong>Employment Type:</strong>{" "}
                      {selectedJob.employment_type || "N/A"}
                    </li>
                    <li>
                      <strong>Eligibility Age:</strong>{" "}
                      {selectedJob.eligibility_age_min} -{" "}
                      {selectedJob.eligibility_age_max} years
                    </li>
                    <li>
                      <strong>Mandatory Experience:</strong>{" "}
                      {selectedJob.mandatory_experience} years
                    </li>
                    <li>
                      <strong>Preferred Experience:</strong>{" "}
                      {selectedJob.preferred_experience} years
                    </li>
                  </ul>
                </div>

                <div className="col-md-6">
                  <h6 className="section-header">Requirements</h6>
                  <ul className="list-unstyled">
                    <li>
                      <strong>Mandatory Qualification:</strong>{" "}
                      {selectedJob.mandatory_qualification || "Not specified"}
                    </li>
                    <li>
                      <strong>Preferred Qualification:</strong>{" "}
                      {selectedJob.preferred_qualification || "Not specified"}
                    </li>
                    <li>
                      <strong>Probation Period:</strong>{" "}
                      {selectedJob.probation_period} months
                    </li>
                    <li>
                      <strong>Documents Required:</strong>{" "}
                      {selectedJob.documents_required || "Not specified"}
                    </li>
                  </ul>
                </div>
              </div>

              {selectedJob.roles_responsibilities && (
                <div className="mt-4">
                  <h6 className="section-header">Roles & Responsibilities</h6>
                  <p className="text-muted">
                    {selectedJob.roles_responsibilities}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <button
            className="btn btn-outline-secondary"
           onClick={onHide}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
  );
};

export default KnowMoreModal;
