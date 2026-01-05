import axios from "axios";

//const BASE_URL = "http://192.168.20.111:8080/api";
const BASE_URL = 'https://dev.bobjava.sentrifugo.com:8443/dev-master-app/api'


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

export const getMasterData = () => {
  return api.get(`/v1/master/display/all`);
}

export const getChatFAQReply = (question) => {
  return api.get("/v1/master/chatbot/getChatFAQReply", {
    params: { question },
  });
};
export const getChatQueryReply = (question, candidateId) => {
  return api.get(`/v1/master/chatbot/getChatQueryReply`, {
    params: { question, candidateId }
  });
};


export const getDocumentTypes = () => {
  return api.get(`/v1/master/document-types/all`);
};

export const getGenericDocuments = () => {
  return api.get(
    "/v1/master/rec-generic-documents/unique-document-types"
  );
};

export default {
  getMasterData,
  getDocumentTypes,
  getChatFAQReply,
  getChatQueryReply,
  getGenericDocuments
};