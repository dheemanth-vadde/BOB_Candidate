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
import Tokenexp from './components/Tokenexp';
import PrivateRoute from './components/PrivateRoute';

function App() {
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
