// components/Tabs/ResumeUpload.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import '../../../css/Resumeupload.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faUpload } from "@fortawesome/free-solid-svg-icons";
import deleteIcon from '../../../assets/delete-icon.png';
import editIcon from '../../../assets/edit-icon.png';
import viewIcon from '../../../assets/view-icon.png';

const ResumeUpload = ({ resumeFile, setResumeFile, setParsedData, setResumePublicUrl,goNext,resumePublicUrl }) => {
  const [fileName, setFileName] = useState(resumeFile ? resumeFile.name : '');
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.user);
  const auth = useSelector((state) => state.user.authUser);
  const token = auth?.access_token;
  const candidateId = user?.candidate_id;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
    }
  };

  const fileSizeInKB = resumeFile ? (resumeFile.size / 1024).toFixed(2) : null;

  const handleBrowseClick = () => {
    const fileInput = document.getElementById('resume-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleContinue = async () => {
    if (!resumeFile) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    const uploadedformData = new FormData();
    uploadedformData.append('resumeFile', resumeFile);
    uploadedformData.append('candidateId', candidateId);

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {

       // Upload resume to the server
       const uploadResponse = await fetch('https://dev.bobjava.sentrifugo.com:8443/test-candidate-app/api/v1/resume/upload-resume', {
        method: 'POST',
        body: uploadedformData,
        headers: {
            Authorization: `Bearer ${token}`, 
          },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload resume');
      }

      const uploadResult = await uploadResponse.json();
      console.log('Resume upload successful:', uploadResult);
      
      // Save the public URL
      setResumePublicUrl(uploadResult.public_url);
      //parsing 
    
      const response = await fetch('https://dev.bobjava.sentrifugo.com:8443/test-jobcreation-app/api/v1/parseresume', {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${token}`, 
          },
      });

      if (!response.ok) throw new Error('Failed to parse resume');

      const data = await response.json();

      // Save parsed data in parent state instead of localStorage
      setParsedData(data);

      // Move to next tab
      goNext();
    } catch (err) {
      alert('Error parsing resume: ' + err.message);
      goNext();
    } finally {
      setLoading(false);
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
            {resumeFile ? resumeFile.name : "Uploaded Resume"}
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

        <div>
          <img src={editIcon} alt='Edit' style={{ width: '25px', cursor: 'pointer' }} />
        </div>

        <div>
          <img src={deleteIcon} alt='Delete' style={{ width: '25px', cursor: 'pointer' }} />
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
  <div className="mt-4 d-flex justify-content-end">
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
      disabled={!resumeFile && !resumePublicUrl}
    >
      {loading ? "Processing..." : "Save & Next"}
    </button>
  </div>

</div>

  );
};

export default ResumeUpload;
