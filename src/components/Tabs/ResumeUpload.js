// components/Tabs/ResumeUpload.jsx
import React, { useState } from 'react';

const ResumeUpload = ({ resumeFile, setResumeFile, setParsedData, goNext }) => {
  const [fileName, setFileName] = useState(resumeFile ? resumeFile.name : '');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
    }
  };

  const handleBrowseClick = () => {
    document.getElementById('resume-input').click();
  };

  const handleContinue = async () => {
    if (!resumeFile) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await fetch('https://backend.sentrifugo.com/parse-resume2', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse resume');

      const data = await response.json();

      // Save parsed data in parent state instead of localStorage
      setParsedData(data);

      // Move to next tab
      goNext();
    } catch (err) {
      alert('Error parsing resume: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-content-section text-center">
      <h2>Upload Resume</h2>
      <p>Resume/CV* (Supported format: .docx/.pdf; Max size: 4.5 MB)</p>

      <div className="dropzone">
        <i className="ph-light ph-upload-simple"></i>
        <div className="dropzone-text">
          Drag and drop your files here<br />or{' '}
          <span onClick={handleBrowseClick} style={{ color: '#ff7043', cursor: 'pointer' }}>
            browse to upload
          </span>
        </div>
        <input
          type="file"
          id="resume-input"
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {fileName && <div id="selected-file-name" style={{ marginTop: '10px' }}>{fileName}</div>}
      </div>

      {loading && (
        <div style={{ marginTop: '20px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading...</p>
        </div>
      )}

      <div className="form-navigation">
        <button
          className="btn btn-primary mt-3 btncolor"
          onClick={handleContinue}
          disabled={loading}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ResumeUpload;
