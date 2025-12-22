import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import Razorpay from "../../integrations/payments/Razorpay";
import { mapJobsApiToList } from "../../jobs/mappers/jobMapper";
import "../../../css/Appliedjobs.css";
import apiService from "../../../services/apiService";
import TrackApplicationModal from "../../jobs/components/TrackApplicationModal";
import axios from "axios";
import OfferLetterModal from "../../jobs/components/OfferLetterModal";
const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  // ✅ Redux: Logged-in user
  const userData = useSelector((state) => state.user.user);
  const candidateId = userData?.data?.user?.id;

  // ✅ Fetch applied jobs
  const fetchAppliedJobs = async () => {
    console.log("fetchappliedjobs")
    if (!candidateId) return;
    try {
 //    const response = await apiService.appliedpositions(candidateId);
 
      //  const jobsArray = Array.isArray(response.data)
      // ? response.data
      // : [];


      const response = await axios.get('http://192.168.20.115:8082/api/v1/candidate/applied-jobs/get-applied-jobs/62394083-ded6-4861-9ccb-39e36024a98d',
        {
          headers: {
            "X-Client": "candidate",
            "Content-Type": "application/json"
          }
        }
      );
      const jobsData = response?.data?.data || [];

      const mappedJobs = mapJobsApiToList(jobsData);
           console.log(mappedJobs)

    setAppliedJobs(mappedJobs);
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
     // fetchMasterData();
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


  return (
    
  <div className="applied-jobs-page px-4 py-3">

    {/* ===== PAGE HEADER ===== */}
    <div className="d-flex justify-content-between align-items-center mb-4">
      <span className="mb-0 appliedheader">Job Applications</span>
     
      {/* Search Bar */}
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

    {/* ===== LOADING ===== */}
    {loading && (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading Applied Jobs...</p>
      </div>
    )}

    {/* ===== APPLIED JOBS LIST ===== */}
    {!loading && filteredJobs.length === 0 && (
      <p className="text-muted">No applied jobs found.</p>
    )}

    {filteredJobs.map((job) => (
      <div className="applied-job-card mb-3" key={job.position_id}>

        {/* Header */}
        <div className="applied-job-header">
          <span className="jobtitle">
            {job.requisition_code} - {job.position_title}
          </span>

          <span className={`status-badge ${job.application_status?.toLowerCase() || "applied"}`}>
            {job.application_status || "Applied"}
          </span>
        </div>

        {/* Grid Info */}
      {/* ===== META DATA – SINGLE FLEX ROW ===== */}
<div className="job-meta-row">
  <span>Employment Type:</span>{job.employment_type}
  <span>Department:</span>{job.dept_name}
  <span>Experience:</span>{job.mandatory_experience} years
  <span>Vacancies:</span> {job.no_of_vacancies}
  <span> Eligibility Age:</span>
    {job.eligibility_age_min} – {job.eligibility_age_max} years
  
  <span>Applied On:</span> {job.applied_on || "-"}
</div>

{/* ===== QUALIFICATION – NEXT ROW ONLY ===== */}
<div className="job-qualification-row">
  <span>Qualification:</span> {job.mandatory_qualification}
</div>

        {/* Footer */}
        <div className="job-footer">
          {/* {job.application_status === "Offered" && ( */}
            <>
              <button
                className="footer-link"
                onClick={() => setShowOfferModal(true)}
              >
                View Offer
              </button>

              <span className="footer-separator">|</span>
            </>
          {/* )} */}

          <button
            className="footer-link"
            onClick={() => {
              setSelectedJob(job);
              setShowTrackModal(true);
            }}
          >
            Track Application
          </button>
        </div>
      </div>
    ))}
<TrackApplicationModal
  show={showTrackModal}
  onHide={() => setShowTrackModal(false)}
  job={selectedJob}
/>
<OfferLetterModal
  show={showOfferModal}
  onHide={() => setShowOfferModal(false)}
  pdfUrl="/offers/offer_letter_123.pdf" // from API
/>
  </div>
  );
};

export default AppliedJobs;
