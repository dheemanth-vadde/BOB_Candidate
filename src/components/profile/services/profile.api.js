import axios from "axios";
import { candidateApi } from "../../../services/apiService";

// Basic Details APIs
export const getBasicDetails = (candidateId) => {
  return candidateApi.get(`/profile/get-details/${candidateId}`);
};

export const postBasicDetails = (candidateId, payload) => {
  return candidateApi.post(`/profile/save-profile-details/${candidateId}`, payload);
};

// Address Details APIs
export const getAddressDetails = (candidateId) => {
  return candidateApi.get(`/address/get-address/${candidateId}`);
};

export const postAddressDetails = (candidateId, payload) => {
  return candidateApi.post(`/address/save-address/${candidateId}`, payload);
};

// Education Details APIs
export const getEducationDetails = (candidateId) => {
  return candidateApi.get(`/education/get-edu-details/${candidateId}`);
};

export const postEducationDetails = (
  candidateId,
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
    `/education/save-edu-details/${candidateId}/${docCode}`,
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
export const getExperienceDetails = (candidateId) => {
  return candidateApi.get(`/experience/get-exp-details/${candidateId}`);
};

// Experience Details APIs
export const postExperienceDetails = (
  candidateId,
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
    `/experience/save-exp-details/${candidateId}`,
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
export const getDocumentDetails = (candidateId) => {
  return candidateApi.get(`/documents/get-doc/${candidateId}`);
};

export const getDocumentDetailsByCode = (candidateId, docCode) => {
  return candidateApi.get(`/documents/get-doc-by-doccode/${candidateId}/${docCode}`);
};

// Document Upload API
export const postDocumentDetails = (
  candidateId,
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
  const Url = isOther ? `/documents/upload-other/${candidateId}/${documentName}` : `/documents/upload/${candidateId}/${documentId}`;
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

//Validate Document  API
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
export const deleteDocument = (candidateId, documentId) => {
  if (!candidateId || !documentId) {
    throw new Error("candidateId and documentId are required");
  }

  return candidateApi.delete(
    `/documents/delete-doc/${candidateId}/${documentId}`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Resume Upload API
export const parseResumeDetails = (candidateId, resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  return candidateApi.post(
    `/resume/upload/${candidateId}`,
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

export const getResumeDetails = (candidateId) => {
  return candidateApi.get(`/resume/get-resume-details/${candidateId}`);
};

// GET work status (isFresher)
export const getWorkStatus = (candidateId) => {
  return candidateApi.get(`/profile/get-work-status/${candidateId}`, {
    headers: {
      "X-Client": "candidate",
    },
  });
};

// POST work status (isFresher)
export const postWorkStatus = (candidateId, isFresher) => {
  return candidateApi.post(
    `/profile/save-work-status/${candidateId}`,
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
export const saveProfileComplete = (candidateId, isProfileCompleted = true) => {
  if (!candidateId) {
    throw new Error("candidateId is required");
  }

  return candidateApi.post(
    `/candidate/save-profile-complete/${candidateId}`,
    null,
    {
      params: { isProfileCompleted },
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};





// Export all
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
  getWorkStatus,
  postWorkStatus,
  ValidateDocument,
  saveProfileComplete
};
