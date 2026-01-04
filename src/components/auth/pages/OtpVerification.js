import pana from "../../../assets/pana.png";
import BobLogo from "../../../assets/bob-logo1.jpg";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import '../../../css/OtpVerification.css';
import { setUser } from '../store/userSlice';
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";

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
  }

  const handlePaste = (e, index) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, ''); // Keep only digits
    const digits = paste.split('');
    const newOtp = [...otp];
    for (let i = 0; i < digits.length && index + i < 6; i++) {
      newOtp[index + i] = digits[i];
    }
    setOtp(newOtp);
    // Focus the next input
    const nextIndex = Math.min(index + digits.length, 5);
    inputsRef.current[nextIndex]?.focus();
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

      const res = await authApi.verifyOtp(email, otpValue);
      console.log("OTP Verified:", res.data);
			dispatch(setUser(res.data));
      navigate("/candidate-portal", { replace: true, state: { showDisclaimer: true } }); // Replace history entry and pass state
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

	const resendOtp = async () => {
		if (!email) {
			toast.error("Email not found!");
			return;
		}
		try {
			setLoading(true);
			const res = await authApi.resendOtp(email);
			toast.success("OTP resent successfully!");
			console.log("Resend OTP Response:", res.data);
		} catch (err) {
			console.log(err);
			toast.error(err.response?.data?.message || "Failed to resend OTP");
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
                onPaste={(e) => handlePaste(e, index)}
                className="otp-box"
              />
            ))}
          </div>

          <p className="forgot-link mb-4" onClick={resendOtp}>Resend OTP</p>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
