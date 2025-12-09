import { useState } from "react";
import ResumeUpload from "./Tabs/ResumeUpload";
import ReviewDetails from "./Tabs/ReviewDetails";
import Stepper from "./Stepper";

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
  const [activeStep, setActiveStep] = useState(0);

  const goNext = () => setActiveStep(prev => prev + 1);
  const goBack = () => setActiveStep(prev => prev - 1);

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
          <ReviewDetails
            initialData={candidateData}
            resumePublicUrl={resumePublicUrl}
            onSubmit={onSubmit}
            goNext={goNext}
          />
        );

      default:
        return <h3>Coming Soon…</h3>;
    }
  };

  return (
    <div>
      <Stepper
        steps={steps}
        activeStep={activeStep}
        onStepChange={setActiveStep}
      />

      <div className="my-3 mx-4 p-3 border rounded bg-white">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default CandidateProfileStepper;
