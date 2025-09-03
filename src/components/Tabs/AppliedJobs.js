import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import "../../css/Relevantjobs.css";
import apiService from "../../services/apiService";
import { useSelector } from "react-redux";

const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const user = useSelector((state) => state.user.user);
  const candidateId = user?.candidate_id;

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!candidateId) return;

      try {
        const response = await apiService.appliedpositions(candidateId);
        console.log("Applied jobs response:", response);
        let jobsArray = [];

        if (response?.success && Array.isArray(response.data)) {
          jobsArray = response.data;
        } else if (Array.isArray(response)) {
          jobsArray = response;
        }

        setAppliedJobs(jobsArray);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
        setAppliedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [candidateId]);

  const filteredJobs = appliedJobs.filter(
    (job) =>
      job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requisition_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKnowMore = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="d-flex justify-content-end mb-3">
        <div className="input-group searchinput" style={{ maxWidth: "350px" }}>
          <span
            className="input-group-text"
            style={{ backgroundColor: "rgb(255, 112, 67)" }}
          >
            <FontAwesomeIcon icon={faSearch} style={{ color: "#fff" }} />
          </span>
          <input
            type="text"
            className="form-control title"
            placeholder="Search by Job title or Req code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", margin: "20px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading Applied Jobs...</p>
        </div>
      )}

      <div className="row" id="matched-jobs-container">
        {filteredJobs.length === 0 && !loading && (
          <p>No applied jobs found.</p>
        )}
        <div className="col-md-12">
          {filteredJobs.map((job) => (
            <div className="col-md-12 mb-4" key={job.position_id}>
              <div
                className="card h-100"
                style={{
                  background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
                  boxShadow: "0px 8px 20px rgba(0, 123, 255, 0.15)",
                  borderRadius: "12px",
                  border: 0,
                }}
              >
                <div className="card-body job-main-header-sec">
                  <h6 className="job-title">
                    {job.requisition_code} - {job.position_title}
                  </h6>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-success d-flex align-items-center gap-2 px-4 py-2">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>Applied</span>
                    </div>
                    <button
                      className="btn btn-sm knowntb ms-2"
                      onClick={() => handleKnowMore(job)}
                    >
                      Know More
                    </button>
                  </div>

                  <p className="mb-1 text-muted small">
                    <span className="subtitle">Employment Type:</span>{" "}
                    {job.employment_type}
                  </p>
                  <p className="mb-1 text-muted small">
                    <span className="subtitle">Eligibility Age:</span>{" "}
                    {job.eligibility_age_min} - {job.eligibility_age_max} years
                  </p>
                  <p className="mb-1 text-muted small">
                    <span className="subtitle">Experience:</span>{" "}
                    {job.mandatory_experience} years
                  </p>
                  <p className="mb-1 text-muted small">
                    <span className="subtitle">Department:</span>{" "}
                    {job.department_name}
                  </p>
                  <p className="mb-1 text-muted small">
                    <span className="subtitle">Location:</span>{" "}
                    {job.location_name}
                  </p>
                  <p className="mb-1 text-muted small">
                    <span className="subtitle">Qualification:</span>{" "}
                    {job.mandatory_qualification}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
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
            onClick={handleCloseModal}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AppliedJobs;
