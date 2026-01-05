import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

import {
  faCheckCircle,
  faSearch,
  faLightbulb
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import "../../../css/Relevantjobs.css";
import { toast } from "react-toastify";
import PreviewModal from "../components/PreviewModal";
//import PreferenceModal from "../components/PreferenceModal";
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
import jobsApiService from "../services/jobsApiService";
import ConfirmationModal from "../components/ConfirmationModal";
import ValidationErrorModal from "../components/ValidationErrorModal";
import masterApi from "../../../services/master.api";

const RelevantJobs = ({ candidateData = {}, setActiveTab }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState("");
  //const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [masterData, setMasterData] = useState([{}]);
  const [selectedStates, setSelectedStates] = useState([]);
  const navigate = useNavigate();
  const [isMasterReady, setIsMasterReady] = useState(false);
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
  const [showPreCheckModal, setShowPreCheckModal] = useState(false);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState("");
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoDocs, setInfoDocs] = useState([]);
  const [activeInfoType, setActiveInfoType] = useState(""); // annexure | general



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


  const candidateId = user?.data?.user?.id;
  console.log("candidateddd", candidateId)


  // ✅ Fetch requisitions
  const fetchRequisitions = async () => {
    try {

      const response = await jobsApiService.getActiveRequisitions();
      const apiData = response?.data || [];
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
    setLoading(true);

    // 1️⃣ Always load master data
    const masterRes = await jobsApiService.getMasterData();
    const mappedMasterData = mapMasterDataApi(masterRes);

    setDepartments(mappedMasterData.departments || []);
    setStates(mappedMasterData.states || []);
    setLocations(mappedMasterData.cities || []);
    setMasterData(mappedMasterData);

    // 2️⃣ Load jobs separately
    let jobsData = [];
    try {
      const jobsRes = await jobsApiService.getJobPositions(candidateId);
      jobsData = jobsRes?.data || [];
    } catch (jobErr) {
      // ✅ 404 is OK → means no jobs
      if (jobErr?.response?.status !== 404) {
        throw jobErr; // real error
      }
    }

    const mappedJobs = mapJobsApiToList(jobsData, mappedMasterData);
    setJobs(mappedJobs);

    setIsMasterReady(true);
  } catch (err) {
    console.error("Error fetching data:", err);
    toast.error("Failed to load data");
  } finally {
    setLoading(false);
  }
};


  const fetchInfoDocuments = async (type) => {
  try {
    const res = await masterApi.getGenericDocuments();

    const filtered = (res.data?.data || []).filter(
      (doc) => doc.type?.toLowerCase() === type
    );

    if (filtered.length === 0) {
      toast.info("No documents available");
      return;
    }

    setInfoDocs(filtered);
    setActiveInfoType(type);
    setShowInfoModal(true);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load documents");
  }
};

  useEffect(() => {
    fetchRequisitions();
    fetchJobs();
  }, []);
  useEffect(() => {
    if (!candidateId || !isMasterReady) return;

    const fetchCandidatePreview = async () => {
      try {
        const response = await jobsApiService.getAllDetails(candidateId);

        const mappedPreviewData = mapCandidateToPreview(
          response.data,
          masterData        // ✅ PASS MASTERS HERE
        );

        setPreviewData(mappedPreviewData);
      } catch (error) {
        console.error("Failed to fetch candidate preview", error);
        toast.error("Unable to load candidate profile");
      }
    };

    fetchCandidatePreview();
  }, [candidateId, isMasterReady, masterData]);
  const calculateAge = (dobString) => {
    if (!dobString) return null;

    const dob = new Date(dobString);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age;
  };
  const calculateExperienceYears = (totalExpString) => {
    if (!totalExpString) return 0;

    // "60 Months" → 60
    const months = parseInt(totalExpString.replace(/\D/g, ""), 10);
    return Math.floor(months / 12);
  };
  const validateAgeAndExperience = (job, previewData) => {
    // ---------- AGE ----------
    const dob = previewData?.personalDetails?.dob;
    const age = calculateAge(dob);

    console.log("age", age)

    if (!age) {
      toast.error("Date of Birth is missing in profile");
      return false;
    }
    console.log("age min max", job.eligibility_age_min, job.eligibility_age_max)
    if (
      (job.eligibility_age_min && age < job.eligibility_age_min) ||
      (job.eligibility_age_max && age > job.eligibility_age_max)
    ) {
      toast.error(
        `Age must be between ${job.eligibility_age_min} - ${job.eligibility_age_max} years`
      );
      return false;
    }

    // ---------- EXPERIENCE ----------
    const totalExpYears = calculateExperienceYears(
      previewData?.experienceSummary?.total
    );
    console.log("totalExpYears", totalExpYears)
    console.log("job.mandatory_experience", job.mandatory_experience)
    if (
      job.mandatory_experience &&
      totalExpYears < Number(job.mandatory_experience)
    ) {
      toast.error(
        `Minimum ${job.mandatory_experience} years experience required`
      );
      return false;
    }

    return true; // ✅ Eligible
  };
  const handlePreCheckConfirm = async () => {
    setShowPreCheckModal(false);

    try {
      //later uncomment
      // const response = await jobsApiService.validateCandidateEligibility({
      //   candidateId,
      //   positionId: selectedJob.position_id,
      // });

      // if (!response?.success) {
      //   setValidationErrorMsg(
      //     response?.message ||
      //       "Your profile does not meet the job requirements."
      //   );
      //   setShowValidationErrorModal(true);
      //   return;
      // }

      // ✅ Validation passed
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

     // setShowPreferenceModal(true);
        setShowPreviewModal(true);
    } catch (err) {
      setValidationErrorMsg("Unable to validate profile. Please try again.");
      setShowValidationErrorModal(true);
    }
  };
  const handleConfirmApply = async () => {
    if (!selectedJob || !candidateId) return;

    try {
      const payload = {
        candidateId,
        positionId: selectedJob.position_id,

        statePreference1: applyForm.state1 || null,
        cityPreference1: applyForm.location1 || null,
        locationPreference1: applyForm.location1 || null,

        statePreference2: applyForm.state2 || null,
        cityPreference2: applyForm.location2 || null,
        locationPreference2: applyForm.location2 || null,

        statePreference3: applyForm.state3 || null,
        cityPreference3: applyForm.location3 || null,
        locationPreference3: applyForm.location3 || null,

        expectedCtc: Number(applyForm.ctc) || 0,
        interviewCenter: applyForm.examCenter || "",
      };

      const response = await jobsApiService.applyToJob(payload);
      if (response?.success) {
        toast.success("Job applied Successfully");
        //setShowPreferenceModal(false);
        setShowPaymentModal(false);
        setActiveTab("applied-jobs"); // ✅ correct

      } else {
        toast.error(response?.message || "Failed to apply for the job");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    }
  };


  // ✅ Open Add Preference modal instead of Razorpay
  const handleApplyClick = (job, previewData) => {

    // const isEligible = validateAgeAndExperience(job, previewData);
    // if (!isEligible) return;

    setSelectedJob(job);
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

    //setShowPreferenceModal(true);
  };

  const handleKnowMore = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleClosePreferenceModal = () => {
    //setShowPreferenceModal(false);
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



  const filteredJobs = jobs.filter((job) => {

    const matchesDepartment =
      selectedDepartments.length === 0 ||
      selectedDepartments.includes(job.dept_id);

    /* =========================
      STATE FILTER ✅ NEW
    ========================= */

    const matchesState =
      selectedStates.length === 0 ||
      selectedStates.some(stateId =>
        job.state_id_array?.includes(stateId)
      );

    const matchesSearch =
      job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requisition_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRequisition =
      !selectedRequisition ||
      String(job.requisition_id) === String(selectedRequisition);

    const matchesExperience =
      selectedExperience.length === 0 ||
      selectedExperience.some((range) => {
        const exp = Number(job.mandatory_experience || 0);
        return exp >= range.min && exp <= range.max;
      });
    console.log("selected states", selectedStates, job.state_id)
    console.log("matchesState", matchesState)
    return (
      matchesDepartment &&
      matchesState &&          // ✅ ADDED
      matchesSearch &&
      matchesRequisition &&
      matchesExperience
    );
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

  // const handleLocationChange = (locationId) => {
  //   setSelectedLocations((prev) =>
  //     prev.includes(locationId)
  //       ? prev.filter((id) => id !== locationId)
  //       : [...prev, locationId]
  //   );
  // };

  const handleStateChange = (stateId) => {
    setSelectedStates((prev) =>
      prev.includes(stateId)
        ? prev.filter((id) => id !== stateId)
        : [...prev, stateId]
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
  // const handlePreviewClick = () => {
  //   let isCtcRequired = false;

  //   if (selectedJob?.employment_type === "Contract") {
  //     isCtcRequired = true;
  //   }

  //   if (isCtcRequired && !applyForm.ctc) {
  //     toast.error("Please enter Expected CTC");
  //     return;
  //   }

  //   if (!applyForm.examCenter) {
  //     toast.error("Please enter Interview Center");
  //     return;
  //   }

  //   if (!previewData) {
  //     toast.error("Candidate data not loaded yet");
  //     return;
  //   }

  //   dispatch(
  //     savePreference({
  //       jobId: selectedJob.position_id,
  //       requisitionId: selectedJob.requisition_id,
  //       preferences: applyForm,
  //     })
  //   );

  //   //setShowPreferenceModal(false);
  //   setShowPreviewModal(true);
  // };
  const handleProceedToPayment = () => {


    let isCtcRequired = false;

    if (selectedJob?.employment_type === "Contract") {
      isCtcRequired = true;
    }

    if (isCtcRequired && !applyForm.ctc) {
      toast.error("Please enter Expected CTC");
      return;
    }

    if (!applyForm.examCenter) {
      toast.error("Please enter Interview Center");
      return;
    }

    if (!previewData) {
      toast.error("Candidate data not loaded yet");
      return;
    }

    dispatch(
      savePreference({
        jobId: selectedJob.position_id,
        requisitionId: selectedJob.requisition_id,
        preferences: applyForm,
      })
    );

    setShowPreviewModal(false);   // close preview
    setShowPaymentModal(true);    // open payment modal
  };
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (

    <div className="mx-4 my-3 relevant">


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
            <span className="filter">Filters</span>
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
            <div className="bob-filter-c-div bob-inner-categories-c-div px-3">
              <span className="header_filter">Departments</span>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {departments.map((dept) => (
                  <div key={dept.department_id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedDepartments.includes(dept.department_id)}
                      onChange={() => handleDepartmentChange(dept.department_id)}
                    />
                    <label className="form-check-label label_filter">
                      {dept.department_name}
                    </label>
                  </div>
                ))}
              </div>

              <h6 className="mt-3 header_filter">States</h6>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {states
                  .map((state) => (
                    <div key={state.state_id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedStates.includes(state.state_id)}
                        onChange={() => handleStateChange(state.state_id)}
                        id={`state-${state.state_id}`}
                      />
                      <label
                        className="form-check-label label_filter"
                        htmlFor={`state-${state.state_id}`}
                      >
                        {state.state_name}
                      </label>
                    </div>
                  ))}
              </div>
              <h6 className="mt-3 header_filter">Experience</h6>
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
                    <label className="form-check-label label_filter">
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
          {/* 🔹 Search and Requisition Dropdown */}
          <div className="d-flex justify-content-between mb-3">
            <div className="d-flex" style={{ flex: 1 }}>
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

            <div className="d-flex align-items-center gap-2">
              <button
                className="info_btn"
                onClick={() => fetchInfoDocuments("annexures")}
              >
                Annexures Information
              </button>
              <button
                className="info_btn"
                onClick={() => fetchInfoDocuments("generic")}
              >
                Generic Information
              </button>
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
          </div>
           {/* ================= EMPTY STATE (ADDED) ================= */}
          {filteredJobs.length === 0 && (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
              <div className="text-center">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  size="3x"
                  className="text-muted mb-3"
                />
                <h5 className="text-muted">No current opportunities</h5>
                <p className="text-muted small">
                  Please check back later or adjust your filters.
                </p>
              </div>
            </div>
          )}
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
                    <p className="mb-1 text-mutedd small size35">
                      <span className="subtitle">Employment Type:</span>{" "}
                      {job.employment_type}
                    </p>
                    <p className="mb-1 text-mutedd small size35">
                      <span className="subtitle">Eligibility Age:</span>{" "}
                      {job.eligibility_age_min} - {job.eligibility_age_max} years
                    </p>
                    <p className="mb-1 text-mutedd small size30">
                      <span className="subtitle">Experience:</span>{" "}
                      {job.mandatory_experience} years
                    </p>
                    <p className="mb-1 text-mutedd small size35">
                      <span className="subtitle">Department:</span>{" "}
                      {job.dept_name}
                    </p>
                    <p className="mb-1 text-mutedd small size35">
                      <span className="subtitle">Location:</span>{" "}
                      {job.state_name}
                    </p>
                    <p className="mb-1 text-mutedd small size30">
                      <span className="subtitle">Vacancies:</span>{" "}
                      {job.no_of_vacancies}
                    </p>
                    <p className="mb-1 text-mutedd small qualification">
                      <span className="subtitle">Qualification:</span>{" "}
                      {job.mandatory_qualification}
                    </p>
                  </div>
                  <div className="justify-content-between align-items-center apply_btn">

                    <button
                      className="btn btn-sm btn-outline-primary hovbtn"
                      onClick={() => {
                        setSelectedJob(job);
                        setShowPreCheckModal(true);
                      }}
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

      {/* <PreferenceModal
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
      /> */}

      {/* ✅ Original Know More Modal (unchanged) */}
      <KnowMoreModal
        show={showModal}
        onHide={() => setShowModal(false)}
        selectedJob={selectedJob}
      />


      {/* Preview Modal */}
      {/* <PreviewModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        previewData={previewData}
        onBack={() => {
          setShowPreviewModal(false);
          setShowApplyModal(true);
        }}
        onEditProfile={() => {
          // 1️⃣ Set step to "Basic Details"
          localStorage.setItem("activeStep", "2");

          // 2️⃣ Switch to PROFILE menu (info tab)
          setActiveTab("info");
          // 2️⃣ Close preview modal
          setShowPreviewModal(false);

        }}

        onProceedToPayment={handleProceedToPayment}
        selectedJob={selectedJob}
        masterData={masterData}
      /> */}
      <PreviewModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        previewData={previewData}
        selectedJob={selectedJob}
        masterData={masterData}

        applyForm={applyForm}
        onApplyFormChange={(name, value) =>
          setApplyForm(prev => ({ ...prev, [name]: value }))
        }
        onProceedToPayment={handleProceedToPayment}
        onEditProfile={() => {
          // 1️⃣ Set step to "Basic Details"
          localStorage.setItem("activeStep", "2");

          // 2️⃣ Switch to PROFILE menu (info tab)
          setActiveTab("info");
          // 2️⃣ Close preview modal
          setShowPreviewModal(false);

        }}
         onBack={() => {
          setShowPreviewModal(false);
          setShowApplyModal(true);
        }}
      />

      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        selectedJob={selectedJob}
        candidateId={candidateId}
        user={user}
        onPaymentSuccess={handleConfirmApply}
      />
      <ConfirmationModal
        show={showPreCheckModal}
        onCancel={() => setShowPreCheckModal(false)}
        onConfirm={handlePreCheckConfirm}
      />

      <ValidationErrorModal
        show={showValidationErrorModal}
        onClose={() => setShowValidationErrorModal(false)}
        message={validationErrorMsg}
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

      <Modal
        show={showInfoModal}
        onHide={() => setShowInfoModal(false)}
        size="xl"
        centered
        dialogClassName="info-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {activeInfoType === "annexures"
              ? "Annexure Information"
              : "Generic Information"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="info-modal-body">
          {infoDocs.map((doc) => (
            <div key={doc.id} className="pdf-wrapper">
              <div className="pdf-title">{doc.fileName}</div>

              <iframe
                src={doc.fileUrl}
                title={doc.fileName}
                className="pdf-iframe"
              />
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RelevantJobs;
