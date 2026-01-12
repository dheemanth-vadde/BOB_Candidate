// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../../css/Login.css";
import pana from "../../../assets/pana.png";
import BobLogo from "../../../assets/bob-logo1.jpg";
import { useDispatch } from 'react-redux';
// import { setUser, setAuthUser } from '../../store/userSlice';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CryptoJS, { enc } from "crypto-js";
import JSEncrypt from "jsencrypt";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";

const Login = () => {
  const [publicKey, setPublicKey] = useState("");
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unverifiedUserId, setUnverifiedUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/public_key.pem")
      .then(res => res.text())
      .then(key => setPublicKey(key))
      .catch(err => console.error("Failed to load public key:", err));
  }, []);

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(); // hex string
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFormErrors(prev => ({ ...prev, email: "" }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFormErrors(prev => ({ ...prev, password: "" }));
  };

  const encryptCredentials = (email, password, publicKey) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);

    const data = `${email}|${password}`;
    const encrypted = encrypt.encrypt(data);

    return encrypted; // base64 encrypted string
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter valid email";
    }
    if (!password.trim()) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!publicKey) {
      toast.error("Public key not loaded yet!");
      return;
    }

    setLoading(true);
    const hashedPassword = hashPassword(password);
    const encryptedCredentials = encryptCredentials(email, hashedPassword, publicKey);

    try {
      // Step 1: Login API
      const res = await authApi.login(encryptedCredentials);
      console.log("Login Success:", res.data);
      toast.success("An OTP has been sent to your registered email.");
      navigate("/otp-verification", {
        state: {
          email: email  // send email for OTP validation
        },
        replace: true
      });

    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={pana} alt="Illustration" />
      </div>

      <div className="right-panel">
        <div className="logo">
          <img src={BobLogo} alt="Logo" />
          <h5 className="mt-1">Welcome to Candidate Login</h5>
        </div>

        <form className="login_form" onSubmit={handleLogin} noValidate>
          <label>Email Id <span className="text-danger">*</span></label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`form-control text-muted ${formErrors.email ? 'is-invalid' : 'mb-4'}`}
            placeholder="Enter email"
          />
          {formErrors.email && <div className="invalid-feedback mb-4">{formErrors.email}</div>}

          <label>Password <span className="text-danger">*</span></label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              className={`form-control text-muted ${formErrors.password ? 'is-invalid' : ''}`}
              placeholder="Enter password"
              style={{ paddingRight: '40px', marginBottom: '0.25rem' }}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: formErrors.password ? '30px' : '15px',
                top: '49%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#666',
              }}
              size="sm"
              title={showPassword ? 'Hide password' : 'Show password'}
            />
          </div>
          {formErrors.password && <div className="invalid-feedback d-block">{formErrors.password}</div>}

          <p className="forgot-link mb-4">
            <Link className="" to="/forgot-password" replace>Forgot Password?</Link>
          </p>

          {unverifiedUserId && (
            <button
              className="resend-btn my-2 mb-3"
              style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #ff6b00", padding: '4px 12px', color: "#ff6b00" }}
              onClick={async () => {
                try {
                  await authApi.resendVerification(unverifiedUserId);
                  toast.error("Verification email sent. Please check your inbox.");
                } catch (err) {
                  toast.error("Failed to resend verification email.");
                }
              }}
            >
              Resend Verification Email
            </button>
          )}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="register-link">
            New User? <Link to="/register" replace>Register Here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
