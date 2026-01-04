import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ResumeUpload from "../components/ResumeUpload";
import Stepper from "../../../shared/components/Stepper";
import AddressDetails from "../components/AddressDetails";
import EducationDetails from "../components/EducationDetails";
import ExperienceDetails from "../components/ExperienceDetails";
import DocumentDetails from "../components/DocumentDetails";
import BasicDetails from "../components/BasicDetails";
import UploadIdProof from "../components/UploadIdProof";

const CandidateProfileStepper = ({
  resumeFile,
  setResumeFile,
  resumePublicUrl,
  setResumePublicUrl,
  candidateData,
  setCandidateData,
  onSubmit,
  setActiveTab
}) => {

  const steps = ["Upload Aadhar", "Upload Resume", "Basic Details", "Address", "Education", "Experience", "Document"];

  // Use server-provided user info from Redux to determine start step
  const serverData = useSelector((state) => state?.user?.user?.data); // matches other components
  const computeInitialStep = () => {
    if (!serverData) return 0;
    const srvUser = serverData?.user;
    if (srvUser?.isProfileCompleted) return 2; // Basic Details index
    const cs = parseInt(srvUser?.currentStep, 10);
    if (!isNaN(cs) && cs >= 1 && cs <= steps.length) return cs - 1;
    return 0;
  };

  const [activeStep, setActiveStep] = useState(computeInitialStep);

  // If server data changes after login, update active step accordingly
  useEffect(() => {
    if (!serverData) return;
    const next = computeInitialStep();
    setActiveStep(next);
  }, [serverData]);

  useEffect(() => {
    if (activeStep === 1) {
      setResumeFile(null);
      setResumePublicUrl("");
    }
  }, [activeStep]);

  const goNext = () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <UploadIdProof
            goNext={goNext}
          />
        );

      case 1:
        return (
          <ResumeUpload
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            setParsedData={setCandidateData}
            resumePublicUrl={resumePublicUrl}
            setResumePublicUrl={setResumePublicUrl}
            goNext={goNext}
            goBack={goBack}
          />
        );

      case 2:
        return (
          <BasicDetails
            // initialData={candidateData}
            // resumePublicUrl={resumePublicUrl}
            // onSubmit={onSubmit}
            goNext={goNext}
            goBack={goBack}
            parsedData={candidateData}
          />
        );

      case 3:
        return <AddressDetails goNext={goNext} goBack={goBack} />;

      case 4:
        return <EducationDetails goNext={goNext} goBack={goBack} />;

      case 5:
        return <ExperienceDetails goNext={goNext} goBack={goBack} />;

      case 6:
        return <DocumentDetails goNext={goNext} goBack={goBack} setActiveTab={setActiveTab} />;

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
