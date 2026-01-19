
import CandidatePortal from './layouts/CandidatePortal';
import 'bootstrap/dist/css/bootstrap.min.css';

import '../App.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from '../components/auth/pages/Login';
import Register from '../components/auth/pages/Register';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ForgotPassword from '../components/auth/pages/ForgotPassword';
import '@fontsource/poppins'; // Defaults to weight 400 regular
import '@fontsource/poppins/600.css'; // Specific weight Semi-Bold


import "@fontsource/poppins/300.css"; //Light
import "@fontsource/poppins/500.css"; // Medium
import "@fontsource/poppins/700.css"; //Bold
 
import Notifications from '../components/others/Notifications';
// import Home from '../components/Tabs/Home';
import Tokenexp from '../components/auth/pages/Tokenexp';
import PrivateRoute from '../components/auth/pages/PrivateRoute';
import { useEffect, useState } from 'react';
import CustomChatbot from '../components/integrations/chatbot/CustomChatbot';
import DigiLockerCallback from '../components/integrations/digilocker/DigiLocker';
import OtpVerification from '../components/auth/pages/OtpVerification';
import ChangePasswordVerification from '../components/auth/pages/ChangePasswordVerification';
import ChangePassword from '../components/auth/pages/ChangePassword';
import Oppurtunities from '../components/jobs/pages/Oppurtunities';
function App() {
  const location = useLocation(); // Get current path
  // Only show chat on specific routes
  const showChat = !['/careers-portal', '/forgot-password', '/register', '/login', '/', '/otp-verification', '/change-password-verification', '/change-password'].includes(location.pathname);
  const [chatOpen, setChatOpen] = useState(false);

  // Handle chat toggle
  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    // <Router>
      <div className="App">
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/candidate-portal" replace />} />

          {/* Public routes (accessible without login) */}
          {/* <Route path="/careers-portal" element={<Home />} /> */}
          <Route path='/current-oppurtunities' element={<Oppurtunities />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/change-password-verification" element={<ChangePasswordVerification />} />
          <Route path='/change-password' element={<ChangePassword />} />

          {/* All other routes require auth */}
          <Route element={<PrivateRoute />}>
            <Route element={<Tokenexp />}>
              <Route path="/candidate-portal" element={<CandidatePortal />} />
              <Route path="/candidate-portal/:requisitionId" element={<CandidatePortal />} />
              <Route path="/candidate-portal/:requisitionId/:positionId" element={<CandidatePortal />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/digilocker/callback" element={<DigiLockerCallback />} />
            </Route>
          </Route>

          {/* Catch-all for non-allowed public routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
        {showChat && <CustomChatbot isOpen={chatOpen} onToggle={toggleChat} />}
      </div>
    // </Router>
  );
}

export default App;
