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
      // const encryptedPassword = encryptPassword(password);

      const res = await axios.post("https://bobjava.sentrifugo.com:8443/dev-auth-app/api/v1/candidate-auth/candidate-login", {
        // const res = await axios.post("http://localhost:5000/api/auth/candidate-login", {
        username: email,
        password: password,

      });

      const dbRes = await axios.post("https://bobjava.sentrifugo.com:8443/dev-auth-app/api/v1/getdetails/candidates",
        null,   // no request body
        {
          params: { email }
        }
      );


      if (res.data.mfa_required) {
        // localStorage.setItem("mfa_token", res.data.mfa_token);
        dispatch(setAuthUser({ mfaToken: res.mfa_token, mfaRequired: true }));
        alert("MFA required. Please verify your Mail.");
        navigate("/verify-otp"); // ⬅️ You must build this page to complete OTP
      } else {
        // const token = res.data.access_token;
        // localStorage.setItem("access_token", token);
        dispatch(setAuthUser(res.data));
        dispatch(setUser(dbRes.data));
        navigate("/candidate-portal");
        setAuthUser(res.data);
        setUser(dbRes.data); // Store user details from DB in context
        // console.log("User details:", dbRes.data);

        // // 🔍 Decode token to get roles
        // const decoded = jwtDecode(token);
        // const roles = decoded["https://your-app.com/claims/roles"] || []; // Change namespace if different

        // if (roles.includes("user")) {
        //   navigate("/dashboard");
        // } else {
        //   alert("You are not authorized to access this app.");
        //   localStorage.removeItem("access_token");
        // }
      }
    } catch (err) {
      const errorData = err.response?.data;

      if (
        errorData?.error ===
        "Email not verified. Please verify your email before login."
      ) {
        alert("Email not verified. Click below to resend verification email.");
        setUnverifiedUserId(errorData.user_id); // Send user_id from backend
      } else {
        alert(errorData?.error_description || "Login failed");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={pana} alt="Illustration" />
        {/* <h2>बैंक ऑफ़ बड़ौदा</h2>
        <h3>Bank of Baroda</h3> */}
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
          <div className="" style={{ position: 'relative' }}>
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
                    // "http://localhost:5000/api/auth/candidate-resend-verification",

                    {
                      user_id: unverifiedUserId,
                    }
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

          {/* <div className="actions">
            <span className="forgot-link">Forgot password?</span>
          </div> */}

          <button className="login-button" type="submit">
            LOGIN
          </button>

          {/* <div className="divider">OR</div>

          <button type="button" className="google-button">
            <img src="/images/google-icon.png" alt="Google" />
            Sign up with Google
          </button> */}
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