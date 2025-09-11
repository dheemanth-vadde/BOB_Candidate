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
  const [candidateDob, setCandidateDob] = useState(null);
  const user = useSelector((state) => state.user.user);
  const candidateId = user?.candidate_id;
  const [showRedirectModal, setShowRedirectModal] = useState(false);
const [redirectUrl, setRedirectUrl] = useState("");
const [candidateExperience, setCandidateExperience] = useState(0);


 // New state variables for filters
 const [departments, setDepartments] = useState([]);
 const [locations, setLocations] = useState([]);
 const [selectedDepartments, setSelectedDepartments] = useState([]);
 const [selectedLocations, setSelectedLocations] = useState([]);
 const [showFilters, setShowFilters] = useState(false);
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
// Add this utility function at the top of the file
const calculateAge = (dobString) => {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};
const meetsAgeRequirement = (candidateDob, jobMinAge, jobMaxAge) => {
  if (!candidateDob) return false;
  console.log("candidateDob",candidateDob, jobMinAge, jobMaxAge);
  const age = calculateAge(candidateDob);
  console.log("age",age);
  return age >= (jobMinAge || 18) && (!jobMaxAge || age <= jobMaxAge);
};

useEffect(() => {
  const fetchCandidateDetails = async () => {
    if (!candidateId) return;
    
    try {
      const details = await apiService.getCandidateDetails(candidateId);
      console.log("Candidate details:", details);
      console.log("Candidate details:", details.data.date_of_birth);
      if (details?.data?.date_of_birth) {
        setCandidateDob(details.data.date_of_birth);
      }
      if (details?.data?.total_experience) {
        setCandidateExperience(parseFloat(details.data.total_experience) || 0);
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    }
  };
  
  fetchCandidateDetails();
}, [candidateId]);
  const fetchJobs = async () => {
  try {
    await fetchAppliedJobs();
    const jobsResponse = await apiService.getActiveJobs();

    // Fetch master data
    const masterDataResponse = await apiService.getMasterData();

    const jobsData = jobsResponse?.data || [];
    const departments = masterDataResponse.departments || [];
    const locations = masterDataResponse.locations || [];
    // Set departments and locations from master data
    if (masterDataResponse.departments) {
      setDepartments(masterDataResponse.departments);
    }
    if (masterDataResponse.locations) {
      setLocations(masterDataResponse.locations);
    }

    // Map jobs with department and location names
    const mappedJobs = jobsData.map((job) => {
      const department = departments.find(d => d.department_id === job.dept_id);
      const location = locations.find(l => l.location_id === job.location_id);

      return {
        ...job,
        department_id: job.dept_id, // <-- ADD THIS LINE
        department_name: department ? department.department_name : "Unknown",
        location_name: location ? location.location_name : "Unknown",
      };
    });

    console.log("Mapped jobs:", mappedJobs);
    setJobs(mappedJobs);
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
  
    if (!candidateId) {
      toast.error("Please complete your profile before applying");
      return;
    }
    console.log("candidateExperience",candidateExperience);
     if (job.mandatory_experience && candidateExperience < parseFloat(job.mandatory_experience)) {
      toast.error(`This position requires at least ${job.mandatory_experience} years of experience`);
      return;
    }
  
    if (job.eligibility_age_min || job.eligibility_age_max) {
      if (!candidateDob) {
        toast.error("Please update your date of birth in your profile");
        return;
      }
  
      if (!meetsAgeRequirement(candidateDob, job.eligibility_age_min, job.eligibility_age_max)) {
        const minAge = job.eligibility_age_min || 0;
        const maxAge = job.eligibility_age_max || "No Limit";
        toast.error(`Age must be between ${minAge} - ${maxAge} years.`);
        return;
      }
    }
  
    // If all validations pass, trigger Razorpay
    setJobToApply(job); 
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
 // Filter jobs based on selected departments and locations
 // Get only the jobs the candidate has NOT applied for
const unappliedJobs = jobs.filter(
  job => !appliedJobs.some(
    applied => String(applied.position_id).trim() === String(job.position_id).trim()
  )
);

// Apply filters on the unapplied jobs
const filteredJobs = unappliedJobs.filter(job => {
  const matchesDepartment =
    selectedDepartments.length === 0 || selectedDepartments.includes(job.dept_id);

  const matchesLocation =
    selectedLocations.length === 0 || selectedLocations.includes(job.location_id);

  const matchesSearch =
    job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.requisition_code?.toLowerCase().includes(searchTerm.toLowerCase());

  return matchesDepartment && matchesLocation && matchesSearch;
});
const handleDepartmentChange = (deptId) => {
  setSelectedDepartments(prev => 
    prev.includes(deptId)
      ? prev.filter(id => id !== deptId)
      : [...prev, deptId]
  );
};

const handleLocationChange = (locationId) => {
  setSelectedLocations(prev => 
    prev.includes(locationId)
      ? prev.filter(id => id !== locationId)
      : [...prev, locationId]
  );
};

const clearFilters = () => {
  setSelectedDepartments([]);
  setSelectedLocations([]);
  setSearchTerm('');
};

  return (
    <div>
      {/* 🔹 Search Bar */}
      <div className="d-flex justify-content-end mb-3 row">
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
          border: "1px solid #eaeaea"
        }}
      >
        <div className="bob-filter-c-div bob-inner-categories-c-div">
          <h6>Filter By </h6>

          {/* Departments Filter */}
          <div className="career-checkbox-div">
            <h6 className="mt-3 mb-2">Departments</h6>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {departments.map((dept) => (
                <div key={dept.department_id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`dept-${dept.department_id}`}
                    checked={selectedDepartments.includes(dept.department_id)}
                    onChange={() => handleDepartmentChange(dept.department_id)}
                  />
                  <label className="form-check-label" htmlFor={`dept-${dept.department_id}`}>
                    {dept.department_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Locations Filter */}
          <div className="career-checkbox-div mt-3">
            <h6 className="mt-3 mb-2">Locations</h6>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {locations.map((location) => (
                <div key={location.location_id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`loc-${location.location_id}`}
                    checked={selectedLocations.includes(location.location_id)}
                    onChange={() => handleLocationChange(location.location_id)}
                  />
                  <label className="form-check-label" htmlFor={`loc-${location.location_id}`}>
                    {location.location_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {(selectedDepartments.length > 0 || selectedLocations.length > 0) && (
            <div className="mt-3">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Active Filters Count */}
          {(selectedDepartments.length > 0 || selectedLocations.length > 0) && (
            <div className="mt-2 text-muted small">
              {selectedDepartments.length} department(s) and {selectedLocations.length} location(s) selected
            </div>
          )}
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
                border: "1px solid #eaeaea"
              }}
            >
              <div className="card-body job-main-header-sec">
                <div className="left_content">
                <h6 className="job-title">
                  {/* <FontAwesomeIcon
                    icon={faUser}
                    className="me-2 text-secondary"
                  /> */}
                  
                    {job.requisition_code} - {job.position_title}
                 
                </h6>
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
                  <span class="subtitle">Department:</span> {job.department_name} 
                </p>
                <p className="mb-1 text-muted small size35">
                  {/* <FontAwesomeIcon
                    icon={faClock}
                    className="me-2 text-muted"
                  /> */}
                  <span class="subtitle">Location:</span> {job.location_name} 
                </p>

                <p className="mb-1 text-muted small qualification">
                  {/* <FontAwesomeIcon
                    icon={faTools}
                    className="me-2 text-muted"
                  /> */}
                  <span class="subtitle">Qualification:</span> {job.mandatory_qualification}
                </p>
              </div>
            <div className="justify-content-between align-items-center apply_btn">

                <div>
                  {isJobApplied(job.position_id) ? (
                    <div className="text-success d-flex align-items-center gap-2 px-4 py-2">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>Applied</span>
                    </div>
                  ) : jobToApply?.position_id === job.position_id ? (
                    <Razorpay
                      autoTrigger={true}
                      onSuccess={async () => {
                        try {
                          await apiService.applyJobs({
                            position_id: job.position_id,
                            candidate_id: candidateId,
                          });
                          setAppliedJobs((prev) => [...prev, { position_id: job.position_id }]);
                          setRedirectUrl("https://bankapps.bankofbaroda.co.in/BOBRECRUITMENT2_A25/");
                          setShowRedirectModal(true);
                        } catch (err) {
                          console.error(err);
                          toast.error("Failed to submit application.");
                        } finally {
                          setJobToApply(null);
                        }
                      }}
                      onClose={() => setJobToApply(null)} // <-- THIS FIXES YOUR ISSUE
                      position_id={job.position_id}
                      amountPaise={job?.application_fee_paise ?? 50000}
                      candidate={{
                        id: candidateId,
                        full_name: user?.full_name,
                        email: user?.email,
                        phone: user?.phone,
                      }}
                    />

                  ) : (
                    <button
                      className="btn btn-sm btn-outline-primary hovbtn"
                      onClick={() => handleApplyClick(job)}
                    >
                      Apply Now
                    </button>
                  )}


                    <button
                      className="btn btn-sm knowntb"
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
      </div>

      {/* ✅ Payment Confirmation Modal */}
      {/* <Modal
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
      </Modal> */}

      {/* Job Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} className="modalwidth">
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
                <div className="col-md-4">
                  <h6 className="section-header">Key Details</h6>
                  <ul className="list-unstyled fontweight">
                    <li>
                      <span>Employment Type:</span>{" "}
                      {selectedJob.employment_type || "N/A"}
                    </li>
                    <li>
                     <span>Eligibility Age:</span>{" "}
                      {selectedJob.eligibility_age_min} -{" "}
                      {selectedJob.eligibility_age_max} years
                    </li>
                    <li>
                     <span>Mandatory Experience:</span>{" "}
                      {selectedJob.mandatory_experience} years
                    </li>
                    <li>
                    <span>Preferred Experience:{" "}</span>
                      {selectedJob.preferred_experience} years
                    </li>
                  </ul>
                </div>

                <div className="col-md-8">
                  <h6 className="section-header">Requirements</h6>
                  <ul className="list-unstyled overul">
                    <li>
                      <span>Mandatory Qualification:</span>{" "}
                      {selectedJob.mandatory_qualification || "Not specified"}
                    </li>
                    <li>
                      <span>Preferred Qualification:</span>{" "}
                      {selectedJob.preferred_qualification || "Not specified"}
                    </li>
                    <li>
                      <span>Probation Period:</span>{" "}
                      {selectedJob.probation_period} months
                    </li>
                    <li>
                      <span>Documents Required:</span>{" "}
                      {selectedJob.documents_required || "Not specified"}
                    </li>
                  </ul>
                </div>
              </div>

              {selectedJob.roles_responsibilities && (
                <div className="mt-2">
                  <h6 className="section-header">Roles & Responsibilities</h6>
                  <p className="text-muted overres">
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
      <Modal show={showRedirectModal} onHide={() => setShowRedirectModal(false)} centered className="modelexternal">
        <Modal.Header  className="modal-header-custom">
          <Modal.Title className="externalfont">You are being redirected to an external site.</Modal.Title>
        </Modal.Header>
        {/* <Modal.Body className="text-center">
          <p>Do you want to continue?</p>
        </Modal.Body> */}
        <Modal.Footer className="custom-footer">
          <button
            className="btn btn-outline-secondary externalcolor"
            onClick={() => setShowRedirectModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary externalcolor"
            onClick={() => {
              setShowRedirectModal(false);
              window.open(redirectUrl, "_blank"); // Or window.location.href = redirectUrl;
            }}
          >
            Proceed
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RelevantJobs;
