import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "../../../css/TrackApplicationModal.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { Accordion, useAccordionButton } from "react-bootstrap";
import jobsApiService from "../../jobs/services/jobsApiService";
import { useSelector } from "react-redux";
import RequestHistory from "../../jobs/components/RequestHistory";
import { toast } from "react-toastify";
const TrackApplicationModal = ({ show, onHide, job }) => {
  const [activeKey, setActiveKey] = useState("0");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef();
  const [requestTypes, setRequestTypes] = useState([]);
  const [selectedRequestType, setSelectedRequestType] = useState("");
const [description, setDescription] = useState("");
 const userData = useSelector((state) => state.user.user);
  const candidateId = userData?.data?.user?.id;
console.log("selected jobs",job)

const handleSubmitRequest = async () => {
  try {
    if (!selectedRequestType || !description) {
      alert("Please select request type and enter description");
      return;
    }

    const candidate_Id = candidateId;
    const applicationId = job?.application_id;
    console.log("candidateId:", candidateId, "applicationId:", applicationId);
    if (!candidate_Id || !applicationId) {
      alert("Missing candidate or application details");
      return;
    }

    const formData = new FormData();

    // JSON part (must match Swagger key)
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

    // Optional file
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    await jobsApiService.createCandidateThread(candidateId, formData);

    toast.success("Request submitted successfully");

    // reset state
    setSelectedRequestType("");
    setDescription("");
    setSelectedFile(null);

    onHide();
  } catch (error) {
    console.error("Submit request failed", error);
    toast.error("Failed to submit request");
  }
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
  if (show) {
    fetchRequestTypes();
  }
}, [show]);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  if (!job) return null;

  const steps = [
    "Application",
    "Shortlisted",
    "Interview Scheduled",
    "Selected In Interview",
    "Offer"
  ];

  const AccordionRow = ({ eventKey, children }) => {
    const decoratedOnClick = useAccordionButton(eventKey, () => {
      setActiveKey(prev => (prev === eventKey ? null : eventKey));
    });

    return (
      <tr onClick={decoratedOnClick} style={{ cursor: "pointer" }}>
        {children}
        <td className="text-end">
          {activeKey === eventKey ? "▲" : "▼"}
        </td>
      </tr>
    );
  };
  // Example current stage index (can come from API later)
  const currentIndex = 2; // Interview Scheduled

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
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
              <div className={`step ${state}`} key={index}>
                <div className="main">
                  <div className={`circle ${state}`}>
                    {state === "completed" && "✓"}
                  </div>

                  <div className="step-label">{step}</div>

                  <div className={`step-status ${state}`}>
                    {state === "completed"
                      ? "Completed"
                      : state === "current"
                        ? "Current Stage"
                        : "Pending"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== SUBMIT REQUEST ===== */}
        <div className="query-section bank-style">
          <h6 className="section-title">Submit Your Request</h6>

          <div className="row g-4">
            {/* LEFT SIDE */}
            <div className="col-md-7">
              <div className="">
                <label className="form-label">Request Type *</label>
               <select
                  className="form-select"
                  value={selectedRequestType}
                  onChange={(e) => setSelectedRequestType(e.target.value)}
                >
                  <option value="">Select Request Type</option>

                  {requestTypes.map((type) => (
                    <option
                      key={type.requestTypeId}
                      value={type.requestTypeId}
                    >
                      {type.requestName}
                    </option>
                  ))}
                </select>

              </div>

              <div>
                <label className="form-label">Query Details *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe your query here..."
                    value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
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
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />

              {/* ACTIONS */}
              <div className="query-actions">
                <button
                  className="btn btn-outline-secondary"
                  onClick={onHide}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
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
