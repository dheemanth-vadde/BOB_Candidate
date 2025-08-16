// CandidatePortal.js
import React, { useState } from 'react';
import Header from './components/Header';
import ResumeUpload from './components/Tabs/ResumeUpload';
import MyDetailsForm from './components/Tabs/MyDetailsForm';
import ReviewDetails from './components/Tabs/ReviewDetails';
import RelevantJobs from './components/Tabs/RelevantJobs';
import './custom-bootstrap-overrides.css';

const CandidatePortal = () => {
  // Centralized state
  const [activeTab, setActiveTab] = useState('resume');
  const [resumeFile, setResumeFile] = useState(null);
  const [candidateData, setCandidateData] = useState({});
  const [jobsList, setJobsList] = useState([]);

// Handle form submission from ReviewDetails
const handleFormSubmit = (updatedData) => {
  setCandidateData(updatedData);
  setActiveTab('details'); // Move to MyDetails tab after submission
};
  const renderTabContent = () => {
    switch (activeTab) {
      case 'resume':
        return (
          <ResumeUpload
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            setParsedData={setCandidateData}
            goNext={() => setActiveTab('info')}
          />
        );

      case 'info':
        return (
          <ReviewDetails
          initialData={candidateData}
          onSubmit={handleFormSubmit}
        />
        );

      case 'details':
        return (
          <MyDetailsForm
            data={candidateData}     
          />
        );

      case 'jobs':
        return (
          <RelevantJobs
            candidateData={candidateData}
            jobsList={jobsList}
            setJobsList={setJobsList}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Header />
      <div className="d-flex">
        <div className="flex-grow-1 m-4">
          {/* Tabs */}
          <ul className="nav nav-tabs navbarupload justify-content-start">
            <li className="nav-item">
              <button
                className={`nav-link bornav ${activeTab === 'resume' ? 'active' : ''}`}
                onClick={() => setActiveTab('resume')}
              >
                Upload Resume
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link bornav ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Review Details
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link bornav ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                My Details
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link bornav ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                Relevant Jobs
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content mt-3">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePortal;
