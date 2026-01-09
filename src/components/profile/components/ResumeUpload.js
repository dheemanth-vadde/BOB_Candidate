// components/Tabs/ResumeUpload.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import '../../../css/Resumeupload.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faChevronRight, faUpload } from "@fortawesome/free-solid-svg-icons";
import deleteIcon from '../../../assets/delete-icon.png';
import editIcon from '../../../assets/edit-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import profileApi, { parseResumeDetails } from '../services/profile.api';
import { MAX_FILE_SIZE_BYTES } from '../../../shared/utils/validation';
import { toast } from 'react-toastify';

const ResumeUpload = ({ resumeFile, setResumeFile, setParsedData, setResumePublicUrl, goNext, goBack, resumePublicUrl, isBasicDetailsSubmitted }) => {
  const [fileName, setFileName] = useState(resumeFile ? resumeFile.name : '');
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state?.user?.user?.data);
  const auth = useSelector((state) => state.user.authUser);
  const token = user?.accessToken;
  const candidateId = user?.user?.id;
  // const candidateId = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
  const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
  useEffect(() => {
    // If Basic Details was NOT submitted, resume must NOT exist
    if (!isBasicDetailsSubmitted) {
      setResumeFile(null);
      setResumePublicUrl("");
      setFileName("");
    }
  }, [isBasicDetailsSubmitted]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Invalid file type. Only PDF, DOC, DOCX files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File size exceeds 2MB. Please upload a smaller resume.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    setFileName(file.name);
  };

  const fileSizeInKB = resumeFile ? (resumeFile.size / 1024).toFixed(2) : null;

  const handleBrowseClick = () => {
    const fileInput = document.getElementById('resume-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleContinue = async () => {
    // accept existing OR new resume
    if (!resumeFile && !resumePublicUrl) {
      alert("Please upload a resume");
      return;
    }
    if (!candidateId) {
      alert("Candidate ID missing");
      return;
    }
    // If resume already exists and user didn’t change it
    if (!resumeFile && resumePublicUrl) {
      goNext();
      return;
    }
    // Otherwise upload new resume
    setLoading(true);
    try {
      const res = await profileApi.parseResumeDetails(candidateId, resumeFile);
      if (res?.publicUrl) {
        setResumePublicUrl(res.publicUrl);
      }
      if (res?.data) {
        setParsedData(res.data);
      }
      goNext(); // ✅ success only
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        "Resume upload failed"
      );
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    if (!candidateId) return;
    const fetchResume = async () => {
      try {
        const res = await profileApi.getResumeDetails(candidateId);
        const resumeData = res.data; // IMPORTANT
        if (resumeData?.fileUrl) {
          setResumePublicUrl(resumeData.fileUrl);
          setFileName(resumeData.fileName);
          setResumeFile(null); // DO NOT fake File object
        }
      } catch (err) {
        console.error("Resume fetch failed", err);
      }
    };
    fetchResume();
  }, [candidateId]);

  const handleDelete = () => {
    setResumeFile(null);
    setResumePublicUrl("");
    setFileName("");
    // clear file input value (critical)
    const input = document.getElementById("resume-input");
    if (input) {
      input.value = "";
    }
  };

  return (
    <div className="form-content-section px-4 py-3 border rounded bg-white w-50 mx-auto">
      <p className="tab_headers" style={{ marginBottom: '0px', marginTop: '0rem' }}>Resume Upload</p>

      {/* If resume already uploaded → show file preview UI */}
      {(resumeFile || resumePublicUrl) ? (
        <div className="uploaded-file-box p-3 mt-3 d-flex justify-content-between align-items-center"
          style={{
            border: "2px solid #bfc8e2",
            borderRadius: "8px",
            background: "#f7f9fc"
          }}
        >

          {/* Left: Check icon + file info */}
          <div className="d-flex align-items-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              style={{ color: "green", fontSize: "22px", marginRight: "10px" }}
            />

            <div className='p-2'>
              <div style={{ fontWeight: 600 }}>
                {fileName}
              </div>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                {resumeFile ? `${fileSizeInKB} KB` : "Click eye icon to view"}
              </div>
            </div>
          </div>

          {/* Right: Action icons */}
          <div className="d-flex gap-2">

            <div onClick={() => window.open(resumePublicUrl, "_blank")}>
              <img src={viewIcon} alt='View' style={{ width: '25px', cursor: 'pointer' }} />
            </div>

            {/* <div>
          <img src={editIcon} alt='Edit' style={{ width: '25px', cursor: 'pointer' }} />
        </div> */}

            <div>
              <img src={deleteIcon} alt='Delete' style={{ width: '25px', cursor: 'pointer' }} onClick={handleDelete} />
            </div>
          </div>
        </div>

      ) : (
        /* Dropzone UI when NO resume uploaded */
        <div className="dropzone" onClick={handleBrowseClick}>
          <div className="d-flex flex-column align-items-center" style={{ lineHeight: "2rem" }}>
            <FontAwesomeIcon icon={faUpload} className="text-secondary mb-2" size="2x" />

            <div>Drag & drop your resume here, or</div>
            <span style={{ color: "#42579f", cursor: "pointer" }}>Click to Upload</span>
            <span className="text-muted mt-2" style={{ fontSize: "12px" }}>
              Supported: PDF, DOC, DOCX (Max 2MB)
            </span>
          </div>

          <input
            type="file"
            id="resume-input"
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Next button */}
      <div className="mt-4 d-flex justify-content-between">
        <div>
          <button type="button" className="btn btn-outline-secondary text-muted" onClick={goBack}>Back</button>
        </div>
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
            disabled={!resumeFile && !resumePublicUrl}
          >
            {loading ? "Processing..." : "Save & Next"}
            <FontAwesomeIcon icon={faChevronRight} size='sm' className="ms-2" />
          </button>
        </div>
      </div>

      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 9999
          }}
        >
          <div className="text-center text-white">
            <div className="spinner-border text-light mb-3" role="status" />
            <div style={{ fontSize: "16px", fontWeight: 500 }}>
              Parsing resume, please wait...
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResumeUpload;
