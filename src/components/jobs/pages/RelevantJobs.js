import React, { useEffect, useState } from "react";
import { FontAwesomeIcon  } from "@fortawesome/react-fontawesome";

import {
  faCheckCircle,
  faSearch,
  faLightbulb
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import "../../../css/Relevantjobs.css";
import { toast } from "react-toastify";
import PreviewModal from "../components/PreviewModal";
import PreferenceModal from "../components/PreferenceModal";
import apiService from "../../../services/apiService";
import { useSelector } from "react-redux";
import axios from "axios";
import KnowMoreModal from "../components/KnowMoreModal";
import { mapJobsApiToList } from "../../jobs/mappers/jobMapper";
import { mapRequisitionsApiToList } from "../../jobs/mappers/requisitionMapper";
import { mapMasterDataApi } from "../../jobs/mappers/masterDataMapper";
import { useDispatch } from "react-redux";
import { savePreference } from "../store/preferenceSlice";
import { mapCandidateToPreview } from "../../jobs/mappers/candidatePreviewMapper";
import filtericon from "../../../assets/filter-icon.png";
import PaymentModal from "../components/PaymentModal";
const RelevantJobs = ({ candidateData = {} }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState("");
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
  const [selectedExperience, setSelectedExperience] = useState([]);
  const experienceOptions = [
    { label: "1-2 years", min: 1, max: 2 },
    { label: "3-4 years", min: 3, max: 4 },
    { label: "5-6 years", min: 5, max: 6 },
    { label: "7-8 years", min: 7, max: 8 },
    { label: "9-10 years", min: 9, max: 10 },
    { label: "11+ years", min: 11, max: Infinity },
  ];
  const ITEMS_PER_PAGE = 5; // change if needed
const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();

  const [previewData, setPreviewData] = useState();


useEffect(() => {
  setCurrentPage(1);
}, [
  searchTerm,
  selectedDepartments,
  selectedLocations,
  selectedExperience,
  selectedRequisition,
]);
  const user = useSelector((state) => state.user.user);
  const candidateId = user?.candidate_id;

  // ✅ Fetch requisitions
  const fetchRequisitions = async () => {
    try {

      // const response = await apiService.getReqData();
      const response = await axios.get('http://192.168.20.115:8082/api/v1/candidate/current-opportunities/get-job-requisition/active',
        {
          headers: {
            "X-Client": "candidate",
            "Content-Type": "application/json"
          }
        }
      );
      const apiData = response?.data?.data || [];
      const mappedRequisitions = mapRequisitionsApiToList(apiData);

      console.log("✅ mapped requisitions:", mappedRequisitions);
      setRequisitions(mappedRequisitions);
    } catch (error) {
      console.error("Error fetching requisitions:", error);
      toast.error("Failed to load requisitions");
    }
  };

  // ✅ Fetch jobs
  const fetchJobs = async () => {
    try {
      //const jobsResponse = await apiService.getActiveJobs();
      // const jobsResponse = await axios.get('http://192.168.20.115:8082/api/v1/candidate/currentopportunitiescontroller/get-job-positions/active',
      //   {
      //     headers: {
      //       "X-Client": "candidate",
      //       "Content-Type": "application/json"
      //     }
      //   }
      // );
      //  console.log("jobsResponse",jobsResponse)
      //const jobsData = jobsResponse?.data || [];
      //const jobsData = jobsResponse?.data.data || [];
      // const masterDataResponse = await apiService.getMasterData();
      // const masterDataResponse = await axios.get('http://192.168.20.115:8080/api/all',
      //   {
      //     headers: {
      //       "X-Client": "candidate",
      //       "Content-Type": "application/json"
      //     }
      //   }
      // )

      const [jobsRes, masterRes] = await Promise.all([
        axios.get("http://192.168.20.115:8082/api/v1/candidate/current-opportunities/get-job-positions/active", {
          headers: { "X-Client": "candidate", "Content-Type": "application/json" },
        }),
        axios.get("http://192.168.20.111:8080/api/all", {
          headers: { "X-Client": "candidate", "Content-Type": "application/json" },
        }),
      ]);

      const jobsData = jobsRes?.data?.data || [];


      const mappedMasterData = mapMasterDataApi(masterRes.data);
      console.log("mappedMasterData", mappedMasterData);

      setDepartments(mappedMasterData.departments);
      setStates(mappedMasterData.states);
      setLocations(mappedMasterData.cities);


      const locations = mappedMasterData.cities || [];


      // ✅ Convert new nested structure to old flat model
      console.log("jobsdata", jobsData)
      console.log("locationddds", locations);
      console.log("departments", departments);
      console.log("states", states);
      const mappedJobs = mapJobsApiToList(jobsData, locations);
      console.log(mappedJobs)
      setJobs(mappedJobs); // use the mapped flat array
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
    fetchJobs();
  }, []);

  const handleConfirmApply = async () => {
    if (!jobs) return;

    try {
      await apiService.applyJobs({
        position_id: jobs.position_id,
        candidate_id: candidateId,
      });
      setAppliedJobs((prev) => [
        ...prev,
        { position_id: jobs.position_id },
      ]);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setShowPaymentModal(false);
      setJobs(null);
    }
  };
  // ✅ Open Add Preference modal instead of Razorpay
  const handleApplyClick = (job) => {
    setSelectedJob(job);
    // Reset the form data
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
    setShowPreferenceModal(true);
  };

  const handleKnowMore = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleClosePreferenceModal = () => {
    setShowPreferenceModal(false);
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

  // const handleApplySubmit = async () => {
  //   if (!applyForm.ctc || !applyForm.examCenter) {
  //     toast.error("Please fill all required fields.");
  //     return;
  //   }

  //   try {
  //     await apiService.applyJobs({
  //       position_id: selectedJob.position_id,
  //       candidate_id: candidateId,
  //       preferences: applyForm,
  //     });
  //     toast.success("Application submitted successfully!");
  //     setAppliedJobs((prev) => [...prev, { position_id: selectedJob.position_id }]);
  //     setShowApplyModal(false);
  //   } catch (error) {
  //     toast.error("Failed to submit application.");
  //   }
  // };

  // ✅ Filters (unchanged)
  // const unappliedJobs = jobs.filter(
  //   (job) =>
  //     !appliedJobs.some(
  //       (applied) => String(applied.position_id) === String(job.position_id)
  //     )
  // );


  const filteredJobs = jobs.filter((job) => {
    const matchesDepartment =
      selectedDepartments.length === 0 || selectedDepartments.includes(job.dept_id);
    const matchesLocation =
      selectedLocations.length === 0 || selectedLocations.includes(job.city_id);
    const matchesSearch =
      job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requisition_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRequisition =
      !selectedRequisition || String(job.requisition_id) === String(selectedRequisition);

    const matchesExperience =
      selectedExperience.length === 0 ||
      selectedExperience.some((range) => {
        const exp = Number(job.mandatory_experience || 0);
        return exp >= range.min && exp <= range.max;
      });

    return matchesDepartment && matchesLocation && matchesSearch && matchesRequisition &&
      matchesExperience;
  });
const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

const paginatedJobs = filteredJobs.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);
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
  const handleExperienceChange = (range) => {
    setSelectedExperience((prev) =>
      prev.some((r) => r.label === range.label)
        ? prev.filter((r) => r.label !== range.label)
        : [...prev, range]
    );
  };
  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSelectedExperience([]);
    setSearchTerm("");
  };
  const handlePreviewClick = async () => {
    try {
      // 1️⃣ Save preference data
      dispatch(
        savePreference({
          jobId: selectedJob.position_id,
          requisitionId: selectedJob.requisition_id,
          preferences: applyForm,
        })
      );


      // 3️⃣ Fetch candidate details
      //const response = await apiService.getCandidateDetails(candidateId);
      const response = await axios.get("http://192.168.20.111:8082/api/v1/candidate/candidate/get-all-details/70721aa9-0b00-4f34-bea2-3bf268f1c212", {
        headers: { "X-Client": "candidate", "Content-Type": "application/json" },
      })
      // console.log("response22",response.data.data)

      // 4️⃣ Map backend → UI
      const mappedPreviewData = mapCandidateToPreview(response.data.data);

      // 5️⃣ Set preview data
      setPreviewData(mappedPreviewData);

      // 6️⃣ Switch modals
      setShowPreferenceModal(false);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error loading preview", error);
      toast.error("Unable to load preview");
    }
  };
  const handleProceedToPayment = () => {
    setShowPreviewModal(false);   // close preview
    setShowPaymentModal(true);    // open payment modal
  };
  return (
    <div className="mx-4 my-3 relevant">
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

        <div className="applied-search">

          <input
            type="text"
            className="search-input"
            placeholder="Search by Job title or Req code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">
            <FontAwesomeIcon icon={faSearch} />
          </span>
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
              <img 
                className="filter-icon"
                src={filtericon} 
                alt="filter" 
               
              />
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
                  <div key={`location-${location.city_id}`} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedLocations.includes(location.city_id)}
                      onChange={() => handleLocationChange(location.city_id)}
                      id={`location-${location.city_id}`}
                    />
                    <label className="form-check-label" htmlFor={`location-${location.city_id}`}>
                      {location.city_name}
                    </label>
                  </div>
                ))}
              </div>
              <h6 className="mt-3">Experience</h6>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {experienceOptions.map((exp) => (
                  <div key={exp.label} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedExperience.some(
                        (r) => r.label === exp.label
                      )}
                      onChange={() => handleExperienceChange(exp)}
                    />
                    <label className="form-check-label">
                      {exp.label}
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
          {paginatedJobs.map((job) => (
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
                      {job.dept_name}
                    </p>
                    <p className="mb-1 text-muted small size35">
                      <span className="subtitle">Location:</span>{" "}
                      {job.city_name}
                    </p>
                    <p className="mb-1 text-muted small qualification">
                      <span className="subtitle">Qualification:</span>{" "}
                      {job.mandatory_qualification}
                    </p>
                  </div>
                  <div className="justify-content-between align-items-center apply_btn">

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

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Add Preference Modal */}

      <PreferenceModal
        show={showPreferenceModal}
        onHide={handleClosePreferenceModal}
        selectedJob={selectedJob}
        applyForm={applyForm}
        onApplyFormChange={(name, value) =>
          setApplyForm((prev) => ({ ...prev, [name]: value }))
        }
        states={states}
        locations={locations}
        // onPreview={() => {


        //   // ✅ STORE preference data
        //   dispatch(
        //     savePreference({
        //       jobId: selectedJob.position_id,
        //       requisitionId: selectedJob.requisition_id,
        //       preferences: applyForm,
        //     })
        //   );

        //   setShowPreferenceModal(false);
        //   setShowPreviewModal(true);
        // }}
        onPreview={handlePreviewClick}
      />

      {/* ✅ Original Know More Modal (unchanged) */}
      <KnowMoreModal
        show={showModal}
        onHide={() => setShowModal(false)}
        selectedJob={selectedJob}
      />


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
        onProceedToPayment={handleProceedToPayment}
      />
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        selectedJob={selectedJob}
        candidateId={candidateId}
        user={user}
        onPaymentSuccess={handleConfirmApply}
      />

{totalPages > 1 && (
  <div className="d-flex justify-content-center mt-4">
    <ul className="pagination pagination-sm align-items-center">

      {/* ◀ Prev */}
      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          ‹
        </button>
      </li>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <li
          key={page}
          className={`page-item ${currentPage === page ? "active" : ""}`}
        >
          <button
            className="page-link"
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        </li>
      ))}

      {/* ▶ Next */}
      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() =>
            setCurrentPage((p) => Math.min(p + 1, totalPages))
          }
        >
          ›
        </button>
      </li>

    </ul>
  </div>
)}
    </div>
  );
};

export default RelevantJobs;
