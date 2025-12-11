import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSearch,
  faLightbulb
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import "../../css/Relevantjobs.css";
import { toast } from "react-toastify";
import PreviewModal from "./PreviewModal";
import PreferenceModal from "./PreferenceModal";
import apiService from "../../services/apiService";
import { useSelector } from "react-redux";

const RelevantJobs = ({ candidateData = {} }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    state1: "",
    location1: "",
    state2: "",
    location2: "",
    state3: "",
    location3: "",
    ctc: "",
    examCenter: "",
  });
const [showPreviewModal, setShowPreviewModal] = useState(false);

const [previewData, setPreviewData] = useState({
  personalDetails: {
    fullName: "Jagadeesh",
    address: "Flat 25/123-A, Jagadgirigutta, Kukatpally, Hyderabad, Andhra Pradesh, 500090",
    permanentAddress: "Flat 25/123-A, Jagadgirigutta, Kukatpally, Hyderabad, Andhra Pradesh, 500090",
    mobile: "9998887777",
    email: "jagadeesh.karthik@gmail.com",
    fatherName: "Karthik Name",
    dob: "01-01-1994",
    maritalStatus: "Married",
    religion: "Hindu",
    nationality: "Indian",
    expectedCTC: "22 LPA",
    location1: "Andhra Pradesh - Guntur",
    location2: "Maharashtra - Mumbai",
    location3: "Telangana - Hyderabad",
  },
  education: [
    {
      degree: "B.Tech (Information Technology)",
      board: "Jawaharlal Nehru Technological University",
      subject: "Computer Science and Engineering",
      passingMonth: "June 2016",
      division: "First Class",
      marks: "8.09 GPA",
    },
    {
      degree: "Master of Business Administration (MBA)",
      board: "Indian Institute of Management",
      subject: "Finance & Marketing",
      passingMonth: "April 2020",
      division: "First Class",
      marks: "7.9 GPA",
    },
  ],
  experience: [
    {
      org: "Tech Solutions Pvt Ltd",
      designation: "Software Engineer",
      department: "IT Development",
      from: "July 2016",
      to: "March 2019",
      duration: "2 Years 9 Months",
      nature: "Full-stack development, UI design, database management",
    },
    {
      org: "PayTech Innovations",
      designation: "Senior Product Manager",
      department: "Digital Commerce",
      from: "April 2021",
      to: "Present",
      duration: "3 Years 8 Months",
      nature: "Leading ONDC integration, digital product solutions, cross-functional team leadership",
    },
  ],
  // ✅ Add this summary block
  experienceSummary: {
    total: "6 Years 8 Months",
    relevant: "5 Years 2 Months",
    designation: "Senior Product Manager",
  },
});


  const user = useSelector((state) => state.user.user);
  const candidateId = user?.candidate_id;

  // ✅ Fetch requisitions
  const fetchRequisitions = async () => {
    try {
    const response = await apiService.getReqData();
    // const response={      "requisition_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",      "requisition_code": "string",      "requisition_title": "string",      "requisition_description": "string",      "registration_start_date": "2025-12-10",      "registration_end_date": "2025-12-10",      "requisition_status": "string",      "requisition_comments": "string",      "requisition_approval": "string",      "no_of_positions": 0,      "job_postings": "string",      "requisition_approval_notes": "string",      "count": 0,      "fullfillment": 0    }
      console.log("Requisitions:", response);
      if (response ) {
       setRequisitions(response.data);
        //setRequisitions(response);
      }
    } catch (error) {
      console.error("Error fetching requisitions:", error);
      toast.error("Failed to load requisitions");
    }
  };

  // ✅ Fetch jobs
  const fetchJobs = async () => {
    try {
      const jobsResponse = await apiService.getActiveJobs();
     const jobsData = jobsResponse?.data || [];
     const masterDataResponse = await apiService.getMasterData();
    // const jobsResponse={      "position_id": "dda389eb-9377-42cf-8583-f40a3e7a809a",      "requisition_id": "1dc5909e-f294-4cff-b70c-d4e1fb629664",      "position_title": "Local Bank Officer",      "requisition_code": "JREQ-1000",      "requisition_title": "DV  TEST sadfas",      "position_code": "JPOS5001",      "description": "LBO",      "roles_responsibilities": "ddf",      "grade_id": "0cb8e408-624c-4d56-969d-df7ebc201eb9",      "employment_type": "Part-Time",      "eligibility_age_min": 33,      "eligibility_age_max": 44,      "mandatory_qualification": "fgfg",      "preferred_qualification": "",      "mandatory_experience": 4,      "preferred_experience": null,      "probation_period": 0,      "documents_required": "dgfd",      "min_credit_score": null,      "dept_id": "1c26a371-5967-491e-8e79-d2a3f161ff4b",      "location_id": null,      "special_cat_id": null,      "reservation_cat_id": null,      "no_of_vacancies": 14,      "selection_procedure": "",      "position_status": "Active",      "min_salary": null,      "max_salary": null,      "grade_name": "Grade I (30000 - 50000)",      "dept_name": "General Admin",      "location_name": null,      "country_id": null,      "city_id": null,      "state_id": null,      "job_relaxation_policy_id": "a5fea36f-5487-4daf-b8c1-6273c243e8a0",      "job_relaxation_policy_json": null,      "panels": [        "75c5e549-3aac-43e1-b9d0-912ac4207f40",        "09c1daf3-c1b5-4fc2-9e2d-9916bad0ada2"      ]
    // }

       // const jobsData = jobsResponse || [];
      const departments = masterDataResponse.departments || [];
      const locations = masterDataResponse.locations || [];

      setDepartments(departments);
      setLocations(locations);

      const mappedJobs = jobsData.map((job) => {
        const department = departments.find((d) => d.department_id === job.dept_id);
        const location = locations.find((l) => l.location_id === job.location_id);

        return {
          ...job,
          department_name: department ? department.department_name : "Unknown",
          location_name: location ? location.location_name : "Unknown",
        };
      });

      setJobs(mappedJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch applied jobs
  const fetchAppliedJobs = async () => {
    if (!candidateId) return;
    try {
      const response = await apiService.appliedpositions(candidateId);
      setAppliedJobs(response?.data || []);
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      setAppliedJobs([]);
    }
  };

  useEffect(() => {
   fetchRequisitions();
    fetchJobs();
  }, []);

  useEffect(() => {
    if (candidateId) fetchAppliedJobs();
  }, [candidateId]);

  const isJobApplied = (jobId) =>
    appliedJobs.some((job) => String(job.position_id) === String(jobId));

  // ✅ Open Add Preference modal instead of Razorpay
  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleKnowMore = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
    setApplyForm({
      state1: "",
      location1: "",
      state2: "",
      location2: "",
      state3: "",
      location3: "",
      ctc: "",
      examCenter: "",
    });
  };

  const handleApplySubmit = async () => {
    if (!applyForm.ctc || !applyForm.examCenter) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      await apiService.applyJobs({
        position_id: selectedJob.position_id,
        candidate_id: candidateId,
        preferences: applyForm,
      });
      toast.success("Application submitted successfully!");
      setAppliedJobs((prev) => [...prev, { position_id: selectedJob.position_id }]);
      setShowApplyModal(false);
    } catch (error) {
      toast.error("Failed to submit application.");
    }
  };

  // ✅ Filters (unchanged)
  const unappliedJobs = jobs.filter(
    (job) =>
      !appliedJobs.some(
        (applied) => String(applied.position_id) === String(job.position_id)
      )
  );

  const filteredJobs = unappliedJobs.filter((job) => {
    const matchesDepartment =
      selectedDepartments.length === 0 || selectedDepartments.includes(job.dept_id);
    const matchesLocation =
      selectedLocations.length === 0 || selectedLocations.includes(job.location_id);
    const matchesSearch =
      job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requisition_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRequisition =
      !selectedRequisition || String(job.requisition_id) === String(selectedRequisition);

    return matchesDepartment && matchesLocation && matchesSearch && matchesRequisition;
  });

  const handleDepartmentChange = (deptId) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId]
    );
  };

  const handleLocationChange = (locationId) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSearchTerm("");
  };

  return (
    <div className="mx-4 my-3">
      {/* 🔹 Search and Requisition Dropdown */}
      <div className="d-flex justify-content-end mb-3 row">
        <div className="d-flex justify-content-center" style={{ flex: 1 }}>
          <div style={{ minWidth: "250px" }}>
            <select
              className="form-select"
              value={selectedRequisition}
              onChange={(e) => setSelectedRequisition(e.target.value)}
            >
              <option value="">All Requisitions</option>
              {requisitions
                .filter((req) => req.requisition_status === "Approved")
                .map((req) => (
                  <option key={req.requisition_id} value={req.requisition_id}>
                    {req.requisition_title || `Requisition ${req.requisition_id}`}
                  </option>
                ))}
            </select>
          </div>
        </div>

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

      {/* Filters + Job Cards */}
      <div className="row" id="matched-jobs-container">
        {/* Left Filters (unchanged) */}
        <div
          className="col-md-3 bob-left-fixed-filter bob-mob-side-filter"
          style={{ paddingBottom: "30px" }}
        >
          <div className="bob-left-filter-div">
            <strong>Filters</strong>
          </div>
          <div
            className="bob-left-custom-filter-div"
            style={{
              background: "#fff",
              boxShadow: "0 3px 6px #1a2c7129",
              borderRadius: "10px",
              padding: "20px 10px",
              marginTop: "25px",
              border: "1px solid #eaeaea",
            }}
          >
            <div className="bob-filter-c-div bob-inner-categories-c-div">
              <h6>Departments</h6>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {departments.map((dept) => (
                  <div key={dept.department_id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedDepartments.includes(dept.department_id)}
                      onChange={() => handleDepartmentChange(dept.department_id)}
                    />
                    <label className="form-check-label">
                      {dept.department_name}
                    </label>
                  </div>
                ))}
              </div>

              <h6 className="mt-3">Locations</h6>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {locations.map((location) => (
                  <div key={location.location_id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedLocations.includes(location.location_id)}
                      onChange={() => handleLocationChange(location.location_id)}
                    />
                    <label className="form-check-label">
                      {location.location_name}
                    </label>
                  </div>
                ))}
              </div>

              {(selectedDepartments.length > 0 || selectedLocations.length > 0) && (
                <button
                  className="btn btn-sm btn-outline-secondary mt-3"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Job Cards (original style restored) */}
        <div className="col-md-9">
          {filteredJobs.map((job) => (
            <div className="col-md-12 mb-4" key={job.position_id}>
              <div
                className="card h-100"
                style={{
                  background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
                  boxShadow: "0px 8px 20px rgba(0, 123, 255, 0.15)",
                  borderRadius: "12px",
                  border: "1px solid #eaeaea",
                }}
              >
                <div className="card-body job-main-header-sec">
                  <div className="left_content">
                    <h6 className="job-title">
                      {job.requisition_code} - {job.position_title}
                    </h6>
                    <p className="mb-1 text-muted small size35">
                      <span className="subtitle">Employment Type:</span>{" "}
                      {job.employment_type}
                    </p>
                    <p className="mb-1 text-muted small size35">
                      <span className="subtitle">Eligibility Age:</span>{" "}
                      {job.eligibility_age_min} - {job.eligibility_age_max} years
                    </p>
                    <p className="mb-1 text-muted small size30">
                      <span className="subtitle">Experience:</span>{" "}
                      {job.mandatory_experience} years
                    </p>
                    <p className="mb-1 text-muted small size35">
                      <span className="subtitle">Department:</span>{" "}
                      {job.department_name}
                    </p>
                    <p className="mb-1 text-muted small size35">
                      <span className="subtitle">Location:</span>{" "}
                      {job.location_name}
                    </p>
                    <p className="mb-1 text-muted small qualification">
                      <span className="subtitle">Qualification:</span>{" "}
                      {job.mandatory_qualification}
                    </p>
                  </div>
                  <div className="justify-content-between align-items-center apply_btn">
                    {isJobApplied(job.position_id) ? (
                      <div className="text-success d-flex align-items-center gap-2 px-4 py-2">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Applied</span>
                      </div>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-outline-primary hovbtn"
                          onClick={() => handleApplyClick(job)}
                        >
                          Apply Now
                        </button>
                        <button
                          className="btn btn-sm knowntb"
                          onClick={() => handleKnowMore(job)}
                        >
                          Know More
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Add Preference Modal */}
 <Modal show={showApplyModal} onHide={handleCloseApplyModal} centered size="lg">
  <Modal.Header className="border-0 p-0" style={{ backgroundColor: "#fff" }}>
    <button
      type="button"
      className="btn-close position-absolute"
      style={{ top: "1.2rem", right: "1.2rem" }}
      onClick={handleCloseApplyModal}
      aria-label="Close"
    ></button>
  <div
    className="w-100 p-3"
    style={{
      borderRadius: "8px",
      backgroundColor: "#FFF8F3",
      borderBottom: "1px solid #F0E0D0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      position: "relative",
      margin:"38px"
    }}
  >
    {/* Close Button */}
    

    {/* Advertisement Number */}
    <div
      style={{
        fontSize: "1rem",
        color: "#000",
        fontWeight: "600",
        marginBottom: "6px",
      }}
    >
      Advt. No:-{" "}
      <span style={{ color: "#000", fontWeight: "bold" }}>
        {selectedJob?.requisition_code || "BOB/HRM/REC/ADVT/2025/17"}
      </span>
    </div>

    {/* Position for Application */}
    <div
      style={{
        fontSize: "1.05rem",
        fontWeight: "600",
        color: "#1A2C71",
        marginBottom: "10px",
      }}
    >
      Position for Application:-{" "}
      <span style={{ color: "#1A2C71" }}>
        {selectedJob?.position_title || "Deputy Manager: Product - ONDC"}
      </span>
    </div>

    {/* Info Box */}
    <div
      className="d-flex align-items-start p-2"
      style={{
        backgroundColor: "#FFF3E0",
        border: "1px solid #FFCC80",
        borderRadius: "6px",
        fontSize: "0.9rem",
        color: "#5D4037",
        marginBottom: "4px",
      }}
    >
      <FontAwesomeIcon
        icon={faLightbulb}
        className="me-2 mt-1"
        style={{ color: "#FF6F00" }}
      />
      <span>
        All profile-related data will be dynamically sourced from the candidate's profile records
      </span>
    </div>
  </div>
</Modal.Header>

  <Modal.Body>
    <h5 className="mb-4" style={{ color: "#1A2C71" }}>
      Add Preference
    </h5>

    <div className="row g-3">
      {/* First Row */}
      <div className="col-md-3">
        <label className="form-label fw-medium">State preference 1</label>
        <select className="form-select">
          <option value="">Select State</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-medium">Location preference 1</label>
        <select className="form-select">
          <option value="">Select Location</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-medium">State preference 2</label>
        <select className="form-select">
          <option value="">Select State</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-medium">Location preference 2</label>
        <select className="form-select">
          <option value="">Select Location</option>
        </select>
      </div>

      {/* Second Row */}
      <div className="col-md-3">
        <label className="form-label fw-medium">State preference 3</label>
        <select className="form-select">
          <option value="">Select State</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-medium">Location Pref 3</label>
        <select className="form-select">
          <option value="">Select Location</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-medium">
          Expected CTC (in Lakhs) <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter expected CTC"
        />
      </div>
      <div className="col-md-3">
        <label className="form-label fw-medium">
          Exam/Interview Center <span className="text-danger">*</span>
        </label>
        <select className="form-select">
          <option value="">Select Center</option>
        </select>
      </div>
    </div>

    <div className="d-flex justify-content-between mt-4 pt-3 border-top">
      <button
        className="btn btn-outline-secondary"
        onClick={handleCloseApplyModal}
      >
        ← Back
      </button>
      <button
        className="btn"
        style={{
          backgroundColor: "#FF6F00",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          padding: "8px 20px",
        }}
        onClick={() => {
  setShowApplyModal(false);
  setShowPreviewModal(true);
}}
      >
        Go to Preview
      </button>
    </div>
  </Modal.Body>
</Modal>


      {/* ✅ Original Know More Modal (unchanged) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} className="modalwidth">
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
              <hr />
              <div className="row">
                <div className="col-md-6">
                  <h6 className="section-header">Key Details</h6>
                  <ul className="list-unstyled fontweight overul">
                    <li><span>Employment Type:</span> {selectedJob.employment_type || "N/A"}</li>
                    <li><span>Eligibility Age:</span> {selectedJob.eligibility_age_min} - {selectedJob.eligibility_age_max} years</li>
                    <li><span>Mandatory Experience:</span> {selectedJob.mandatory_experience} years</li>
                    <li><span>Preferred Experience:</span> {selectedJob.preferred_experience} years</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="section-header">Requirements</h6>
                  <ul className="list-unstyled overul">
                    <li><span>Mandatory Qualification:</span> {selectedJob.mandatory_qualification || "Not specified"}</li>
                    <li><span>Preferred Qualification:</span> {selectedJob.preferred_qualification || "Not specified"}</li>
                    <li><span>Probation Period:</span> {selectedJob.probation_period} months</li>
                    <li><span>Documents Required:</span> {selectedJob.documents_required || "Not specified"}</li>
                  </ul>
                </div>
              </div>
              <hr />
              {selectedJob.roles_responsibilities && (
                <div className="mt-2">
                  <h6 className="section-header">Roles & Responsibilities</h6>
                  <p className="text-muted overres">{selectedJob.roles_responsibilities}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>


{/* Preview Modal */}
      <PreviewModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        previewData={previewData}
        onBack={() => {
          setShowPreviewModal(false);
          setShowApplyModal(true);
        }}
        onEditProfile={() => {
          // Handle edit profile action
          setShowPreviewModal(false);
          // You might want to navigate to profile page or open edit modal
          toast.info("Redirecting to profile editor...");
        }}
        onProceedToPayment={() => {
          // Handle proceed to payment action
          toast.success("Proceeding to payment...");
          // Add payment processing logic here
        }}
      />

    </div>
  );
};

export default RelevantJobs;
