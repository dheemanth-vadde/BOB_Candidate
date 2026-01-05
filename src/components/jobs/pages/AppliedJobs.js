import React, { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch,faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import Razorpay from "../../integrations/payments/Razorpay";
import { mapAppliedJobsApiToList } from "../../jobs/mappers/appliedjobMapper";
import "../../../css/Appliedjobs.css";
import apiService from "../../../services/apiService";
import TrackApplicationModal from "../../jobs/components/TrackApplicationModal";
import axios from "axios";
import jobsApiService from "../services/jobsApiService";
import OfferLetterModal from "../../jobs/components/OfferLetterModal";
import { mapMasterDataApi } from "../../jobs/mappers/masterDataMapper";
import PreviewModal from "../components/PreviewModal";
import { toast } from "react-toastify";
import { mapCandidateToPreview } from "../../jobs/mappers/candidatePreviewMapper";
import ApplicationDownload from "../components/ApplicationDownload";
const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [offerData, setOfferData] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [masterData, setMasterData] = useState([{}]);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef();
  const [previewData, setPreviewData] = useState(null);

  // ✅ Redux: Logged-in user
  const userData = useSelector((state) => state.user.user);
  const candidateId = userData?.data?.user?.id;

  const preferenceData = useSelector(
    (state) => state.preference.preferenceData
  );
  const preferences = preferenceData?.preferences || {};
  const fetchMasterData = async () => {
    try {
      const masterResponse = await jobsApiService.getMasterData();
      const mappedMasterData = mapMasterDataApi(masterResponse);

      if (
        !mappedMasterData ||
        !Object.keys(mappedMasterData).length
      ) {
        console.warn("Master data empty");
        return null;
      }

      setMasterData(mappedMasterData);
      return mappedMasterData; // ✅ IMPORTANT
    } catch (error) {
      console.error("Error fetching master data:", error);
      return null;
    }
  };
  // const handleDownloadApplication = async (job) => {
  //   try {
  //     setLoading(true);

  //     try {
  //       const response = await jobsApiService.getAllDetails(candidateId);

  //       const mappedPreviewData = mapCandidateToPreview(
  //         response.data,
  //         masterData        // ✅ PASS MASTERS HERE
  //       );

  //       setPreviewData(mappedPreviewData);
  //       setSelectedJob(job);
  //       setShowPreview(true);
  //     } catch (error) {
  //       console.error("Failed to fetch candidate preview", error);
  //       toast.error("Unable to load candidate profile");
  //     }


  //   } catch (err) {
  //     console.error(err);
  //     alert("Unable to load application preview");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAppliedJobs = async (master) => {
    if (!candidateId || !master) return;

    try {
      setLoading(true);

      const jobsResponse = await jobsApiService.getAppliedJobs(candidateId);

      const jobsData = Array.isArray(jobsResponse?.data)
        ? jobsResponse.data
        : [];

      const mappedJobs = mapAppliedJobsApiToList(jobsData, master);
      setAppliedJobs(mappedJobs);

    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      setAppliedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!candidateId) return;

    const init = async () => {
      const master = await fetchMasterData();
      if (master) {
        fetchAppliedJobs(master);
      }
    };

    init();
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

 

  // const handleDirectDownload = async (job) => {
  //   try {
  //     setLoading(true);

  //     const response = await jobsApiService.getAllDetails(candidateId);

  //     const mappedPreviewData = mapCandidateToPreview(
  //       response.data,
  //       masterData
  //     );

  //     // 1️⃣ Set data
  //     setSelectedJob(job);
  //     setPreviewData(mappedPreviewData);

  //     // 2️⃣ Wait for React to paint
  //     requestAnimationFrame(() => {
  //       requestAnimationFrame(() => {
  //         if (!previewRef.current) {
  //           console.error("Preview ref not ready");
  //           return;
  //         }
  //         console.log("Preview HTML:", previewRef.current.innerHTML);
  //         console.log("Preview height:", previewRef.current.offsetHeight);
  //         html2pdf()
  //           .from(previewRef.current)
  //           .set({
  //             margin: 10,
  //             filename: `Application_${job.requisition_code}.pdf`,
  //             image: { type: "jpeg", quality: 0.98 },
  //             html2canvas: { scale: 2, useCORS: true },
  //             jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  //           })
  //           .save();
  //       });
  //     });

  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Unable to download application");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleViewOffer = async (job) => {
    try {
      if (!job?.application_id) {
        toast.error("Application ID missing");
        return;
      }

      setLoading(true);

      const res = await jobsApiService.getOfferLetterByApplicationId(
        job.application_id
      );

      if (!res?.success || !res?.data) {
        toast.error("Offer letter not found");
        return;
      }

      setOfferData(res.data);       // ✅ store API response
      setShowOfferModal(true);      // ✅ open modal

    } catch (err) {
      console.error("Failed to fetch offer letter", err);
      toast.error("Unable to load offer letter");
    } finally {
      setLoading(false);
    }
  };
  const formatStatusLabel = (status) => {
    if (!status) return "Applied";

    return status
      .replace(/_/g, " ")          // Offer_Accepted → Offer Accepted
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase()); // Title Case
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
      {/* {!loading && filteredJobs.length === 0 && (
        <p className="text-muted">No applied jobs found.</p>
      )} */}

              {!loading && filteredJobs.length === 0 && (
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
                    <div className="text-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        size="3x"
                        className="text-muted mb-3"
                      />
                      <h5 className="text-muted">No applied jobs found</h5>
                      <p className="text-muted small">
                        Please apply to jobs in Current Opportunities.
                      </p>
                    </div>
                  </div>
                )}

      {filteredJobs.map((job) => (
        <div className="applied-job-card mb-3" key={job.position_id}>

          {/* Header */}
          <div className="applied-job-header">
            <span className="jobtitle">
              {job.requisition_code} - {job.position_title}
            </span>

            <span className={`status-badge ${job.application_status?.toLowerCase() || "applied"}`}>
              {/* {job.application_status || "Applied"} */}
              {formatStatusLabel(job.application_status)}
            </span>
          </div>

          {/* Grid Info */}
          {/* ===== META DATA – SINGLE FLEX ROW ===== */}
          {/* ===== META ROW 1 ===== */}
          {/* ===== META ROW 1 ===== */}
          <div className="job-meta-grid row-1">
            <div className="meta-item">
              <span className="label">Reference No:</span>
              <span className="value">{job.requisition_code}</span>
            </div>

            <div className="meta-item">
              <span className="label">Eligibility Age:</span>
              <span className="value">
                {job.eligibility_age_min} – {job.eligibility_age_max} years
              </span>
            </div>

            <div className="meta-item">
              <span className="label">Applied On:</span>
              <span className="value">{job.application_date ? new Date(job.application_date).toLocaleDateString() : "-"}</span>
            </div>

            <div className="meta-item">
              <span className="label">Employment Type:</span>
              <span className="value">{job.employment_type}</span>
            </div>
          </div>

          {/* ===== META ROW 2 ===== */}
          <div className="job-meta-grid row-2">
            <div className="meta-item">
              <span className="label">Department:</span>
              <span className="value">{job.dept_name}</span>
            </div>

            <div className="meta-item">
              <span className="label">Experience:</span>
              <span className="value">{job.mandatory_experience} years</span>
            </div>

            <div className="meta-item">
              <span className="label">Vacancies:</span>
              <span className="value">{job.no_of_vacancies}</span>
            </div>
          </div>

          {/* ===== META ROW 3 ===== */}
          <div className="job-meta-grid row-3">
            <div className="meta-item">
              <span className="label">Qualification:</span>
              <span className="value">{job.mandatory_qualification}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="job-footer">
            {(
              job.application_status === "Offered" ||
              job.application_status === "Offer_Accepted" ||
              job.application_status === "Offer_Rejected"
            ) && (
                <>
                  <button
                    className="footer-link"
                    onClick={() => handleViewOffer(job)}
                  >
                    View Offer
                  </button>

                  <span className="footer-separator">|</span>
                </>
              )}

            {/* <button
          className="footer-link download-link"
           onClick={() => handleDirectDownload(job)}
        >
          Download Application
        </button> */}
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
        offerData={offerData}
        onDecisionSuccess={() => fetchAppliedJobs(masterData)}
      />

      <ApplicationDownload
        ref={previewRef}
        previewData={previewData}
        selectedJob={selectedJob}
        masterData={masterData}
        preferences={{ preferences }}
      />

    </div>
  );
};

export default AppliedJobs;
