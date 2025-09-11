import './App.css';
import CandidatePortal from './CandidatePortal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ForgotPassword from './components/ForgotPassword';
import '@fontsource/poppins'; // Defaults to weight 400
import '@fontsource/poppins/600.css'; // Specific weight
import Notifications from './components/Notifications';
import Home from './components/Tabs/Home';
import Tokenexp from './components/Tokenexp';
import PrivateRoute from './components/PrivateRoute';
import { useEffect } from 'react';

function App() {
  const location = useLocation(); // Get current path
  const chatbot = ['/careers-portal', '/forgot-password', '/register', '/login', '/'].includes(location.pathname);
  // console.log("location",chatbot)
    
  useEffect(() => {
    // Helper to remove Botpress iframe(s)
    const removeBotpressIframe = () => {
      const iframes = document.getElementsByClassName('bpFab');
      while (iframes.length > 0) {
        iframes[0].parentNode.removeChild(iframes[0]);
      }
    };
  
    const script1 = document.createElement('script');
    const script2 = document.createElement('script');
  
    if (!chatbot) {
      script1.src = 'https://cdn.botpress.cloud/webchat/v2.2/inject.js';
      script1.async = true;
      document.head.appendChild(script1);
  
      script2.src = 'https://files.bpcontent.cloud/2025/01/29/06/20250129063017-S8K7HVZH.js';
      script2.async = true;
      document.head.appendChild(script2);
  
      // Clean up scripts and widget when the component is unmounted or path changes
      return () => {
        if (document.head.contains(script1)) {
          document.head.removeChild(script1);
        }
        if (document.head.contains(script2)) {
          document.head.removeChild(script2);
        }
        removeBotpressIframe();
      };
    } else {
      // Remove the chatbot iframe immediately if not allowed
      removeBotpressIframe();
    }
  }, [chatbot]);

  return (
    // <Router>
      <div className="App">
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/careers-portal" replace />} />

          {/* Public routes (accessible without login) */}
          <Route path="/careers-portal" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* All other routes require auth */}
          <Route element={<PrivateRoute />}>
            <Route element={<Tokenexp />}>
              <Route path="/candidate-portal" element={<CandidatePortal />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Catch-all for non-allowed public routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    // </Router>
  );
}

export default App;
