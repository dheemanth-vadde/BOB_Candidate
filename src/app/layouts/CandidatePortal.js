// CandidatePortal.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import ResumeUpload from '../../components/profile/components/ResumeUpload';
import MyDetailsForm from '../../components/Tabs/MyDetailsForm';
import ReviewDetails from '../../components/Tabs/ReviewDetails';
import RelevantJobs from '../../components/Tabs/RelevantJobs';
import AppliedJobs from '../../components/Tabs/AppliedJobs';
import Career from '../../components/Tabs/Career';
import './../../css/custom-bootstrap-overrides.css';
import { apiService } from '../../services/apiService';
import { useSelector } from 'react-redux';
import CandidateProfileStepper from '../../components/profile/pages/CandidateProfileStepper';
import { useLocation } from 'react-router-dom';

const CandidatePortal = () => {
  const user = useSelector((state) => state.user.user);
  const authUser = useSelector((state) => state.user.authUser);

  const [activeTab, setActiveTab] = useState('info'); 
  const [resumeFile, setResumeFile] = useState(null);
  const [ResumePublicUrl, setResumePublicUrl] = useState(null);
  const [candidateData, setCandidateData] = useState({});
  const [jobsList, setJobsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("disclaimerShown");
    if (location.state?.showDisclaimer && !alreadyShown) {
      setShowModal(true);
      // Set flag so refresh won't show it again
      sessionStorage.setItem("disclaimerShown", "true");
    }
  }, [location.state]);

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
          {showModal && (
            <div className="custom-modal-overlay">
              <div className="custom-modal" style={{ maxWidth: "650px", textAlign: "left", width: '650px' }}>

                <h4 style={{ textAlign: "center", color: "#F26A21", fontWeight: 600 }}>
                  Disclaimer
                </h4>

                <p style={{ marginTop: "15px", lineHeight: "1.6", fontSize: "0.95rem", color: "#555" }}>
                  I hereby declare that all information furnished in this application is true, correct, and 
                  complete to the best of my knowledge and belief. I understand that in the event any information 
                  or document provided by me is found to be false, incorrect, or misleading, my candidature may be 
                  rejected at any stage, and any appointment made may be terminated without notice. I agree to 
                  abide by all terms, conditions, and instructions issued by the Bank.
                </p>

                <p style={{ marginTop: "10px", lineHeight: "1.6", fontSize: "0.95rem", color: "#555" }}>
                  I confirm that all details, certificates, and documents submitted by me are genuine and have 
                  been provided voluntarily. I acknowledge that it is my responsibility to ensure accuracy and 
                  completeness of the information submitted. I understand that failure to meet eligibility 
                  criteria or submission of invalid documents may result in rejection of my application.
                </p>

                <p style={{ marginTop: "10px", lineHeight: "1.6", fontSize: "0.95rem", color: "#555" }}>
                  I authorize the Bank to verify my personal, academic, and employment details from the 
                  respective authorities, institutions, and employers.
                </p>

                {/* Checkbox Row */}
                <div style={{ display: "flex", alignItems: "center", marginTop: "20px", gap: "10px" }}>
                  <input 
                    type="checkbox" 
                    checked={agree}
                    onChange={() => setAgree(!agree)}
                    style={{ width: "18px", height: "18px", accentColor: "#F26A21", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                    I agree to all the above-mentioned disclaimers.
                  </span>
                </div>

                {/* OK Button */}
                <div style={{ textAlign: "center", marginTop: "25px" }}>
                  <button
                    disabled={!agree}
                    onClick={() => {
                      setShowModal(false);
                    }}
                    className="ok-btn"
                    style={{
                      backgroundColor: "#F26A21",
                      border: "none",
                      color: "white",
                      padding: "10px 30px",
                      borderRadius: "25px",
                      fontSize: "1rem",
                      cursor: "pointer",
                      opacity: agree ? 1 : 0.6
                    }}
                  >
                    OK
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatePortal;
