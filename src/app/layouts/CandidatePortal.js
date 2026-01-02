// CandidatePortal.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import RelevantJobs from '../../components/jobs/pages/RelevantJobs';
import AppliedJobs from '../../components/jobs/pages/AppliedJobs';
// import Career from '../../components/Tabs/Career';
import './../../css/custom-bootstrap-overrides.css';
import { apiService } from '../../services/apiService';
import { useDispatch, useSelector } from 'react-redux';
import CandidateProfileStepper from '../../components/profile/pages/CandidateProfileStepper';
import { fetchDocumentTypes } from '../../components/profile/store/documentTypesSlice';
import disclaimerApi from '../services/disclaimer.api';

const CandidatePortal = () => {
  const user = useSelector((state) => state.user.user);
  const authUser = useSelector((state) => state.user.authUser);
  const candidateId = user?.data?.user?.id;
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(null); // null = loading
  const [showModal, setShowModal] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const [activeTab, setActiveTab] = useState('info');
  const [resumeFile, setResumeFile] = useState(null);
  const [ResumePublicUrl, setResumePublicUrl] = useState(null);
  const [candidateData, setCandidateData] = useState({});
  const [jobsList, setJobsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDocumentTypes());
  }, [dispatch]);

  useEffect(() => {
    if (!candidateId) return;

    const fetchDisclaimer = async () => {
      try {
        const res = await disclaimerApi.getDisclaimerStatus(candidateId);
        const accepted = res?.data.data === true;

        setDisclaimerAccepted(accepted);
        setShowModal(!accepted && disclaimerAccepted !== true);

      } catch (err) {
        console.error("Failed to fetch disclaimer status", err);
      }
    };

    fetchDisclaimer();
  }, [candidateId]);


  const handleFormSubmit = (updatedData) => {
    setCandidateData(updatedData);
  };

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!user?.candidate_id) return;
      const response = await apiService.getCandidateDetails(user.candidate_id);



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
  const handleDisclaimerAccept = async () => {
    try {
      const res = await disclaimerApi.saveDisclaimerStatus(candidateId, true);
      console.log("POST DISCLAIMER RESPONSE:", res);

      setDisclaimerAccepted(true);
      setShowModal(false);
      setCheckboxChecked(false);
    } catch (err) {
      console.error("Failed to save disclaimer", err);
    }
  };



  const renderTabContent = () => {
    switch (activeTab) {
      // case 'career':
      //   return <Career candidateData={candidateData} setActiveTab={setActiveTab} />;

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
            setActiveTab={setActiveTab}
          />
        );

      case 'jobs':
        return (
          <RelevantJobs
            candidateData={candidateData}
            jobsList={jobsList}
            setJobsList={setJobsList}
            setActiveTab={setActiveTab}
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
          {disclaimerAccepted === true && renderTabContent()}
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
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#F26A21", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                    I agree to all the above-mentioned disclaimers.
                  </span>
                </div>

                {/* OK Button */}
                <div style={{ textAlign: "center", marginTop: "25px" }}>
                  <button
                    disabled={!checkboxChecked}
                    onClick={handleDisclaimerAccept}
                    className="ok-btn"
                    style={{
                      backgroundColor: "#F26A21",
                      border: "none",
                      color: "white",
                      padding: "10px 30px",
                      borderRadius: "25px",
                      fontSize: "1rem",
                      cursor: "pointer",
                      opacity: checkboxChecked ? 1 : 0.6
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
