// CandidatePortal.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ResumeUpload from './components/Tabs/ResumeUpload';
import MyDetailsForm from './components/Tabs/MyDetailsForm';
import ReviewDetails from './components/Tabs/ReviewDetails';
import RelevantJobs from './components/Tabs/RelevantJobs';
import './custom-bootstrap-overrides.css';
import {apiService} from './services/apiService';
import { useSelector } from 'react-redux';
const CandidatePortal = () => {
  const user = useSelector((state) => state.user.user);
  const authUser = useSelector((state) => state.user.authUser);
  console.log("User from Redux:", user);
  console.log("Auth User from Redux:", authUser);
  const [activeTab, setActiveTab] = useState('resume');
  const [resumeFile, setResumeFile] = useState(null);
  const [ResumePublicUrl, setResumePublicUrl] = useState(null);
  const [candidateData, setCandidateData] = useState({});
  const [jobsList, setJobsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

// Handle form submission from ReviewDetails
const handleFormSubmit = (updatedData) => {
  setCandidateData(updatedData);
  //setActiveTab('details'); // Move to MyDetails tab after submission
};
useEffect(() => {
  const fetchCandidateData = async () => {
    if (!user?.candidate_id) return; // Add a guard clause
    const candidateId = user?.candidate_id;
    try {
      const response = await apiService.getCandidateDetails(candidateId);
      if (response.success && response.data) {
        const data = response.data;
        console.log("Candidate Data:", data);
        if (data) {
          // Map API response to your form fields
          setCandidateData({
            name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            gender: data.gender || 'Male',
            id_proof: data.id_proof || '',
            dob: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
            nationality_id: data.nationality_id || '',
            special_category_id: data.special_category_id || '',
            reservation_category_id: data.reservation_category_id || '',
            education_qualification: data.education_qualification || '',
            totalExperience: data.total_experience || 0,
            currentDesignation: data.current_designation || '',
            currentEmployer: data.current_employer || '',
            address: data.address || '',
            skills: data.skills || ''
          });
          
          // Set resume URL if exists
          if (data.file_url) {
            setResumePublicUrl(data.file_url);
            // You might want to set a flag to show resume is already uploaded
          }
        }
      }
    } catch (error) {
      console.error('Error fetching candidate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchCandidateData();
}, [user?.candidate_id]);
  const renderTabContent = () => {
    switch (activeTab) {
      case 'resume':
        return (
          <ResumeUpload
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            setParsedData={setCandidateData}
            setResumePublicUrl={setResumePublicUrl}
            resumePublicUrl={ResumePublicUrl} 
            goNext={() => setActiveTab('info')}
          />
        );

      case 'info':
        return (
          <ReviewDetails
          initialData={candidateData}
          resumePublicUrl={ResumePublicUrl}
           onSubmit={handleFormSubmit}
        />
        );

      // case 'details':
      //   return (
      //     <MyDetailsForm
      //       data={candidateData}     
      //     />
      //   );

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
            {/* <li className="nav-item">
              <button
                className={`nav-link bornav ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                My Details
              </button>
            </li> */}
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
