import React, { useState } from "react";
import Turnstile from "react-turnstile";
 
export default function TurnstileWidget({ onTokenChange }) {
  const [token, setToken] = useState("");
 
  const handleSuccess = (t) => {
    setToken(t);
    onTokenChange(t);
  };
 
  const handleExpire = () => {
    setToken("");
    onTokenChange("");
  };
 
  return (
    <div style={{
      minHeight: "90px",
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    }}>
 
      <Turnstile
        sitekey="0x4AAAAAACJt2YP9AbuhUTuE"
        appearance="always"
        execution="render"
        onSuccess={handleSuccess}
        onExpire={handleExpire}
        options={{ theme: "light" }}
      />
 
      {/* Styled badge */}
      <div style={{
  padding: "8px 12px",
  background: "#e8f5e9",
  border: "1px solid #aedbaf",
  borderRadius: "4px",
  fontSize: "12px",
  color: "#2e7d32",
  fontWeight: "500"
}}>
  ✔ Verified by Cloudflare Turnstile
</div>
 
    </div>
  );
}