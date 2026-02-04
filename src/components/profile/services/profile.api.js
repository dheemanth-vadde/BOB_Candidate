import axios from "axios";
import { candidateApi } from "../../../services/apiService";

// Basic Details APIs
export const getBasicDetails = () => {
  return candidateApi.get(`/profile/get-details`);
};

export const postBasicDetails = (payload) => {
  return candidateApi.post(`/profile/save-profile-details`, payload);
};

// Address Details APIs
export const getAddressDetails = () => {
  return candidateApi.get(`/address/get-address`);
};

export const postAddressDetails = (payload) => {
  return candidateApi.post(`/address/save-address`, payload);
};

// Education Details APIs
export const getEducationDetails = () => {
  return candidateApi.get(`/education/get-edu-details`);
};

export const postEducationDetails = (
  educationPayload,
  file,
  docCode
) => {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  formData.append(
    "education",
    new Blob([JSON.stringify(educationPayload)], {
      type: "application/json",
    })
  );

  return candidateApi.post(
    `/education/save-edu-details/${docCode}`,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Experience Details APIs
export const getExperienceDetails = () => {
  return candidateApi.get(`/experience/get-exp-details`);
};

export const postExperienceDetails = (
  // candidateId,
  workExperiencePayload,
  file
) => {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  formData.append(
    "workExperience",
    new Blob([JSON.stringify(workExperiencePayload)], {
      type: "application/json",
    })
  );

  return candidateApi.post(
    `/experience/save-exp-details`,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteExperienceDetails = (workExperienceId) => {
  return candidateApi.delete(
    `/experience/delete-exp/${workExperienceId}`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Document Details APIs
export const getDocumentDetails = () => {
  return candidateApi.get(`/documents/get-doc`);
};

export const getDocumentDetailsByCode = (docCode) => {
  return candidateApi.get(`/documents/get-doc-by-doccode/${docCode}`);
};

// Document Upload API
export const postDocumentDetails = (
  // candidateId,
  documentId,
  file,
  isOther,
  documentName
) => {
  if (!file) {
    throw new Error("Document file is required");
  }
  if (isOther && !documentName) {
    throw new Error("Document Name is required");
  }

  const formData = new FormData();
  formData.append("documents", file); // key name MUST match backend
  const Url = isOther ? `/documents/upload-other/${documentName}` : `/documents/upload/${documentId}`;
  return candidateApi.post(
    Url,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Validate Document API
export const ValidateDocument = (
  documentName,
  file
) => {
  if (!file) {
    throw new Error("Document file is required");
  }
  if (!documentName) {
    throw new Error("Document Name is required");
  }

  const formData = new FormData();
  formData.append("file", file); // key name MUST match backend
  const Url = `/validate-document/validate/${documentName}`;
  return candidateApi.post(
    Url,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Document Delete API
export const deleteDocument = (documentId) => {
  if (!documentId) {
    throw new Error("documentId is required");
  }

  return candidateApi.delete(
    `/documents/delete-doc/${documentId}`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Resume Upload API
export const parseResumeDetails = (resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  return candidateApi.post(
    `/resume/upload`,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data"
        // DO NOT set Content-Type
      },
    }
  );
};

export const getResumeDetails = () => {
  return candidateApi.get(`/resume/get-resume-details`);
};

// Save All Experience Details from Resume
export const saveAllExperienceDetails = (experiencePayload) => {
  return candidateApi.post(
    `/experience/save-all-exp-details`,
    experiencePayload,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// GET work status (isFresher)
export const getWorkStatus = () => {
  return candidateApi.get(`/profile/get-work-status`, {
    headers: {
      "X-Client": "candidate",
    },
  });
};

// POST work status (isFresher)
export const postWorkStatus = (isFresher) => {
  return candidateApi.post(
    `/profile/save-work-status`,
    null,
    {
      params: { isFresher: isFresher }, // ⚠️ backend expects QUERY param
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Profile Complete API
export const saveProfileComplete = (isProfileCompleted = true) => {
  return candidateApi.post(
    `/candidate/save-profile-complete`,
    null,
    {
      params: { isProfileCompleted },
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Certification APIs
export const getHasCertification = () => {
  return candidateApi.get(
    `/certifications/get-has-cert`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Save hasCertification flag
export const saveHasCertification = (hasCertification) => {
  return candidateApi.post(
    `/certifications/save-has-cert`,
    null,
    {
      params: { hasCertification },
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

export const saveCertification = (
  // candidateId,
  certificationPayload,
  file
) => {
  const formData = new FormData();

  // file part (same as experience)
  if (file) {
    formData.append("file", file);
  }

  // DTO part (same pattern as workExperience)
  formData.append(
    "certificationsDTO",
    new Blob([JSON.stringify(certificationPayload)], {
      type: "application/json",
    })
  );

  return candidateApi.post(
    `/certifications/save-cert-details`,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Get certification details
export const getCertifications = () => {
  return candidateApi.get(
    `/certifications/get-cert-details`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Delete certification
export const deleteCertification = (certificationId) => {
  if (!certificationId) {
    throw new Error("certificationId is required");
  }

  return candidateApi.delete(
    `/certifications/delete-cert-details/${certificationId}`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

export default {
  getBasicDetails,
  postBasicDetails,
  getAddressDetails,
  postAddressDetails,
  getEducationDetails,
  postEducationDetails,
  getExperienceDetails,
  postExperienceDetails,
  deleteExperienceDetails,
  getDocumentDetails,
  getDocumentDetailsByCode,
  postDocumentDetails,
  deleteDocument,
  parseResumeDetails,
  getResumeDetails,
  saveAllExperienceDetails,
  getWorkStatus,
  postWorkStatus,
  ValidateDocument,
  saveProfileComplete,
  getHasCertification,
  saveHasCertification,
  saveCertification,
  getCertifications,
  deleteCertification
};
