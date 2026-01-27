import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useStepTracking } from "../hooks/useStepTracking";
import ResumeUpload from "../components/ResumeUpload";
import Stepper from "../../../shared/components/Stepper";
import AddressDetails from "../components/AddressDetails";
import EducationDetails from "../components/EducationDetails";
import ExperienceDetails from "../components/ExperienceDetails";
import CertificationDetails from "../components/CertificationDetails";
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
  const { updateStep } = useStepTracking();

  const steps = ["Upload Aadhar", "Upload Resume", "Basic Details", "Address", "Education", "Certification",  "Experience", "Document"];

  // Use server-provided user info from Redux to determine start step
  const serverData = useSelector((state) => state?.user?.user?.data); // matches other components
  const isProfileCompleted = serverData?.user?.isProfileCompleted === true;
  const computeInitialStep = () => {
  if (!serverData) return 0;

  const srvUser = serverData.user;
  console.log("srvUser", srvUser)

  // 🔒 Only for FIRST LOAD / EDIT PROFILE
  if (srvUser?.isProfileCompleted === true) {
    return steps.length - 1; // Document
  }

  const cs = Number(srvUser?.currentStep);
  if (!Number.isNaN(cs) && cs >= 1 && cs <= steps.length) {
    return cs - 1;
  }

  return 0;
};


  const [activeStep, setActiveStep] = useState(computeInitialStep);
const [isNavigating, setIsNavigating] = useState(false);
  // If server data changes after login, update active step accordingly
  useEffect(() => {
  if (!serverData) return;

  // 🚫 Do not override user navigation
  if (isNavigating) {
    setIsNavigating(false);
    return;
  }

  const next = computeInitialStep();
  setActiveStep(next);
}, [serverData]);

  useEffect(() => {
    if (activeStep === 1) {
      setResumeFile(null);
      setResumePublicUrl("");
    }
  }, [activeStep]);

  // const goNext = () => {
  //   const nextStep = Math.min(activeStep + 1, steps.length - 1);
  //   updateStep(nextStep);
  //   setActiveStep(nextStep);
  // };
  
  // const goBack = () => {
  //   const prevStep = Math.max(activeStep - 1, 0);
  //   updateStep(prevStep);
  //   setActiveStep(prevStep);
  // };

  const goNext = () => {
  setIsNavigating(true);

  const nextStep = Math.min(activeStep + 1, steps.length - 1);
  updateStep(nextStep + 1);
  setActiveStep(nextStep);
};

const goBack = () => {
  setIsNavigating(true);

  const prevStep = Math.max(activeStep - 1, 0);
  updateStep(prevStep + 1);
  setActiveStep(prevStep);
};


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
        return <CertificationDetails goNext={goNext} goBack={goBack} />;

      case 6:
        return <ExperienceDetails goNext={goNext} goBack={goBack} />;

      case 7:
        return <DocumentDetails goNext={goNext} goBack={goBack} setActiveTab={setActiveTab} />;

      default:
        return <h3>Coming Soon…</h3>;
    }
  };

  return (
    <div className="pb-3">
      <Stepper steps={steps} activeStep={activeStep} isProfileCompleted={isProfileCompleted}/>

      <div className="p-3" style={{ margin: '0 auto', width: '82%' }}>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default CandidateProfileStepper;
