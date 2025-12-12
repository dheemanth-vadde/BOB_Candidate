import { useState, useEffect } from "react";
import ResumeUpload from "./Tabs/ResumeUpload";
import ReviewDetails from "./Tabs/ReviewDetails";
import Stepper from "./Stepper";
import AddressDetails from "./Tabs/AddressDetails";
import EducationDetails from "./Tabs/EducationDetails";
import ExperienceDetails from "./Tabs/ExperienceDetails";
import DocumentDetails from "./Tabs/DocumentDetails";
import BasicDetails from "./Tabs/BasicDetails";

const CandidateProfileStepper = ({
  resumeFile,
  setResumeFile,
  resumePublicUrl,
  setResumePublicUrl,
  candidateData,
  setCandidateData,
  onSubmit
}) => {

  const steps = ["Upload Resume", "Basic Details", "Address", "Education", "Experience", "Document"];

  // Load existing step from localStorage
  const [activeStep, setActiveStep] = useState(() => {
    const saved = localStorage.getItem("activeStep");
    return saved ? parseInt(saved) : 0;
  });

  // Save whenever activeStep changes
  useEffect(() => {
    localStorage.setItem("activeStep", activeStep);
  }, [activeStep]);


  const goNext = () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <ResumeUpload
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            setParsedData={setCandidateData}
            resumePublicUrl={resumePublicUrl}
            setResumePublicUrl={setResumePublicUrl}
            goNext={goNext}
          />
        );

      case 1:
        return (
          <BasicDetails
            // initialData={candidateData}
            // resumePublicUrl={resumePublicUrl}
            // onSubmit={onSubmit}
            goNext={goNext}
            goBack={goBack}
          />
        );

      case 2:
        return <AddressDetails goNext={goNext} goBack={goBack} />;

      case 3:
        return <EducationDetails goNext={goNext} goBack={goBack} />;

      case 4:
        return <ExperienceDetails goNext={goNext} goBack={goBack} />;

      case 5:
        return <DocumentDetails goNext={goNext} goBack={goBack} />;

      default:
        return <h3>Coming Soon…</h3>;
    }
  };

  return (
    <div className="pb-3">
      <Stepper steps={steps} activeStep={activeStep} />

      <div className="p-3" style={{ margin: '0 auto', width: '75%' }}>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default CandidateProfileStepper;
