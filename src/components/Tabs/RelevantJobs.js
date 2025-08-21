// RelevantJobs.jsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faMapMarkerAlt,
  faCalendarAlt,
  faUsers,
  faClock,
  faTools,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import "../../css/Relevantjobs.css";
import axios from "axios";
import { toast } from "react-toastify";
import apiService from "../../services/apiService";
import { useSelector } from "react-redux";
import Razorpay from "../Razorpay"; // your Razorpay component

const RelevantJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);

  const user = useSelector((state) => state.user.user);
  const candidateId = user?.candidate_id;

  const fetchAppliedJobs = async () => {
    try {
      const response = await apiService.appliedpositions(candidateId);
      setAppliedJobs(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error in fetchAppliedJobs:", error);
      toast.error("Failed to load applied jobs. Please try refreshing the page.");
      setAppliedJobs([]);
    }
  };

  const fetchJobs = async () => {
    try {
      await fetchAppliedJobs();
      const response = await axios.get(
        "https://bobjava.sentrifugo.com:8443/jobcreation/api/active_jobs"
      );
      if (response.data && response.data.success) {
        setJobs(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const isJobApplied = (jobId) => {
    return appliedJobs.some(
      (job) => String(job.position_id).trim() === String(jobId).trim()
    );
  };

  // Open confirmation modal instead of applying directly
  const handleApplyClick = (job) => {
    if (isJobApplied(job.position_id)) return;
    setJobToApply(job);
    setShowPaymentModal(true);
  };

  // Called only after successful payment
  const handleConfirmApply = async () => {
    if (!jobToApply) return;

    try {
      const response = await apiService.applyJobs({
        position_id: jobToApply.position_id,
        candidate_id: candidateId,
      });
      // if (response.status === 200) {
        // ✅ update UI immediately
        setAppliedJobs((prev) => [
          ...prev,
          { position_id: jobToApply.position_id },
        ]);
        toast.success("Application submitted successfully!");
      // }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setShowPaymentModal(false);
      setJobToApply(null);
    }
  };

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
      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", margin: "20px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading Relevant Jobs...</p>
        </div>
      )}

      <div className="row" id="matched-jobs-container">
        {jobs.length === 0 && !loading && <p>No matching jobs found.</p>}

        {jobs.map((job) => (
          <div className="col-md-4 mb-4" key={job.position_id}>
            <div className="card h-100"
              style={{
                background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
                boxShadow: "0px 8px 20px rgba(0, 123, 255, 0.15)",
                borderRadius: "12px",
                border: 0,
              }}>
              <div className="card-body">
                <h6 className="job-title">
                  <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                  <b>{job.position_title}</b>
                </h6>

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
                  <b>Employment Type:</b> {job.employment_type}
                </p>

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faUsers} className="me-2 text-muted" />
                  <b>Eligibility Age:</b> {job.eligibility_age_min} - {job.eligibility_age_max} years
                </p>

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faClock} className="me-2 text-muted" />
                  <b>Experience:</b> {job.mandatory_experience} years (Mandatory)
                </p>

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faTools} className="me-2 text-muted" />
                  <b>Required Qualification:</b> {job.mandatory_qualification}
                </p>

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-muted" />
                  <b>Status:</b> {job.position_status}
                </p>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex">
                    {isJobApplied(job.position_id) ? (
                      <div className="text-success d-flex align-items-center gap-2 px-4 py-2">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Applied</span>
                      </div>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-primary hovbtn"
                        onClick={() => handleApplyClick(job)}
                      >
                        <b>Apply Online</b>
                      </button>
                    )}
                    <button
                      className="btn btn-sm knowntb ms-2"
                      onClick={() => handleKnowMore(job)}
                    >
                      Know More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Payment Confirmation Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please pay the required amount to apply for this job.</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowPaymentModal(false)}
          >
            Cancel
          </button>

          {/* ✅ Use jobToApply instead of job */}
          {jobToApply && (
            <Razorpay
              onSuccess={handleConfirmApply}
              position_id={jobToApply.position_id}
              amountPaise={jobToApply?.application_fee_paise ?? 50000} // fallback amount
              candidate={{
                id: candidateId,
                full_name: user?.full_name,
                email: user?.email,
                phone: user?.phone,
              }}
            />
          )}
        </Modal.Footer>
      </Modal>

      {/* Existing Job Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="text-primary">
            {selectedJob?.position_title || "Job Details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* ... your existing job details ... */}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <button className="btn btn-outline-secondary" onClick={handleCloseModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RelevantJobs;
