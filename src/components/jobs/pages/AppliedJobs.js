import React, { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch, faCheckCircle, faCalendarAlt,
  faCalendarTimes
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import Razorpay from "../../integrations/payments/Razorpay";
import { mapAppliedJobsApiToList } from "../../jobs/mappers/appliedjobMapper";
import "../../../css/Appliedjobs.css";
import TrackApplicationModal from "../../jobs/components/TrackApplicationModal";
import axios from "axios";
import jobsApiService from "../services/jobsApiService";
import OfferLetterModal from "../../jobs/components/OfferLetterModal";
import { mapMasterDataApi } from "../../jobs/mappers/masterDataMapper";
import { toast } from "react-toastify";
import useDebounce from "../../jobs/hooks/useDebounce";
const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
const [listLoading, setListLoading] = useState(false);
const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [offerData, setOfferData] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [masterData, setMasterData] = useState([{}]);


  // const PAGE_SIZE = 3;
  const [pageSize, setPageSize] = useState(10); // default page size

  const [currentPage, setCurrentPage] = useState(0); // backend page index (0-based)
  const [totalPages, setTotalPages] = useState(0);
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
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
  useEffect(() => {
    if (!candidateId) return;
    if (!masterData || !Object.keys(masterData).length) return;

    // no search → fetch all
    if (debouncedSearchTerm.length === 0) {
      fetchAppliedJobs(masterData);
      return;
    }

    // wait for min chars
    if (debouncedSearchTerm.length < 3) return;

    fetchAppliedJobs(masterData);

  }, [candidateId, currentPage, debouncedSearchTerm, pageSize]);

  useEffect(() => {
    setCurrentPage(prev => (prev === 0 ? prev : 0));
  }, [debouncedSearchTerm]);
  useEffect(() => {
    setCurrentPage(0);
  }, [pageSize]);
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const fetchAppliedJobs = async (master) => {
    if (!candidateId || !master) return;

    try {
      setListLoading(true);

      const res = await jobsApiService.getAppliedJobs(
        candidateId,
        currentPage,
        pageSize,
        debouncedSearchTerm
      );

      const pageData = res?.data;
      const jobsData = Array.isArray(pageData?.content)
        ? pageData.content
        : [];

      const mappedJobs = mapAppliedJobsApiToList(jobsData || [], master);
      setAppliedJobs(mappedJobs);
      // ✅ pagination safety
      if (jobsData.length === 0) {
        setTotalPages(0);
      } else {
        setTotalPages(pageData?.totalPages ?? 0);
      }


    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      setAppliedJobs([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!candidateId) return;

    const init = async () => {
      const master = await fetchMasterData();
      if (master) setMasterData(master);
    };

    init();
  }, [candidateId]);


  // // ✅ Filter logic
  // const filteredJobs = appliedJobs.filter((job) => {
  //   const matchesSearch =
  //     job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     job.requisition_code?.toLowerCase().includes(searchTerm.toLowerCase());

  //   return matchesSearch;
  // });



  // const paginatedJobs = filteredJobs.slice(
  //   (currentPage - 1) * ITEMS_PER_PAGE,
  //   currentPage * ITEMS_PER_PAGE
  // );

  const handleViewOffer = async (job) => {
    try {
      if (!job?.application_id) {
        toast.error("Application ID missing");
        return;
      }

      setListLoading(true);

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
      setListLoading(false);
    }
  };
  const formatStatusLabel = (status) => {
    if (!status) return "Applied";

    return status
      .replace(/_/g, " ")          // Offer_Accepted → Offer Accepted
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase()); // Title Case
  };
  const handleDownloadApplication = async (job) => {
    if (!job?.application_id) {
      toast.error("Application ID missing");
      return;
    }

    try {
      setDownloadLoading(true);

      const res = await jobsApiService.downloadApplication(
        job.application_id
      );

      // ✅ res IS the blob already
      const blob = new Blob([res], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Application_Form.pdf"; // default name
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download application");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (

    <div className="applied-jobs-page px-4 py-3">

      {/* ===== PAGE HEADER ===== */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="mb-0 appliedheader">Job Applications</span>
        <select
          className="form-select form-select-sm"
          style={{ width: "90px" }}
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
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


      {/* ===== APPLIED JOBS LIST ===== */}
      {/* {!loading && filteredJobs.length === 0 && (
        <p className="text-muted">No applied jobs found.</p>
      )} */}
      
      {!listLoading  && appliedJobs.length === 0 && (
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

      {appliedJobs.map((job) => (
        <div className="applied-job-card mb-3" key={job.position_id}>
          {/* ===== LOADING ===== */}
          {/* Overlay loader */}
          {listLoading  && (
            <div className="list-loader-overlay">
              <div className="spinner-border text-primary" />
              <div className="mt-2 text-muted">Loading results…</div>
            </div>
          )}

          {/* Header */}
          <div className="applied-job-header">
            <div className="req-date-row">
              <span className="req-code">
                {job.requisition_code}
              </span>

              <span className="date-item">
                <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                Start: {formatDate(job.registration_start_date)}
              </span>

              <span className="date-divider">|</span>

              <span className="date-item">
                <FontAwesomeIcon icon={faCalendarTimes} className="date-icon" />
                End: {formatDate(job.registration_end_date)}
              </span>
              <h6 className="job-title titlecolor">
                {job.position_title}
              </h6>
            </div>

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
              <span className="value"> {job?.reference_number?.trim() ? job.reference_number : "-"}</span>
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

            {/* Download Application */}
            <button
              className="footer-link"
               disabled={downloadLoading === job.application_id}
              onClick={() => handleDownloadApplication(job)}
              
            >
               {downloadLoading === job.application_id ? "Downloading..." : "Download Application"}
            </button>
            <span className="footer-separator">|</span>


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

      {appliedJobs.length > 0 && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <ul className="pagination pagination-sm">

            {/* Prev */}
            <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
              >
                ‹
              </button>
            </li>

            {/* Pages */}
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            {/* Next */}
            <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
              >
                ›
              </button>
            </li>

          </ul>
        </div>
      )}


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


    </div>
  );
};

export default AppliedJobs;
