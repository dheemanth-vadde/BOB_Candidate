// components/Tabs/UploadIdProof.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import '../../../css/Resumeupload.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import deleteIcon from '../../../assets/delete-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import profileApi from '../services/profile.api';
import { createWorker } from 'tesseract.js';
import { setExtractedData, clearExtractedData } from '../store/idProofSlice';
import { MAX_FILE_SIZE_BYTES } from '../../../shared/utils/validation';
import { toast } from 'react-toastify';
import greenCheck from '../../../assets/green-check.png'
import masterApi from '../../../services/master.api';

const normalize = (s) =>
  s
    .replace(/[^\w\s/]/g, "") // remove OCR junk
    .replace(/\s+/g, " ")
    .trim();

// Function to parse AADHAAR text
const parseAadhaarText = (text) => {
  const lines = text
    .split("\n")
    .map(l => normalize(l))
    .filter(Boolean);

  let dob = "";
  let name = "";

  const dobRegex = /\b(\d{2}\/\d{2}\/\d{4})\b/;

  for (let i = 0; i < lines.length; i++) {
    if (dobRegex.test(lines[i])) {
      dob = lines[i].match(dobRegex)[1];

      // NAME IS USUALLY ABOVE DOB
      for (let j = i - 1; j >= 0; j--) {
        if (
          lines[j].length > 5 &&
          !lines[j].toLowerCase().includes("government") &&
          !lines[j].toLowerCase().includes("india") &&
          !lines[j].match(/\d/)
        ) {
          name = lines[j];
          break;
        }
      }
      break;
    }
  }

  return { name, dob };
};

const UploadIdProof = ({ goNext, goBack }) => {
  const dispatch = useDispatch();
  const aadhaarDoc = useSelector((state) =>
    state.documentTypes?.list?.data?.find(
      (doc) => doc.docCode === "ADHAR"
    ) || null
  );
  console.log(aadhaarDoc)
  const documentId = aadhaarDoc?.documentTypeId;
  const documentCode = aadhaarDoc?.docCode;
  const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];
  const [idProofFile, setIdProofFile] = useState(null);
  const [idProofPublicUrl, setIdProofPublicUrl] = useState("");
  const [parsedIdProofData, setParsedIdProofData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  const extractedName = useSelector(state => state.idProof.name);
  const extractedDOB = useSelector(state => state.idProof.dob);

  const user = useSelector((state) => state?.user?.user?.data);
  const auth = useSelector((state) => state.user.authUser);
  const token = user?.accessToken;
  const candidateId = user?.user?.id;
  const displayFileName =
  idProofFile?.name ||
  parsedIdProofData?.fileName ||
  "Uploaded Document";

  const isImage = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png'].includes(ext);
  };

  const performOCRFromBlob = async (blob) => {
    setOcrLoading(true);
    try {
      const worker = await createWorker('eng+hin');
      const { data: { text } } = await worker.recognize(blob);
      await worker.terminate();

      const extracted = parseAadhaarText(text);
      dispatch(setExtractedData({
        name: extracted.name,
        dob: extracted.dob,
        isNewUpload: true
      }));

    } catch (err) {
      console.error("OCR failed", err);
      dispatch(clearExtractedData());
    } finally {
      setOcrLoading(false);
    }
  };

  useEffect(() => {
    if (!candidateId || !documentCode) return;
    const fetchIdProof = async () => {
      try {
        const res = await profileApi.getDocumentDetailsByCode(
          candidateId,
          documentCode
        );
        const doc = res?.data;
        if (!doc) return;

        setParsedIdProofData(doc);
        setIdProofPublicUrl(doc.fileUrl || "");
        setUploadedFileName(doc.fileName || "");

        // 🔥 THIS IS CRITICAL
        setIdProofFile(null);

      } catch (err) {
        console.error("Failed to fetch ID proof", err);
      }
    };
    fetchIdProof();
  }, [candidateId, documentCode]);

  useEffect(() => {
    if (!idProofPublicUrl) return;
    if (!isImage(uploadedFileName)) return;
    if (extractedName || extractedDOB) return; // prevent re-run

    const runOCR = async () => {
      try {
        const response = await fetch(idProofPublicUrl);
        const blob = await response.blob();
        await performOCRFromBlob(blob);
      } catch (err) {
        console.error("Failed to OCR fetched document", err);
      }
    };
    runOCR();
  }, [idProofPublicUrl]);

  const handleEyeClick = async () => {
    // ✅ CASE 1: Local file → preview
    if (idProofFile) {
      const url = URL.createObjectURL(idProofFile);
      window.open(url, "_blank");
      return;
    }

    // ✅ CASE 2: Backend file → download
    if (parsedIdProofData?.fileUrl) {
      try {
        const res = await masterApi.downloadFile(parsedIdProofData.fileUrl);

        const contentType =
          res.headers["content-type"] || "application/octet-stream";

        const blob = new Blob([res.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = parsedIdProofData.fileName; // 🔴 preserves format
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        toast.error("Download failed");
      }
      return;
    }

    toast.error("No document available");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Invalid file type. Only PDF, JPG, PNG, DOC, DOCX are allowed.");
      e.target.value = ""; // reset input
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File size exceeds 2MB. Please upload a smaller file.");
      e.target.value = "";
      return;
    }

    setIdProofFile(file);
    setUploadedFileName(file.name);
    setIdProofPublicUrl("");
    dispatch(clearExtractedData());

    if (file.type.startsWith("image/")) {
      await performOCRFromBlob(file);
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

      setIdProofPublicUrl(uploadedDoc?.fileUrl || "");
      setParsedIdProofData(uploadedDoc);

      setIdProofFile(null);
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
      dispatch(clearExtractedData());

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
        dispatch(clearExtractedData());

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
            <img
              src={greenCheck}
              style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
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
              onClick={handleEyeClick}
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

      {(extractedName || extractedDOB || ocrLoading) && (
        <div className="mt-2">
          {ocrLoading && <p>Extracting information... <FontAwesomeIcon icon={faSpinner} spin /></p>}
          {extractedName && <p style={{ marginBottom: '0.25rem' }}>Name: {extractedName}</p>}
          {extractedDOB && <p>Date of Birth: {extractedDOB}</p>}
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
              padding: "0.6rem 2rem",
              borderRadius: "4px",
              color: "#fff",
              fontSize: '0.875rem'
            }}
            onClick={handleContinue}
            disabled={loading || ocrLoading || (!idProofFile && !idProofPublicUrl)}
          >
            {loading && <FontAwesomeIcon icon={faSpinner} spin />} {loading ? "Processing..." : "Save & Next"}
            <FontAwesomeIcon icon={faChevronRight} size='sm' className="ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadIdProof;
