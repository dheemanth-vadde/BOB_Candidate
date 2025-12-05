// components/Tabs/ResumeUpload.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import '../../css/Resumeupload.css';
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-content-section text-center">
    <h2>Upload Resume</h2>
    <p className="subtext">Resume/CV* (Supported format: .docx/.pdf; Max size: 4.5 MB)</p>

    {/* Show existing resume if available */}
    {resumePublicUrl && (
      <div className="existing-resume mb-4">
        <p>You have already uploaded a resume:</p>
        <a 
          href={resumePublicUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-link"
        >
          <i className="ph-light ph-file-text me-2"></i><b>View Current Resume</b>
        </a>
      </div>
    )}

    {/* Keep the existing upload UI as is */}
    <div className="dropzone" onClick={handleBrowseClick}>
      <i className="ph-light ph-upload-simple"></i>
      <div className="dropzone-text">
        {resumePublicUrl ? (
          <>
            Click here to upload your resume or{' '}
            <span style={{ color: '#ff7043', cursor: 'pointer' }}>
              browse to upload
            </span>
          </>
        ) : (
          <>
            Click here to Upload your files here or{' '}
            <span style={{ color: '#ff7043', cursor: 'pointer' }}>
              browse to upload
            </span>
          </>
        )}
      </div>
      <input
        type="file"
        id="resume-input"
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
     
    </div>
 {fileName && <div className="mt-2 filename">{fileName}</div>}
    <div className="mt-4">
      <button
        className="btn btn-primary"
        style={{
          backgroundColor: '#ff7043',
          border: 'none',
          padding: '8px 24px',
          borderRadius: '4px',
          color:"#fff"
        }}
        onClick={handleContinue}
        disabled={!resumeFile && !resumePublicUrl}
      >
        {loading ? 'Processing...' : 'Continue'}
      </button>
    </div>
  </div>
  );
};

export default ResumeUpload;
