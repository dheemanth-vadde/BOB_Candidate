// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import panaImage from "../assets/pana.png";
import logoImage from "../assets/bob-logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";

const Register = () => {
  const SECRET_KEY = "fdf4-832b-b4fd-ccfb9258a6b3";
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
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

  const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

 const handleRegister = async (e) => {
  e.preventDefault();
  const { name, email, phone, password, confirmPassword } = form;

  if (!name || !email || !phone || !password || !confirmPassword) {
    return alert("All fields are required");
  }
  if (password !== confirmPassword) {
    return alert("Passwords do not match");
  }

  try {
    const encryptedPassword = encryptPassword(password);
    // 1. Register user via your backend
    await axios.post("https://bobbe.sentrifugo.com/api/auth/candidate-register", {
    // await axios.post("http://localhost:5000/api/auth/candidate-register", {
      name,
      email,
      phone,
      password: encryptedPassword,
    });

    // 2. Immediately try to log in (to trigger MFA)
    // const loginRes = await axios.post("https://bobbe.sentrifugo.com/api/auth/candidate-login", {
    //   email,
    //   password,
    // });

    // // 3. If MFA is required, show OTP input
    // if (loginRes.data.mfa_required) {
    //   setMfaToken(loginRes.data.mfa_token);
    //   setShowOtpInput(true);
    // } else {
    //   // No MFA required, login directly
    //   localStorage.setItem("access_token", loginRes.data.access_token);
    //   navigate("/dashboard");
    // }
    // localStorage.setItem("access_token",loginRes.data.access_token);
    navigate("/login");
  } catch (err) {
    console.error(err);

    if (err.response) {
      // Example: API returns 409 Conflict if user exists
      if (err.response.status === 400) {
        alert("User already exists. Please login instead.");
      } else {
        // Or check message returned by backend
        const msg = err.response.data?.message || "Registration/Login failed";
        alert(msg);
      }
    }
  }
};
// const handleVerifyOtp = async () => {
//   try {
//     const res = await axios.post("https://dev-0rb6h2oznbwkonhz.us.auth0.com/oauth/token", {
//       grant_type: "http://auth0.com/oauth/grant-type/mfa-otp",
//       client_id: "YOUR_CLIENT_ID", // 🔁 replace with real ID
//       mfa_token: mfaToken,
//       otp,
//     });

//     localStorage.setItem("access_token", res.data.access_token);
//     alert("Registration + OTP verified!");
//     navigate("/dashboard");
//   } catch (err) {
//     alert("OTP verification failed.");
//   }
// };



  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={panaImage} alt="Illustration" />
        <h2>बैंक ऑफ़ बड़ौदा</h2>
        <h3>Bank of Baroda</h3>
      </div>

      <div className="right-panel">
        <div className="logo" style={{ marginBottom: '15px' }}>
          <img src={logoImage} alt="Logo" />
          <h4>Register</h4>
        </div>

        <form onSubmit={handleRegister} className="d-flex flex-column w-50 align-self-center">
          {/* <button
            className="back-button"
            onClick={() => navigate("/login")}
          >
            ← Login
          </button> */}

          <label>Full Name</label>
          <input name="name" onChange={handleChange} required style={{ borderRadius: "5px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px' }}/>

          <label>Email</label>
          <input type="email" name="email" onChange={handleChange} required style={{ borderRadius: "5px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px' }}/>

          <label>Phone</label>
          <input type="text" name="phone" onChange={handleChange} required style={{ borderRadius: "5px", backgroundColor: "#fff", border: "1px solid #ccc", padding: '8px' }}/>

          <label>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              required
              style={{
                borderRadius: "5px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                padding: "8px",
                width: "100%",
                paddingRight: "40px",
              }}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
              title={showPassword ? "Hide password" : "Show password"}
            />
          </div>


          <label>Confirm Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              onChange={handleChange}
              required
              style={{
                borderRadius: "5px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                padding: "8px",
                width: "100%",
                paddingRight: "40px",
              }}
            />
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEye : faEyeSlash}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
              title={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            />
          </div>

          <button type="submit" className="login-button mt-4">REGISTER</button>
          {/* {showOtpInput && (
  <>
    <input
      placeholder="Enter OTP"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
    />
    <button onClick={handleVerifyOtp}>Verify OTP</button>
  </>
)} */}


          <p className="register-link">
            Already a user? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;