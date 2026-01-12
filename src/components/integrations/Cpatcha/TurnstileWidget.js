import React, { useState } from "react";
import Turnstile from "react-turnstile";

export default function TurnstileWidget({ onTokenChange }) {
  const [token, setToken] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handleSuccess = (t) => {
    setToken(t);
    setIsVerified(true);
    onTokenChange(t);
  };

  const handleExpire = () => {
    setToken("");
    setIsVerified(false);
    onTokenChange("");
  };

  const handleError = () => {
    setToken("");
    setIsVerified(false);
    onTokenChange("");
  };

  const handleTimeout = () => {
    setToken("");
    setIsVerified(false);
    onTokenChange("");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      marginTop: '0.25rem',
      marginBottom: '0.25rem'
    }}>
 
      <Turnstile
        sitekey="0x4AAAAAACJt2YP9AbuhUTuE"
        appearance="always"
        execution="render"
        onSuccess={handleSuccess}
        onExpire={handleExpire}
        onError={handleError}
        onTimeout={handleTimeout}
        options={{ theme: "light" }}
      />

      {/* Styled badge */}
      {isVerified &&(
      <div style={{
        padding: "8px 12px",
        background: "#e8f5e9",
        border: "1px solid #aedbaf",
        borderRadius: "4px",
        fontSize: "1em",
        color: "#2e7d32",
        fontWeight: "500"
      }}>
        ✔ Verified by Cloudflare Turnstile
      </div>
)}
    </div>
  );
}