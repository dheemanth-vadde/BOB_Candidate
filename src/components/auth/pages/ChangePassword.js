// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "../../../css/Login.css";
import pana from "../../../assets/pana.png";
import BobLogo from "../../../assets/bob-logo1.jpg";
import { useDispatch } from 'react-redux';
// import { setUser, setAuthUser } from '../../store/userSlice';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";
import { isStrongPassword } from "../../../shared/utils/validation";

const ChangePassword = () => {
  const [publicKey, setPublicKey] = useState("");
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
  const [unverifiedUserId, setUnverifiedUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
	const location = useLocation();

	const email = location.state?.email;
	const otp = location.state?.otp;

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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isStrongPassword(password)) {
      toast.error(
        "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character"
      );
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
      const res = await authApi.resetPassword(encryptedCredentials, otp);

      console.log("Password Change Success:", res.data);
			toast.success("Password changed successfully. Please login with your new password.");
      navigate("/login");
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

        <form className="login_form" onSubmit={handleLogin}>
          {/* PASSWORD */}
          <label>New Password:</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: "40px", marginBottom: "0.25rem" }}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "45%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <label className="mt-3">Confirm Password:</label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ paddingRight: "40px" }}
            />
            <FontAwesomeIcon
              icon={showConfirm ? faEye : faEyeSlash}
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "15px",
                top: "48%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666"
              }}
            />
          </div>

          {/* <p className="forgot-link mb-4">
            <Link className="" to="/forgot-password">Forgot Password?</Link>
          </p> */}

          <button className="login-button mt-4" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

          {/* <p className="register-link">
            New User? <Link to="/register">Register Here</Link>
          </p> */}
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
