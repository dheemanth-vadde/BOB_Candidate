// CandidatePortal.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ResumeUpload from './components/Tabs/ResumeUpload';
import MyDetailsForm from './components/Tabs/MyDetailsForm';
import ReviewDetails from './components/Tabs/ReviewDetails';
import RelevantJobs from './components/Tabs/RelevantJobs';
import AppliedJobs from './components/Tabs/AppliedJobs';
import Career from './components/Tabs/Career';
import './custom-bootstrap-overrides.css';
import { apiService } from './services/apiService';
import { useSelector } from 'react-redux';
import CandidateProfileStepper from './components/CandidateProfileStepper';

const CandidatePortal = () => {
  const user = useSelector((state) => state.user.user);
  const authUser = useSelector((state) => state.user.authUser);

  const [activeTab, setActiveTab] = useState('info'); 
  const [resumeFile, setResumeFile] = useState(null);
  const [ResumePublicUrl, setResumePublicUrl] = useState(null);
  const [candidateData, setCandidateData] = useState({});
  const [jobsList, setJobsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleFormSubmit = (updatedData) => {
    setCandidateData(updatedData);
  };

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!user?.candidate_id) return;

      try {
        const response = await apiService.getCandidateDetails(user.candidate_id);

        if (response.success && response.data) {
          const data = response.data;

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
            skills: data.skills || '',
            document_url: data.documentUrl || '',
            is_dob_validated: data.is_dob_validated || ''
          });

          if (data.file_url) setResumePublicUrl(data.file_url);
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
      case 'career':
        return <Career candidateData={candidateData} setActiveTab={setActiveTab} />;

      // case 'resume':
      //   return (
      //     <ResumeUpload
      //       resumeFile={resumeFile}
      //       setResumeFile={setResumeFile}
      //       setParsedData={setCandidateData}
      //       resumePublicUrl={ResumePublicUrl}
      //       setResumePublicUrl={setResumePublicUrl}
      //       goNext={() => setActiveTab('info')}
      //     />
      //   );

      case 'info':
        return (
          // <ReviewDetails
          //   initialData={candidateData}
          //   resumePublicUrl={ResumePublicUrl}
          //   onSubmit={handleFormSubmit}
          //   goNext={() => setActiveTab('jobs')}
          // />
          <CandidateProfileStepper
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            resumePublicUrl={ResumePublicUrl}
            setResumePublicUrl={setResumePublicUrl}
            candidateData={candidateData}
            setCandidateData={setCandidateData}
            onSubmit={handleFormSubmit}
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

      case 'applied-jobs':
        return <AppliedJobs candidateData={candidateData} />;

      default:
        return null;
    }
  };

  return (
    <div>
      {/* 👇 Pass activeTab + setActiveTab into Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="">
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CandidatePortal;
