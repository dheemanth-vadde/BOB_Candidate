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
const TrackApplicationModal = ({ show, onHide, job }) => {
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
//job?.employment_type 
const isContract = job?.employment_type === "Contract";
const steps = isContract
  ? [
      "Applied",
      "Shortlisted",
      "Interview Scheduled",
      "Selected In Interview",
      "Compensation",
      "Offer",
    ]
  : [
      "Applied",
      "Shortlisted",
      "Interview Scheduled",
      "Selected In Interview",
      "Offer",
    ];
const [errors, setErrors] = useState({});
const statusToIndexMap = isContract
  ? {
      Applied: 0,
      Shortlisted: 1,
      Scheduled: 2,
      Selected: 3,
      Compensation: 4,
      Offered: 5,
    }
  : {
      Applied: 0,
      Shortlisted: 1,
      Scheduled: 2,
      Selected: 3,
      Offered: 4,
    };

const stepToStatusMap = {
  "Applied": "Applied",
  "Shortlisted": "Shortlisted",
  "Interview Scheduled": "Scheduled",
  "Selected In Interview": "Selected",
  "Compensation": "Compensation",
  "Offer": "Offered"
};

console.log("selected jobs",job)
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
    const list = Array.isArray(res?.data) ? res.data : [];

    // store dates for each status
    const map = {};
    let maxIndex = 0;

    list.forEach(item => {
      map[item.status] = item.actionDate;

      const idx = statusToIndexMap[item.status];
      if (idx !== undefined && idx > maxIndex) {
        maxIndex = idx;
      }
    });

    setStatusMap(map);
    setCurrentIndex(maxIndex); // ✅ THIS drives the stepper

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

    await jobsApiService.createCandidateThread(candidateId, formData);

    toast.success("Request submitted successfully");

    // reset
    setSelectedRequestType("");
    setDescription("");
    setSelectedFile(null);
    setErrors({});

    onHide();
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

  const backendStatus = stepToStatusMap[step];
  const stepDate = statusMap[backendStatus];

  return (
    <div className={`step ${state}`} key={index}>
      <div className="circle-wrapper">
        <div className={`circle ${state}`}>
          {state === "completed" && "✓"}
        </div>
      </div>

      <div className="step-label">{step}</div>

      {/* ✅ DATE NOW WORKS */}
      <div className="step-date">
        {stepDate ? formatDateTime(stepDate) : ""}
      </div>

      <div className={`step-badge ${state}`}>
        {state === "completed"
          ? "Completed"
          : state === "current"
          ? "Current Stage"
          : "Pending"}
      </div>
    </div>
  );
})}
          </div>

          {isContract && (
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
                <button
                  className="btn btn-outline-secondary"
                  onClick={onHide}
                >
                  Cancel
                </button>
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

           <RequestHistory applicationId={job?.application_id}   requestTypes={requestTypes}/>

           
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TrackApplicationModal;
