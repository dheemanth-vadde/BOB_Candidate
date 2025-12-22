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
  const navigate = useNavigate();
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

  const candidateId = user?.data?.user?.id;


  useEffect(() => {
    const fetchCandidatePreview = async () => {
      if (!candidateId) return;

      try {
        // const response = await axios.get(
        //   `http://192.168.20.111:8082/api/v1/candidate/candidate/get-all-details/${candidateId}`,
        //   {
        //     headers: {
        //       "X-Client": "candidate",
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );

        const response = await axios.get("http://192.168.20.111:8082/api/v1/candidate/candidate/get-all-details/75ddc495-a378-4a1c-8240-7bd6509c9965", {
          headers: { "X-Client": "candidate", "Content-Type": "application/json" },
        })


        const mappedPreviewData = mapCandidateToPreview(response.data.data);
        setPreviewData(mappedPreviewData);
      } catch (error) {
        console.error("Failed to fetch candidate preview", error);
        toast.error("Unable to load candidate profile");
      }
    };

    fetchCandidatePreview();
  }, [candidateId]);

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

  const handleConfirmApply = async () => {
    if (!selectedJob || !candidateId) return;

    try {
      const response = await axios.post(
        "http://192.168.20.111:8082/api/v1/candidate/applications/apply/job",
        {
          positionId: selectedJob.position_id,
          candidateId: candidateId,
        },
        {
          headers: {
            "X-Client": "candidate",
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ Check success flag
      if (response?.data?.success) {
        toast.success(response.data.message || "Application submitted successfully!");

        // ✅ Close modal
        setShowPaymentModal(false);

        // ✅ REDIRECT to Applied Jobs screen
        navigate("/candidate/applied-jobs");
        // 👆 change route as per your app
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    }
  };

  // ✅ Open Add Preference modal instead of Razorpay
  const handleApplyClick = (job, previewData) => {
    console.log("previewData123", previewData);

    const isEligible = validateAgeAndExperience(job, previewData);
    if (!isEligible) return;

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
  const handlePreviewClick = () => {
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

    setShowPreferenceModal(false);
    setShowPreviewModal(true);
  };
  const handleProceedToPayment = () => {
    setShowPreviewModal(false);   // close preview
    setShowPaymentModal(true);    // open payment modal
  };
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

              <h6 className="mt-3 header_filter">Locations</h6>
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
                    <label className="form-check-label label_filter" htmlFor={`location-${location.city_id}`}>
                      {location.city_name}
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
                      {job.city_name}
                    </p>
                    <p className="mb-1 text-mutedd small qualification">
                      <span className="subtitle">Qualification:</span>{" "}
                      {job.mandatory_qualification}
                    </p>
                  </div>
                  <div className="justify-content-between align-items-center apply_btn">

                    <button
                      className="btn btn-sm btn-outline-primary hovbtn"
                      onClick={() => handleApplyClick(job, previewData)}
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
        selectedJob={selectedJob}
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
