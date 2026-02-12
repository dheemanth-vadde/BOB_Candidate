import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import jobsApiService from "../../jobs/services/jobsApiService";
import viewIcon from '../../../assets/view-icon.png';
import { handleEyeClick } from "../../../shared/utils/fileDownload";
import Loader from "../../../shared/components/Loader";

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png"
];

const DiscrepancyUploadSection = ({ applicationId,status, onSuccess }) => {
  const [docs, setDocs] = useState([]);
  const [uploads, setUploads] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDocs();
  }, [applicationId]);
const fetchDocs = async () => {
  try {


    let response;

    if (status === "DISCREPANCY") {
      response = await jobsApiService.getRejectDocuments(applicationId);
    }

    if (status === "PROVISIONALLY_APPROVED") {
      response = await jobsApiService.getProvisionallyApprovedDocs(applicationId);
    }

    //const response = await jobsApiService.getRejectDocuments(applicationId);
    console.log("Fetch Response1111:", response);
    if(response.success){
      setDocs(response.data || []);
    }
    else{
      toast.error(response.message || "Failed to load rejected documents");
    }


  } catch {
    toast.error("Failed to load rejected documents");
  }
};
const handleChange = (e, doc) => {
  const file = e.target.files[0];
  if (!file) return;

  // File type validation
  if (!allowedTypes.includes(file.type)) {
    setErrors(prev => ({
      ...prev,
      [doc.candidateDocumentId]:
        "Only PDF, DOC, DOCX, JPG, PNG files are allowed"
    }));

    return;
  }

  // Clear error if valid
  setErrors(prev => ({
    ...prev,
    [doc.candidateDocumentId]: ""
  }));

  // Store file using candidateDocumentId (IMPORTANT)
  setUploads(prev => ({
    ...prev,
    [doc.candidateDocumentId]: file
  }));
};


const handleSubmit = async () => {
  const newErrors = {};

  // Validate missing files
  docs.forEach(doc => {
    if (!uploads[doc.candidateDocumentId]) {
      newErrors[doc.candidateDocumentId] =
        "Please upload the document";
    }
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    setLoading(true);

    for (const doc of docs) {
      const file = uploads[doc.candidateDocumentId];

      const formData = new FormData();
      formData.append("file", file);

      const response =
        await jobsApiService.reUploadSingleDocument(
          formData,
          doc.verificationId   // API still needs verificationId
        );

      if (response?.success === false) {
        // Show error under that specific field
        setErrors(prev => ({
          ...prev,
          [doc.candidateDocumentId]:
            response?.message ||
            `Upload failed for ${doc.displayName}`
        }));

        throw new Error("Upload stopped due to failure");
      }
    }

    toast.success("All documents uploaded successfully");

    await fetchDocs();
    onSuccess();
    setUploads({});
    setErrors({});

  } catch (error) {
    console.error("Upload Error:", error);

    // ❌ No toast here for field errors
    // Only unexpected system errors can use toast if needed
  } finally {
    setLoading(false);
  }
};

  return (

    <div className="mt-4 p-3 border rounded bg-light discrepancy-section">
      {loading && <Loader />}
      <h6 className="section-title mb-3">
        Re-upload Rejected Documents
      </h6>

      <div className="row">
 
        {docs.map(doc => (
          <div key={doc.candidateDocumentId} className="col-md-6 mb-3">
            <div className="p-2 border rounded bg-white">
              <div className="d-flex justify-content-between mb-2">
                <label className="">{doc.displayName} <span className="text-danger">*</span></label>
                {/* <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                  View
                </a> */}


                    <div onClick={() => {
                          const uploadedFile = uploads[doc.candidateDocumentId];

                          if (uploadedFile) {
                            const previewUrl = URL.createObjectURL(uploadedFile);
                            window.open(previewUrl, "_blank");
                          } else if (doc.fileUrl) {
                            handleEyeClick(doc.fileUrl);
                          }
                        }}>
                        <img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
                    </div>
              </div>

              <input
                type="file"
                className="form-control"
                onChange={(e) => handleChange(e, doc)}
              />

              
              {errors[doc.candidateDocumentId] && (
                <div className="invalid-feedback d-block">
                  {errors[doc.candidateDocumentId]}
                </div>
)}

              {/* {uploads[doc.candidateDocumentId] && (
                <small className="text-success">
                  {uploads[doc.candidateDocumentId].name}
                </small>
              )} */}
            </div>
          </div>
        ))}
      </div>

 
<div className="query-actions">
      {docs.length > 0 && (
        <button
          className="btn btn-primaryy"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit"}
        </button>

        
      )}
      </div>
    </div>
  );
};

export default DiscrepancyUploadSection;
