// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/Login.css";
import pana from "../assets/pana.png";
import boblogo from "../assets/bob-logo.png";
import BobLogo from "../assets/bob-logo1.jpg";
import { useDispatch } from 'react-redux';
import { setUser, setAuthUser } from '../store/userSlice';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";

const Login = () => {
  const SECRET_KEY = "fdf4-832b-b4fd-ccfb9258a6b3";
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unverifiedUserId, setUnverifiedUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Login API
      const res = await axios.post(
        "https://bobjava.sentrifugo.com:8443/dev-auth-app/api/v1/candidate-auth/candidate-login",
        {
          username: email,
          password: password,
        }
      );

      const token = res.data?.access_token;

      // (401 Fix) → If no token, do not call next API
      if (!token) {
        alert("Login failed: No token returned");
        return;
      }

      // Step 2: Fetch Details API (REQUIRES BEARER TOKEN)
      const dbRes = await axios.post(
        "https://bobjava.sentrifugo.com:8443/dev-auth-app/api/v1/getdetails/candidates",
        null, // no body
        {
          params: { email },
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      // Step 3: MFA Logic
      if (res.data.mfa_required) {
        dispatch(setAuthUser({ mfaToken: res.data.mfa_token, mfaRequired: true }));
        alert("MFA required. Please verify your Mail.");
        navigate("/verify-otp");
        return;
      }

      // Step 4: Save Details in Redux
      dispatch(setAuthUser(res.data));
      dispatch(setUser(dbRes.data));

      // Step 5: Navigate
      navigate("/candidate-portal");

    } catch (err) {
      const errorData = err.response?.data;

      if (
        errorData?.error ===
        "Email not verified. Please verify your email before login."
      ) {
        alert("Email not verified. Click below to resend verification email.");
        setUnverifiedUserId(errorData.user_id);
      } else {
        alert(errorData?.error_description || "Login failed");
      }
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
          <h4>Candidate Login</h4>
        </div>

        <form className="login_form" onSubmit={handleLogin}>
          <label>Email Id:</label>
          <input
            type="email"
            value={email}
            required
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password:</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              required
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: '40px' }}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '35%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#666',
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
            />
          </div>

          {unverifiedUserId && (
            <button
              className="resend-btn my-2 mb-3"
              style={{ borderRadius: "20px", backgroundColor: "#fff", border: "1px solid #ff6b00", padding: '4px 12px', color: "#ff6b00" }}
              onClick={async () => {
                try {
                  await axios.post(
                    "https://bobjava.sentrifugo.com:8443/dev-auth-app/api/v1/candidate-auth/candidate-resend-verification",
                    { user_id: unverifiedUserId }
                  );
                  alert("Verification email sent. Please check your inbox.");
                } catch (err) {
                  alert("Failed to resend verification email.");
                }
              }}
            >
              Resend Verification Email
            </button>
          )}

          <button className="login-button" type="submit">
            LOGIN
          </button>

          <p className="register-link">
            Forgot Password? <Link to="/forgot-password">Click here</Link>
          </p>

          <p className="register-link">
            New User? <Link to="/register">Register Here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
