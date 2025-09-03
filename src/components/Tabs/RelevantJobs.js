import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faMapMarkerAlt,
  faCalendarAlt,
  faUsers,
  faClock,
  faTools,
  faCheckCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import "../../css/Relevantjobs.css";
import axios from "axios";
import { toast } from "react-toastify";
import apiService from "../../services/apiService";
import { useSelector } from "react-redux";
import Razorpay from "../Razorpay";

const RelevantJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 NEW

  const user = useSelector((state) => state.user.user);
  const candidateId = user?.candidate_id;

  const fetchAppliedJobs = async () => {
  if (!candidateId) return; // wait until candidateId exists

  try {
    console.log("Fetching applied jobs for candidateId:", candidateId);
    const response = await apiService.appliedpositions(candidateId);

    let jobsArray = [];

    if (response?.success && Array.isArray(response.data)) {
      jobsArray = response.data;
    } else if (Array.isArray(response)) {
      jobsArray = response;
    }

    setAppliedJobs(jobsArray);
  } catch (error) {
    console.error("Error in fetchAppliedJobs:", error);

    // Only show toast for true server/network errors
    // if (error.response || error.request) {
    //   toast.error("Failed to load applied jobs. Please try refreshing the page.");
    // }

    setAppliedJobs([]);
  }
};


  const fetchJobs = async () => {
    try {
      await fetchAppliedJobs();
      const response = await axios.get(
        "https://bobjava.sentrifugo.com:8443/jobcreation/api/active_jobs"
      );
      console.log("Fetched jobs:", response.data);
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
     if (candidateId) {
    fetchJobs();
  }
  },  [candidateId]);

  const isJobApplied = (jobId) => {
    return appliedJobs.some(
      (job) => String(job.position_id).trim() === String(jobId).trim()
    );
  };

  const handleApplyClick = (job) => {
    if (isJobApplied(job.position_id)) return;
    setJobToApply(job);
    setShowPaymentModal(true);
  };

  const handleConfirmApply = async () => {
    if (!jobToApply) return;

    try {
      await apiService.applyJobs({
        position_id: jobToApply.position_id,
        candidate_id: candidateId,
      });
      setAppliedJobs((prev) => [
        ...prev,
        { position_id: jobToApply.position_id },
      ]);
      toast.success("Application submitted successfully!");
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

  // 🔹 Filter jobs based on search
  const filteredJobs = jobs.filter((job) =>
    (job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requisition_code?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* 🔹 Search Bar */}
      <div className="d-flex justify-content-end mb-3 ">
        <div className="input-group searchinput" style={{ maxWidth: "350px"}}>
          <span className="input-group-text" style={{ backgroundColor: "rgb(255, 112, 67)" }}>
            <FontAwesomeIcon icon={faSearch}  style={{color:' #fff'}}/>
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
          <p>Loading Careers...</p>
        </div>
      )}

      <div className="row" id="matched-jobs-container">
        {filteredJobs.length === 0 && !loading && (
          <p>No matching jobs found.</p>
        )}
    <div
      className="col-md-3 bob-left-fixed-filter bob-mob-side-filter"
      style={{ paddingBottom: "30px" }}
    >
      {/* Header */}
      <div className="bob-left-filter-div">
        <strong>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19.005"
            height="17.413"
            viewBox="0 0 19.005 17.413"
            fill="#707070"
          >
            <g transform="translate(-4.77 -5.962)">
              <path
                d="M82.529,81.927H71.206a2.335,2.335,0,0,0-4.428,0H65.01a.743.743,0,0,0,0,1.487h1.767a2.335,2.335,0,0,0,4.428,0H82.529a.743.743,0,1,0,0-1.487ZM68.992,83.519a.849.849,0,1,1,.849-.849A.85.85,0,0,1,68.992,83.519Z"
                transform="translate(-59.497 -74.372)"
              />
              <path
                d="M82.529,210.46H80.761a2.335,2.335,0,0,0-4.428,0H65.01a.743.743,0,0,0,0,1.487H76.333a2.335,2.335,0,0,0,4.428,0h1.767a.743.743,0,1,0,0-1.487Zm-3.981,1.593a.849.849,0,1,1,.849-.849A.85.85,0,0,1,78.547,212.052Z"
                transform="translate(-59.497 -196.534)"
              />
              <path
                d="M82.529,338.993H74.391a2.335,2.335,0,0,0-4.428,0H65.01a.743.743,0,0,0,0,1.487h4.953a2.335,2.335,0,0,0,4.428,0h8.138a.743.743,0,1,0,0-1.487Zm-10.352,1.593a.849.849,0,1,1,.849-.849A.85.85,0,0,1,72.177,340.585Z"
                transform="translate(-59.497 -318.697)"
              />
            </g>
          </svg>
          <span style={{ marginLeft: "8px" }}>Filters</span>
        </strong>
      </div>

      {/* Filters */}
      <div
        className="bob-left-custom-filter-div"
        style={{
          background: "#fff",
          boxShadow: "0 3px 6px #1a2c7129",
          borderRadius: "10px",
          padding: "20px 10px",
          marginTop: "25px",
        }}
      >
        <div className="bob-filter-c-div bob-inner-categories-c-div">
          <h6>Filter By </h6>

          <div className="career-checkbox-div">
            <div className="form-group bob-form-control bob-check-radio-form-control">
              <input
                className="form-check-input"
                type="checkbox"
                id="SeniorManagerBullion"
                value="Senior Manager - Bullion"
                // checked={selectedDepartments.includes("Senior Manager - Bullion")}
                // onChange={() => handleChange("Senior Manager - Bullion")}
              />
              <label
                className="form-check-label"
                htmlFor="SeniorManagerBullion"
              >
                &nbsp;Department
              </label>
            </div>

            <div className="form-group bob-form-control bob-check-radio-form-control">
              <input
                className="form-check-input"
                type="checkbox"
                id="DigitalMsmeRiskManagement"
                value="Digital MSME Risk Management"
                
              />
              <label
                className="form-check-label"
                htmlFor="DigitalMsmeRiskManagement"
              >
                &nbsp;Location
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

     <div class="col-md-9" >
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
                  {/* <FontAwesomeIcon
                    icon={faUser}
                    className="me-2 text-secondary"
                  /> */}
                  
                    {job.requisition_code} - {job.position_title}
                 
                </h6>
                <div className="justify-content-between align-items-center apply_btn">
                  <div className="d-flex ">
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
                        <b>Apply Now</b>
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
                <p className="mb-1 text-muted small size35">
                  {/* <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="me-2 text-muted"
                  /> */}
                  <span class="subtitle">Employment Type:</span> {job.employment_type}
                </p>

                <p className="mb-1 text-muted small size35">
                  {/* <FontAwesomeIcon
                    icon={faUsers}
                    className="me-2 text-muted"
                  /> */}
                  <span class="subtitle">Eligibility Age:</span> {job.eligibility_age_min} -{" "}
                  {job.eligibility_age_max} years
                </p>

                <p className="mb-1 text-muted small size30">
                  {/* <FontAwesomeIcon
                    icon={faClock}
                    className="me-2 text-muted"
                  /> */}
                  <span class="subtitle">Experience:</span> {job.mandatory_experience} years
                </p>
                <p className="mb-1 text-muted small size35">
                  {/* <FontAwesomeIcon
                    icon={faClock}
                    className="me-2 text-muted"
                  /> */}
                  <span class="subtitle">Department:</span> {job.mandatory_experience} years
                </p>
                <p className="mb-1 text-muted small size35">
                  {/* <FontAwesomeIcon
                    icon={faClock}
                    className="me-2 text-muted"
                  /> */}
                  <span class="subtitle">Location:</span> {job.mandatory_experience} years
                </p>

                <p className="mb-1 text-muted small qualification">
                  {/* <FontAwesomeIcon
                    icon={faTools}
                    className="me-2 text-muted"
                  /> */}
                  <span class="subtitle">Qualification:</span> {job.mandatory_qualification}
                </p>

                
              </div>
            </div>
          </div>
          
        ))}
        </div>
      </div>

      {/* ✅ Payment Confirmation Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        centered
      >
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

          {jobToApply && (
            <Razorpay
              onSuccess={handleConfirmApply}
              position_id={jobToApply.position_id}
              amountPaise={jobToApply?.application_fee_paise ?? 50000}
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

export default RelevantJobs;
