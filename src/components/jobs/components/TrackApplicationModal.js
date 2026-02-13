import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "../../../css/TrackApplicationModal.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { Accordion, useAccordionButton } from "react-bootstrap";
import jobsApiService from "../../jobs/services/jobsApiService";
import { useSelector } from "react-redux";
import RequestHistory from "../../jobs/components/RequestHistory";
import CompensationSection from "../../jobs/components/CompensationSection";
import { toast } from "react-toastify";
import bulb from "../../../assets/bulb-icon.png";
import DiscrepancyUploadSection from "./DiscrepancyUploadSection";

const TrackApplicationModal = ({ show, onHide, job,onDecisionSuccess }) => {
  const [activeKey, setActiveKey] = useState("0");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef();
  const [requestTypes, setRequestTypes] = useState([]);
  const [selectedRequestType, setSelectedRequestType] = useState("");
  const [description, setDescription] = useState("");
  const userData = useSelector((state) => state.user.user);
  const candidateId = userData?.data?.user?.id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [refreshHistoryKey, setRefreshHistoryKey] = useState(0);

  const [currentSubStatus, setCurrentSubStatus] = useState(null);
  const [isTerminal, setIsTerminal] = useState(false);
  //job?.employment_type 
  const isContract = job?.employment_type === "Contract";
  // ✅ MAIN STAGES (CLEANED STRUCTURE)
  const steps = [
    { label: "Applied", key: "APPLIED" },
    { label: "Shortlisted", key: "SHORTLISTED" },
    { label: "Interview Scheduled", key: "SCHEDULED" },
    { label: "Selected", key: "SELECTED" },
    { label: "Offer", key: "OFFERED" }
  ];

  // ✅ Map backend main status to index
  const mainStatusToIndex = {
    APPLIED: 0,
    SHORTLISTED: 1,
    SCHEDULED: 2,
    SELECTED: 3,
    OFFERED: 4
  };

  // Terminal states (freeze progress)
  const terminalSubStatuses = [
    "REJECTED",
    "DISQUALIFIED",
    "CANCELLED"
  ];

  const [errors, setErrors] = useState({});

  // const statusToIndexMap = isContract
  //   ? {
  //     APPLIED: 0,
  //     SHORTLISTED: 1,
  //     SCHEDULED: 2,
  //     SELECTED: 3,
  //     COMPENSATION: 4,
  //     OFFERED: 5,
  //   }
  //   : {
  //     APPLIED: 0,
  //     SHORTLISTED: 1,
  //     SCHEDULED: 2,
  //     SELECTED: 3,
  //     OFFERED: 4,
  //   };

  // const stepToStatusMap = {
  //   "Applied": "Applied",
  //   "Shortlisted": "Shortlisted",
  //   "Interview Scheduled": "Scheduled",
  //   "Selected": "Selected",
  //   "Compensation": "Compensation",
  //   "Offer": "Offered"
  // };

  const hasActiveDiscrepancy =
    currentSubStatus === "DISCREPANCY";

  console.log("selected jobs", job)
  useEffect(() => {
    if (show) {
      setErrors({});
      setSelectedRequestType("");
      setDescription("");
      setSelectedFile(null);
    }
  }, [show]);
  const fetchApplicationStatus = async () => {
    try {
      if (!job?.application_id) return;

      const res = await jobsApiService.getApplicationStatus(job.application_id);
      // const list = Array.isArray(res?.data) ? res.data : [];

      // if (!list.length) return;

      // // Sort by latest actionDate
      // const sorted = [...list].sort(
      //   (a, b) => new Date(b.actionDate) - new Date(a.actionDate)
      // );


      const list = Array.isArray(res?.data) ? res.data : [];
if (!list.length) return;

const map = {};
list.forEach(item => {
  map[item.status] = item.actionDate;
});
setStatusMap(map);

const sorted = [...list].sort(
  (a, b) => new Date(b.actionDate) - new Date(a.actionDate)
);


      const latest = sorted[0];
      console.log("latest", latest);

      // Determine main stage
      let mainStage = latest.status;

      // Normalize Interview stage
      if (["SCHEDULED", "RESCHEDULED","PROVISIONALLY_APPROVED", "QUALIFIED", "DISQUALIFIED"]
        .includes(mainStage)) {
        mainStage = "SCHEDULED";

      }

      const index = mainStatusToIndex[mainStage] ?? 0;

      setCurrentIndex(index);
      setCurrentSubStatus( latest.status);

      // Check terminal
      setIsTerminal(
        terminalSubStatuses.includes(latest.status)
      );

    } catch (err) {
      console.error("Failed to fetch application status", err);
    }
  };


  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) + " " +
      d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
  };


  const handleSubmitRequest = async () => {
    try {
      if (!validateRequestForm()) return;

      const applicationId = job?.application_id;
      if (!candidateId || !applicationId) {
        toast.error("Missing candidate or application details");
        return;
      }

      const formData = new FormData();

      formData.append(
        "createThreadRequestModel",
        new Blob(
          [
            JSON.stringify({
              requestTypeId: selectedRequestType,
              description,
              applicationId,
            }),
          ],
          { type: "application/json" }
        )
      );

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await jobsApiService.createCandidateThread(formData);

      toast.success("Request submitted successfully");

      // reset
      setSelectedRequestType("");
      setDescription("");
      setSelectedFile(null);
      setErrors({});

      //onHide();
      // ✅ Trigger history refresh
      setRefreshHistoryKey(prev => prev + 1);
    } catch (error) {
      console.error("Submit request failed", error);
      toast.error("Failed to submit request");
    }
  };
  const validateRequestForm = () => {
    const newErrors = {};

    if (!selectedRequestType) {
      newErrors.requestType = "Please select a request type";
    }

    if (!description.trim()) {
      newErrors.description = "Please enter query details";
    }
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      newErrors.file = "Invalid file type selected";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const fetchRequestTypes = async () => {
    try {
      const response = await jobsApiService.getRequestTypes();

      const list = Array.isArray(response?.data)
        ? response.data
        : [];

      setRequestTypes(list);
    } catch (error) {
      console.error("Failed to fetch request types", error);
      setRequestTypes([]);
    }
  };
  useEffect(() => {
    if (show && job?.application_id) {
      fetchRequestTypes();
      fetchApplicationStatus();
    }
  }, [show, job?.application_id]);


  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png"
  ];
  const MAX_SIZE_MB = 5; // optional

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newErrors = {};

    // 🔒 File type validation
    if (!allowedTypes.includes(file.type)) {
      newErrors.file = "Only PDF, DOC, DOCX, JPG, PNG files are allowed";
    }

    // 🔒 File size validation
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      newErrors.file = `File size must be less than ${MAX_SIZE_MB}MB`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    // ✅ valid file
    setErrors(prev => ({ ...prev, file: "" }));
    setSelectedFile(file);
  };


  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  if (!job) return null;



  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" dialogClassName="track-application-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          Track Application Status
          <div className="job-subtitle">{job.position_title}</div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* ===== STATUS STEPPER ===== */}
        <div className="status-stepper">
          {steps.map((step, index) => {

            const state =
              index < currentIndex
                ? "completed"
                : index === currentIndex
                  ? "current"
                  : "pending";

            return (
              <div className="step-item" key={step.key}>

                {/* Connector Line */}
                {index !== 0 && (
                  <div className={`step-line ${index <= currentIndex ? "active" : ""}`} />
                )}

                <div className={`step-circle ${state}`}>
                  {state === "completed" ? "✓" : index + 1}
                </div>

                <div className="step-content">
                  <div className="step-title">{step.label}</div>

                    {/* Add This */}
                  {statusMap[step.key] && (
                    <div className="step-date">
                      {formatDateTime(statusMap[step.key])}
                    </div>
                  )}


                  {index === currentIndex && (
                    <div className="step-status-label">
                      {state === "current" ? "Current Stage" : ""}
                    </div>
                  )}

                  {/* 🔥 Sub Status Badge */}
                  {index === currentIndex && currentSubStatus && (
                    <div className={`sub-status-chip ${terminalSubStatuses.includes(currentSubStatus)
                        ? "chip-danger"
                        : currentSubStatus === "DISCREPANCY"
                          ? "chip-warning"
                          : "chip-primary"
                      }`}>
                      {currentSubStatus.replaceAll("_", " ")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isTerminal && (
          <div className="alert alert-danger mt-3">
            Your application has been {currentSubStatus.replaceAll("_", " ")}.
          </div>
        )}


        {hasActiveDiscrepancy && (
          <div className="alert alert-danger mb-3">
            <strong>Documents Rejected!</strong> Please re-upload required documents to proceed.
          </div>
        )}

      {(currentSubStatus === "DISCREPANCY" ||
          currentSubStatus === "PROVISIONALLY_APPROVED") && (
          <DiscrepancyUploadSection
            applicationId={job?.application_id}
            status={currentSubStatus}
            onSuccess={fetchApplicationStatus}
            onHide={onHide}
            onDecisionSuccess={onDecisionSuccess}
          />
        )}

       {!hasActiveDiscrepancy &&
        isContract &&
        steps[currentIndex]?.key === "SELECTED" && (
          <CompensationSection applicationId={job?.application_id} />
        )}

        {/* ===== SUBMIT REQUEST ===== */}
        
          <div className="query-section bank-style">
            <h6 className="section-title">Submit Your Request</h6>

            <div className="row g-4">
              {/* LEFT SIDE */}
              <div className="col-md-7">
                <div className="">
                  <label className="form-label">
                    Request Type <span className="text-danger">*</span>
                  </label>

                  <select
                    className="form-select"
                    value={selectedRequestType}
                    onChange={(e) => {
                      setSelectedRequestType(e.target.value);
                      setErrors(prev => ({ ...prev, requestType: "" }));
                    }}
                  >
                    <option value="">Select Request Type</option>
                    {requestTypes.map(type => (
                      <option key={type.requestTypeId} value={type.requestTypeId}>
                        {type.requestName}
                      </option>
                    ))}
                  </select>

                  {errors.requestType && (
                    <div className="invalid-feedback d-block">
                      {errors.requestType}
                    </div>
                  )}

                </div>

                <div>
                  <label className="form-label">
                    Query Details <span className="text-danger">*</span>
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe your query here..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors(prev => ({ ...prev, description: "" }));
                    }}
                  />

                  {errors.description && (
                    <div className="invalid-feedback d-block">
                      {errors.description}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="col-md-5">
                <label className="form-label">Attachment (Optional)</label>

                {/* Upload Card */}
                <div
                  className="upload-card"
                  onClick={handleUploadClick}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon icon={faUpload} className="text-secondary mb-2" size="2x" />
                  <div className="upload-text">
                    {selectedFile ? selectedFile.name : "Upload document"}
                  </div>
                  <div className="upload-subtext">PDF, DOC, DOCX, JPG, PNG</div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept=".pdf,.doc,.jpg,.png"
                  onChange={handleFileSelect}
                />
                {errors.file && (
                  <div className="invalid-feedback d-block">
                    {errors.file}
                  </div>
                )}
                {/* ACTIONS */}
                <div className="query-actions">
                  {/* <button
                    className="btn btn-outline-secondary"
                    onClick={onHide}
                  >
                    Cancel
                  </button> */}
                  <button
                    className="btn btn-primaryy"
                    onClick={handleSubmitRequest}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>


          </div>
        
        {/* ===== REQUEST HISTORY ===== */}
       
          <div className="query-section bank-style request-history">
            <h6 className="section-title">Request History</h6>

            <RequestHistory applicationId={job?.application_id} requestTypes={requestTypes} refreshKey={refreshHistoryKey} />


          </div>
        
      </Modal.Body>
    </Modal>
  );
};

export default TrackApplicationModal;
