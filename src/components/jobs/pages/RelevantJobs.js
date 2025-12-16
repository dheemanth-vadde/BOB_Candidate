import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
        axios.get("http://192.168.20.115:8080/api/all", {
          headers: { "X-Client": "candidate", "Content-Type": "application/json" },
        }),
      ]);

      //const jobsData = jobsResponse || [];
      // const departments = masterDataResponse.departments || [];
      // const locations = masterDataResponse.locations || [];



      const jobsData = jobsRes?.data?.data || [];


      const departments = masterRes.data.departments || [];
      const states = masterRes.data.states || [];
      const locations = masterRes?.data?.cities || [];
      setDepartments(departments);
      setStates(states);
      setLocations(locations);
      console.log("✅ locations before mapper:", locations);


      // ✅ Convert new nested structure to old flat model
      console.log("jobsdata", jobsData)
      console.log("locationddds", locations)
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


  // ✅ Open Add Preference modal instead of Razorpay
  const handleApplyClick = (job) => {
    setSelectedJob(job);
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
                      checked={selectedLocations.includes(location.city_id)}
                      onChange={() => handleLocationChange(location.city_id)}
                    />
                    <label className="form-check-label">
                      {location.city_name}
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
        onPreview={() => {
          setShowPreferenceModal(false);
          setShowPreviewModal(true);
        }}
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
