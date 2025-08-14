import './App.css';
import CandidatePortal from './CandidatePortal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
    // <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/candidate-portal" element={<CandidatePortal />} />
          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    // </Router>
  );
}

export default App;
