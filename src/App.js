import './App.css';
import CandidatePortal from './CandidatePortal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ForgotPassword from './components/auth/ForgotPassword';
import '@fontsource/poppins'; // Defaults to weight 400
import '@fontsource/poppins/600.css'; // Specific weight
import Notifications from './components/others/Notifications';
import Home from './components/Tabs/Home';
import Tokenexp from './components/auth/Tokenexp';
import PrivateRoute from './components/auth/PrivateRoute';
import { useEffect, useState } from 'react';
import CustomChatbot from './components/others/CustomChatbot';
import DigiLockerCallback from './components/others/DigiLocker';
import OtpVerification from './components/auth/OtpVerification';
import ChangePasswordVerification from './components/auth/ChangePasswordVerification';
import ChangePassword from './components/auth/ChangePassword';

function App() {
  const location = useLocation(); // Get current path
  // Only show chat on specific routes
  const showChat = !['/careers-portal', '/forgot-password', '/register', '/login', '/'].includes(location.pathname);
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
