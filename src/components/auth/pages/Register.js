// src/pages/Register.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import panaImage from "../../../assets/pana.png";
import logoImage from "../../../assets/bob-logo1.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";
import TurnstileWidget from "../../integrations/Cpatcha/TurnstileWidget";
import { isStrongPassword } from "../../../shared/utils/validation";

const Register = () => {
  const [publicKey, setPublicKey] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  //   const [otp, setOtp] = useState("");
  // const [mfaToken, setMfaToken] = useState("");
  // const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    fetch("/public_key.pem")
      .then(res => res.text())
      .then(key => setPublicKey(key))
      .catch(err => console.error("Failed to load public key:", err));
  }, []);

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(); // hex string
  };

  const encryptCredentials = (email, password, publicKey) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);

    const data = `${email}|${password}`;
    const encrypted = encrypt.encrypt(data);

    return encrypted; // base64 encrypted string
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword, dob } = form;

    if (!name || !email || !phone || !password || !confirmPassword || !dob) {
      return alert("All fields are required");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    if (!isStrongPassword(password)) {
      toast.error(
        "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character"
      );
      return;
    }

    if (!publicKey) {
      alert("Public key not loaded yet!");
      return;
    }

    const hashedPassword = hashPassword(password);
    const encryptedCredentials = encryptCredentials(email, hashedPassword, publicKey);

    try {
      // 1. Register user via your backend
      await authApi.registerCandidate({
        fullName: name,
        mobileNumber: Number(phone),
        dateOfBirth: dob,
        credentials: encryptedCredentials,
        ["cf-turnstile-response"]: token
      });
      setShowVerificationModal(true);
      // navigate("/login");
    } catch (err) {
      console.error(err);

      if (err.response) {
        console.log(err.response)
        // Example: API returns 409 Conflict if user exists
        if (err.response.status === 400) {
          toast.error(err.response.data.message);
        } else {
          // Or check message returned by backend
          const msg = err.response.data?.message || "Registration/Login failed";
          toast.error(msg);
        }
      }
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={panaImage} alt="Illustration" />
        {/* <h2>बैंक ऑफ़ बड़ौदा</h2>
        <h3>Bank of Baroda</h3> */}
      </div>

      <div className="right-panel">
        <div className="logo" style={{ marginBottom: '15px' }}>
          <img src={logoImage} alt="Logo" />
          <h4 className="mt-1">Welcome to Candidate Login</h4>
        </div>

        <form onSubmit={handleRegister} className="login_form">
          {/* <button
            className="back-button"
            onClick={() => navigate("/login")}
          >
            ← Login
          </button> */}

          <label>Full Name as per Aadhar <span className="text-danger">*</span></label>
          <input name="name" onChange={handleChange} required />

          <label>Date of Birth <span className="text-danger">*</span></label>
          <input type="date" name="dob" onChange={handleChange} required />

          <label>Mobile Number <span className="text-danger">*</span></label>
          <input type="text" name="phone" onChange={handleChange} required />

          <label>Email <span className="text-danger">*</span></label>
          <input type="email" name="email" onChange={handleChange} required />

          <label>Password <span className="text-danger">*</span></label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              required
            // style={{
            //   borderRadius: "5px",
            //   backgroundColor: "#fff",
            //   border: "1px solid #ccc",
            //   padding: "8px",
            //   width: "100%",
            //   paddingRight: "40px",
            // }}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "35%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
              size="sm"
              title={showPassword ? "Hide password" : "Show password"}
            />
          </div>


          <label>Confirm Password <span className="text-danger">*</span></label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              onChange={handleChange}
              required
            // style={{
            //   borderRadius: "5px",
            //   backgroundColor: "#fff",
            //   border: "1px solid #ccc",
            //   padding: "8px",
            //   width: "100%",
            //   paddingRight: "40px",
            // }}
            />
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEye : faEyeSlash}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "35%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
              size="sm"
              title={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            />
          </div>
          <TurnstileWidget onTokenChange={setToken} />
          <button type="submit" className="login-button mt-2 mb-2">Register</button>

          <p className="register-link mb-0">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>

      {showVerificationModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>We've sent a verification link to your Email.<br />
              Please check your inbox and verify to continue.</p>

            <button
              onClick={() => {
                setShowVerificationModal(false);
                navigate("/login", {replace: true});   // redirect ONLY after closing modal
              }}
              className="ok-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;