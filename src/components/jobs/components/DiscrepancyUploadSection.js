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

const DiscrepancyUploadSection = ({ applicationId, onSuccess }) => {
  const [docs, setDocs] = useState([]);
  const [uploads, setUploads] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, [applicationId]);
const fetchDocs = async () => {
  try {

    const staticData = {
      success: true,
      message: "Reject documents found",
      data: [
        {
          candidateDocumentId: "cafdb0fd-d52a-407f-9976-b56338d9630a",
          fileUrl: "/documents/Candidate/candidate_doc/Candidate_Aadhar.png",
          displayName: "Aadhar Card"
        },
        {
          candidateDocumentId: "89757b2b-8528-44e9-9145-46e6f5928cbd",
          fileUrl: "/documents/Candidate/Resume.pdf",
          displayName: "RESUME"
        },
        {
          candidateDocumentId: "08e0d007-57c0-45cf-a7fd-4f4f87c125c8",
          fileUrl: "/documents/Candidate/Signature.png",
          displayName: "Signature"
        },
        {
          candidateDocumentId: "9cdf931a-eda0-4be9-92c9-49d6abb4025f",
          fileUrl: "/documents/Candidate/Certificate.png",
          displayName: "Certificate_Python"
        }
      ]
    };

    setDocs(staticData.data || []);

  } catch {
    toast.error("Failed to load rejected documents");
  }
};

const handleChange = async (e, doc) => {
  const file = e.target.files[0];
  if (!file) return;

  // File type validation
  if (!allowedTypes.includes(file.type)) {
    toast.error("Only PDF, DOC, DOCX, JPG, PNG files are allowed");
    return;
  }

  try {
    setLoading(true); // 🔥 start loader

    const formData = new FormData();
    formData.append("file", file);
    formData.append("candidateDocumentId", doc.candidateDocumentId);

    const response = await jobsApiService.reUploadSingleDocument(formData);

    if (response?.success === false) {
      throw new Error(response?.message || "Upload failed");
    }

    toast.success(`${doc.displayName} uploaded successfully`);

    // // Mark document as uploaded
    // setUploadedDocIds(prev => [...prev, doc.candidateDocumentId]);

    // Optional: refresh discrepancy list
    await fetchDocs();

  } catch (error) {
    console.error("Upload Error:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Upload failed. Please try again.";

    toast.error(errorMessage);

  } finally {
    setLoading(false); // 🔥 stop loader
  }
};


  const handleSubmit = async () => {
    if (Object.keys(uploads).length !== docs.length) {
      toast.error("Please upload all rejected documents");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      docs.forEach(doc => {
        formData.append("files", uploads[doc.candidateDocumentId]);
        formData.append("candidateDocumentIds", doc.candidateDocumentId);
      });

      await jobsApiService.reUploadRejectedDocuments(formData);

      toast.success("Documents uploaded successfully");
      onSuccess(); // refresh status
      setUploads({});

    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="mt-4 p-3 border rounded bg-light">
      {loading && <Loader />}
      <h6 className="section-title mb-3">
        Re-upload Rejected Documents
      </h6>

      <div className="row">
 
        {docs.map(doc => (
          <div key={doc.candidateDocumentId} className="col-md-6 mb-3">
            <div className="p-2 border rounded bg-white">
              <div className="d-flex justify-content-between mb-2">
                <span className="">{doc.displayName}</span>
                {/* <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                  View
                </a> */}


                    <div onClick={() => handleEyeClick(doc.fileUrl)}>
                        <img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
                    </div>
              </div>

              <input
                type="file"
                className="form-control"
                onChange={(e) => handleChange(e, doc)}
              />

              {uploads[doc.candidateDocumentId] && (
                <small className="text-success">
                  {uploads[doc.candidateDocumentId].name}
                </small>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* {docs.length > 0 && (
        <button
          className="btn btn-danger mt-3"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit Documents"}
        </button>
      )} */}
    </div>
  );
};

export default DiscrepancyUploadSection;
