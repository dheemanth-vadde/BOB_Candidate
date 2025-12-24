import axios from "axios";

const BASE_URL = "http://192.168.20.111:8082/api/v1/candidate";

// Axios Instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Client": "candidate",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ---------------- PROFILE APIs ----------------

// Basic Details APIs
export const getBasicDetails = (candidateId) => {
  return api.get(`/profile/get-details/${candidateId}`);
};

export const postBasicDetails = (candidateId, payload) => {
  return api.post(`/profile/save-profile-details/${candidateId}`, payload);
};

// Address Details APIs
export const getAddressDetails = (candidateId) => {
  return api.get(`/address/get-address/${candidateId}`);
};

export const postAddressDetails = (candidateId, payload) => {
  return api.post(`/address/save-address/${candidateId}`, payload);
};

// Education Details APIs
export const getEducationDetails = (candidateId) => {
  return api.get(`/education/get-edu-details/${candidateId}`);
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

  return api.post(
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
  return api.get(`/experience/get-exp-details/${candidateId}`);
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

  return api.post(
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
  return api.delete(
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
  return api.get(`/documents/get-doc/${candidateId}`);
};

export const getDocumentDetailsByCode = (candidateId, docCode) => {
  return api.get(`/documents/get-doc-by-doccode/${candidateId}/${docCode}`);
};

// Document Upload API
export const postDocumentDetails = (
  candidateId,
  documentId,
  file
) => {
  if (!file) {
    throw new Error("Document file is required");
  }

  const formData = new FormData();
  formData.append("documents", file); // key name MUST match backend

  return api.post(
    `/documents/upload/${candidateId}/${documentId}`,
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

  return api.delete(
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

  return api.post(
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
  return api.get(`/resume/get-resume-details/${candidateId}`);
};

// GET work status (isFresher)
export const getWorkStatus = (candidateId) => {
  return api.get(`/profile/get-work-status/${candidateId}`, {
    headers: {
      "X-Client": "candidate",
    },
  });
};

// POST work status (isFresher)
export const postWorkStatus = (candidateId, isFresher) => {
  return api.post(
    `/profile/save-work-status/${candidateId}`,
    null,
    {
      params: { isFresher }, // ⚠️ backend expects QUERY param
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
  postWorkStatus
};
