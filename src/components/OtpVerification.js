import pana from "../assets/pana.png";
import BobLogo from "../assets/bob-logo1.jpg";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import '../css/OtpVerification.css';
import { setUser } from '../store/userSlice';
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
	const dispatch = useDispatch();

  const email = location.state?.email; // ← Get email sent from Login page

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length < 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://dev.bobjava.sentrifugo.com:8443/dev-auth-app/api/v1/candidate-auth/verify-otp",
        {
          email: email,
          otp: otpValue
        },
        {
          headers: {
            "X-Client": "candidate",
            "Content-Type": "application/json"
          }
        }
      );

      console.log("OTP Verified:", res.data);
			dispatch(setUser(res.data));
      navigate("/candidate-portal"); // SUCCESS
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "OTP verification failed. Please try again.");
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

        <h4 className="text-center fw-semibold">Please enter verification code</h4>
        <p className="text-center text-muted mt-1">
          We've sent a 6-digit verification code to your registered email.
        </p>

        <form className="login_form mt-3" onSubmit={submitOtp}>
          <label>Enter your OTP</label>

          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="otp-box"
              />
            ))}
          </div>

          <p className="forgot-link mb-4">Resend OTP</p>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
