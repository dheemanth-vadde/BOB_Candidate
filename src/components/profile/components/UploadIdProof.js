// components/Tabs/UploadIdProof.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import '../../../css/Resumeupload.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faUpload } from "@fortawesome/free-solid-svg-icons";
import deleteIcon from '../../../assets/delete-icon.png';
import editIcon from '../../../assets/edit-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import profileApi from '../services/profile.api';

const UploadIdProof = ({ goNext, goBack }) => {
  const aadhaarDoc = useSelector((state) =>
    state.documentTypes?.list?.data?.find(
      (doc) => doc.docCode === "ADHAR"
    ) || null
  );
  console.log(aadhaarDoc)
  const documentId = aadhaarDoc?.documentTypeId;
  const documentCode = aadhaarDoc?.docCode;
  const [idProofFile, setIdProofFile] = useState(null);
  const [idProofPublicUrl, setIdProofPublicUrl] = useState("");
  const [parsedIdProofData, setParsedIdProofData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const user = useSelector((state) => state?.user?.user?.data);
  const auth = useSelector((state) => state.user.authUser);
  const token = user?.accessToken;
  const candidateId = user?.user?.id;

  useEffect(() => {
    if (!candidateId || !documentCode) return;

    const fetchIdProof = async () => {
      try {
        const res = await profileApi.getDocumentDetailsByCode(
          candidateId,
          documentCode
        );

        const doc = res?.data?.data;

        if (doc) {
          // API sometimes returns `fileUrl` (new) or `publicUrl` (older).
          const url = doc.fileUrl || doc.publicUrl || doc.publicUrlString || "";
          setIdProofPublicUrl(url);
          setUploadedFileName(doc.fileName || doc.fileNameString || "");
          setParsedIdProofData(doc);
        }
      } catch (err) {
        console.error("Failed to fetch ID proof", err);
      }
    };

    fetchIdProof();
  }, [candidateId, documentCode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdProofFile(file);
      setUploadedFileName(file.name);
      // if user selected a new file, clear previously stored public url
      setIdProofPublicUrl("");
    }
  };

  const fileSizeInKB = idProofFile ? (idProofFile.size / 1024).toFixed(2) : null;

  const handleBrowseClick = () => {
    document.getElementById('idproof-input')?.click();
  };

  const handleContinue = async () => {
    if (!idProofFile && !idProofPublicUrl) {
      alert("Please upload Aadhar");
      return;
    }

    // already uploaded → just move next
    if (idProofPublicUrl && !idProofFile) {
      goNext();
      return;
    }
    setLoading(true);

    try {
      const res = await profileApi.postDocumentDetails(
        candidateId,
        documentId,
        idProofFile
      );

      const uploadedDoc = res?.data;

      setIdProofPublicUrl(uploadedDoc?.publicUrl || "");
      setParsedIdProofData(uploadedDoc);

      goNext();
    } catch (err) {
      console.error(err);
      alert("Failed to upload ID proof");
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = () => {
  //   setIdProofFile(null);
  //   setIdProofPublicUrl("");
  //   setParsedIdProofData(null);

  //   // clear file input value (important)
  //   const input = document.getElementById("idproof-input");
  //   if (input) input.value = "";
  // };

  const handleDelete = async () => {
    // CASE 1: Local-only file (never uploaded)
    if (idProofFile && !parsedIdProofData) {
      setIdProofFile(null);
      setUploadedFileName("");
      setIdProofPublicUrl("");

      const input = document.getElementById("idproof-input");
      if (input) input.value = "";

      return;
    }

    // CASE 2: Backend file → must delete via API
    if (parsedIdProofData?.documentId) {
      try {
        setLoading(true);
        await profileApi.deleteDocument(
          candidateId,
          parsedIdProofData.documentId
        );

        // Clear UI ONLY after backend confirms delete
        setIdProofFile(null);
        setIdProofPublicUrl("");
        setParsedIdProofData(null);
        setUploadedFileName("");

        const input = document.getElementById("idproof-input");
        if (input) input.value = "";

      } catch (err) {
        console.error("Failed to delete document", err);
        alert("Failed to delete document. Try again.");
      } finally {
        setLoading(false);
      }

      return;
    }

    // Fallback (should NEVER happen)
    console.warn("Delete clicked but no file exists");
  };

  return (
    <div className="form-content-section px-4 py-3 border rounded bg-white w-50 mx-auto">
      <p className="tab_headers" style={{ marginBottom: 0 }}>
        Upload Aadhar
      </p>

      {(idProofFile || idProofPublicUrl) ? (
        <div
          className="uploaded-file-box p-3 mt-3 d-flex justify-content-between align-items-center"
          style={{
            border: "2px solid #bfc8e2",
            borderRadius: "8px",
            background: "#f7f9fc"
          }}
        >
          <div className="d-flex align-items-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              style={{
                color: "green",
                fontSize: "22px",
                marginRight: "10px",
              }}
            />

            <div className="p-2">
              <div style={{ fontWeight: 600 }}>
                {idProofFile ? idProofFile.name : uploadedFileName || "Uploaded Aadhar"}
              </div>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                {idProofFile ? `${fileSizeInKB} KB` : "Click eye icon to view"}
              </div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <div
              onClick={() => {
                // If we have a public URL open it, otherwise preview selected file
                if (idProofPublicUrl) {
                  window.open(idProofPublicUrl, "_blank");
                } else if (idProofFile) {
                  const url = URL.createObjectURL(idProofFile);
                  window.open(url, "_blank");
                }
              }}
            >
              <img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
            </div>

            {/* <div onClick={handleBrowseClick}>
              <img src={editIcon} alt="Edit" style={{ width: "25px", cursor: "pointer" }} />
            </div> */}

            <div>
              <img src={deleteIcon} alt="Delete" style={{ width: "25px", cursor: "pointer" }} onClick={handleDelete} />
            </div>
          </div>
        </div>
      ) : (
        <div className="dropzone" onClick={handleBrowseClick}>
          <div className="d-flex flex-column align-items-center" style={{ lineHeight: "2rem" }}>
            <FontAwesomeIcon icon={faUpload} className="text-secondary mb-2" size="2x" />
            <div>Drag & drop your Aadhar here, or</div>
            <span style={{ color: "#42579f", cursor: "pointer" }}>Click to Upload</span>
            <span className="text-muted mt-2" style={{ fontSize: "12px" }}>
              Supported: PDF, JPG, PNG, DOC, DOCX (Max 2MB)
            </span>
          </div>

          <input
            type="file"
            id="idproof-input"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      )}

      <div className="mt-4 d-flex justify-content-end">
        {/* <div>
          <button type="button" className="btn btn-outline-secondary text-muted" onClick={() => goBack && goBack()}>Back</button>
        </div> */}
        <div>
          <button
            className="btn btn-primary"
            style={{
              backgroundColor: "#ff7043",
              border: "none",
              padding: "8px 24px",
              borderRadius: "4px",
              color: "#fff"
            }}
            onClick={handleContinue}
            disabled={!idProofFile && !idProofPublicUrl}
          >
            {loading ? "Processing..." : "Save & Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadIdProof;
