import './App.css';
import CandidatePortal from './CandidatePortal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ForgotPassword from './components/ForgotPassword';
import '@fontsource/poppins'; // Defaults to weight 400
import '@fontsource/poppins/600.css'; // Specific weight
import Notifications from './components/Notifications';
import Home from './components/Tabs/Home';

function App() {
  return (
    // <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/careers-portal" replace />} />

          <Route path="/candidate-portal" element={<CandidatePortal />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/careers-portal" element={<Home />} />
          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    // </Router>
  );
}

export default App;
