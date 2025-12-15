import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import Razorpay from "../integrations/payments/Razorpay";

import "../../css/Relevantjobs.css";
import apiService from "../../services/apiService";
import KnowMoreModal from "./KnowMoreModal";
import axios from "axios";
const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Redux: Logged-in user
  const userData = useSelector((state) => state.user.user);
  console.log("user111",userData)
  const candidateId = userData?.data?.user?.id;

  // ✅ Fetch applied jobs
  const fetchAppliedJobs = async () => {
    console.log("fetchappliedjobs")
    if (!candidateId) return;
    try {
     // const response = await apiService.appliedpositions(candidateId);
     const response={
  "success": true,
  "message": "Active jobs found",
  "data": [
    {
      "position_id": "b3624030-65b6-41d6-86d4-823f248e944e",
      "requisition_id": "dfd64555-5639-43a2-ad16-182f31c055f8",
      "position_title": "Local Bank Officer",
      "requisition_code": "JREQ-1046",
      "requisition_title": "ghdb",
      "position_code": "JPOS5001",
      "description": "LBOdfgfdg",
      "roles_responsibilities": "fdgfdg",
      "grade_id": "0cb8e408-624c-4d56-969d-df7ebc201eb9",
      "employment_type": "Full-Time",
      "eligibility_age_min": 2,
      "eligibility_age_max": 5,
      "mandatory_qualification": "fdgfdgfdg",
      "preferred_qualification": "",
      "mandatory_experience": 5,
      "preferred_experience": 3,
      "probation_period": 0,
      "documents_required": "fdgfdg",
      "min_credit_score": null,
      "dept_id": "1c26a371-5967-491e-8e79-d2a3f161ff4b",
      "location_id": "48653ac2-56cd-4181-8300-178b09f1a447",
      "special_cat_id": null,
      "reservation_cat_id": null,
      "no_of_vacancies": 3,
      "selection_procedure": "",
      "position_status": "Active",
      "min_salary": null,
      "max_salary": null,
      "grade_name": "Grade I (30000 - 50000)",
      "dept_name": "General Admin",
      "location_name": "Kondapur",
      "country_id": "ad6aa79a-8171-4d3d-99bc-4e8b28a70521",
      "city_id": "7457a7fd-45c9-4979-86f5-f063f817ce71",
      "state_id": "a268bdec-cc1a-4c19-bc5e-64c22c7b7c42",
      "job_relaxation_policy_id": "a5fea36f-5487-4daf-b8c1-6273c243e8a0",
      "job_relaxation_policy_json": null
    },
    {
      "position_id": "7439cdb2-2f92-42c9-bed9-427a227e38b0",
      "requisition_id": "4223556b-66f0-4151-8119-95922abaf6f2",
      "position_title": "Local Bank Officer",
      "requisition_code": "JREQ-1024",
      "requisition_title": "TEST",
      "position_code": "JPOS5001",
      "description": "LBO",
      "roles_responsibilities": "dfdds",
      "grade_id": "0cb8e408-624c-4d56-969d-df7ebc201eb9",
      "employment_type": "Full-Time",
      "eligibility_age_min": 23,
      "eligibility_age_max": 33,
      "mandatory_qualification": "sfddfdfsfddf",
      "preferred_qualification": "",
      "mandatory_experience": 4,
      "preferred_experience": null,
      "probation_period": 0,
      "documents_required": "dsdffd",
      "min_credit_score": null,
      "dept_id": "1c26a371-5967-491e-8e79-d2a3f161ff4b",
      "location_id": "48653ac2-56cd-4181-8300-178b09f1a447",
      "special_cat_id": null,
      "reservation_cat_id": null,
      "no_of_vacancies": 13,
      "selection_procedure": "",
      "position_status": "Active",
      "min_salary": null,
      "max_salary": null,
      "grade_name": "Grade I (30000 - 50000)",
      "dept_name": "General Admin",
      "location_name": "Kondapur",
      "country_id": "ad6aa79a-8171-4d3d-99bc-4e8b28a70521",
      "city_id": "7457a7fd-45c9-4979-86f5-f063f817ce71",
      "state_id": "a268bdec-cc1a-4c19-bc5e-64c22c7b7c42",
      "job_relaxation_policy_id": "a5fea36f-5487-4daf-b8c1-6273c243e8a0",
      "job_relaxation_policy_json": null
    }]};
       const jobsArray = Array.isArray(response.data)
      ? response.data
      : [];

    setAppliedJobs(jobsArray);
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      setAppliedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch departments & locations (for filters)
  const fetchMasterData = async () => {
    try {
      // const masterData = await apiService.getMasterData();
      // setDepartments(masterData.departments || []);
      // setLocations(masterData.locations || []);

       const masterData = await axios.get('http://192.168.20.115:8080/api/all',
        {
          headers: {
            "X-Client": "candidate",
            "Content-Type": "application/json"
          }
        }
      )
      console.log("masterDataResponse", masterData)
      const departments = masterData.data.departments || [];
      const locations = masterData.data.cities || [];
         setDepartments(departments);
      setLocations(locations);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  useEffect(() => {
    console.log("candidateId",candidateId)
    if (candidateId) {
      fetchAppliedJobs();
      fetchMasterData();
    }
  }, [candidateId]);

  // ✅ Filter logic
  const filteredJobs = appliedJobs.filter((job) => {
    const matchesDept =
      selectedDepartments.length === 0 ||
      selectedDepartments.includes(job.dept_id);
    const matchesLoc =
      selectedLocations.length === 0 ||
      selectedLocations.includes(job.location_id);
    const matchesSearch =
      job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requisition_code?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDept && matchesLoc && matchesSearch;
  });

  // ✅ Handlers
  const handleDepartmentChange = (id) => {
    setSelectedDepartments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleLocationChange = (id) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSearchTerm("");
  };

  const handleKnowMore = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  return (
    <div className="mx-4 my-3">
      {/* 🔍 Search */}
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

      {/* 🔄 Loading */}
      {loading && (
        <div style={{ textAlign: "center", margin: "20px" }}>
          <div className="spinner-border text-primary" role="status" />
          <p>Loading Applied Jobs...</p>
        </div>
      )}

      <div className="row" id="matched-jobs-container">
        {/* 📍 Filters */}
        <div className="col-md-3 bob-left-fixed-filter">
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
            }}
          >
            <h6>Departments</h6>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {departments.map((dept) => (
                <div key={dept.department_id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`dept-${dept.department_id}`}
                    checked={selectedDepartments.includes(dept.department_id)}
                    onChange={() => handleDepartmentChange(dept.department_id)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`dept-${dept.department_id}`}
                  >
                    {dept.department_name}
                  </label>
                </div>
              ))}
            </div>

            <h6 className="mt-3">Locations</h6>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {locations.map((loc) => (
                <div key={loc.location_id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`loc-${loc.location_id}`}
                    checked={selectedLocations.includes(loc.location_id)}
                    onChange={() => handleLocationChange(loc.location_id)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`loc-${loc.location_id}`}
                  >
                    {loc.location_name}
                  </label>
                </div>
              ))}
            </div>

            {(selectedDepartments.length > 0 ||
              selectedLocations.length > 0) && (
              <button
                className="btn btn-sm btn-outline-secondary mt-3"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* 💼 Applied Jobs List */}
        <div className="col-md-9">
          {filteredJobs.length === 0 && !loading && (
            <p>No applied jobs found.</p>
          )}

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
                  <p className="mb-1 text-muted small">
                    <span className="subtitle">Department:</span>{" "}
                    {job.dept_name}
                  </p>
                  <p className="mb-1 text-muted small">
                    <span className="subtitle">Location:</span>{" "}
                    {job.location_name}
                  </p>
                  <button
                    className="btn btn-sm knowntb my-3"
                    onClick={() => handleKnowMore(job)}
                  >
                    Know More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🧠 Know More Modal */}
      <KnowMoreModal
        show={showModal}
        onHide={() => setShowModal(false)}
        job={selectedJob}
      />
    </div>
  );
};

export default AppliedJobs;
