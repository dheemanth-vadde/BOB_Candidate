import axios from 'axios';
import { applyInterceptors } from './interceptor';

 const JOBS_BASE_URL='https://bobjava.sentrifugo.com:8443/dev-candidate-app/api/v1/candidate'
// const RAZOR_BASE_URL='https://bobjava.sentrifugo.com:8443/dev-candidate-app/api/v1/razorpay'
// const MASTER_BASE_URLs='https://bobjava.sentrifugo.com:8443/dev-master-app/api/v1/master'


//const JOBS_BASE_URL='http://192.168.20.115:8082/api/v1/candidate';
const RAZOR_BASE_URL='https://bobjava.sentrifugo.com:8443/dev-candidate-app/api/v1/razorpay';
const MASTER_BASE_URLs='https://bobjava.sentrifugo.com:8443/dev-master-app/api/v1/master';

const jobsapi = axios.create({
  baseURL: JOBS_BASE_URL,
  headers: {
      "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
});

const razorpayapi = axios.create({
  baseURL: RAZOR_BASE_URL,
  headers: {
      "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
});

const mastersapi = axios.create({
  baseURL: MASTER_BASE_URLs,
  headers: {
      "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
});


// Attach interceptors to all instances

applyInterceptors(jobsapi);
applyInterceptors(razorpayapi);
applyInterceptors(mastersapi);

export const apiService = {
  

};
export {
  jobsapi,
  razorpayapi,
  mastersapi,
};


export default apiService;
