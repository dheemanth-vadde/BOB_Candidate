import React, { useEffect } from "react";

const DigiLockerCallback = () => {

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    const state = new URLSearchParams(window.location.search).get("state");

    if (!code) {
      alert("No DigiLocker code received.");
      return;
    }

    // Notify main window that DigiLocker is verified
    if (window.opener) {
      window.opener.postMessage({ digilockerVerified: true }, "*");
    }

    alert("DigiLocker Verified Successfully!");
    window.close();
  }, []);

  return <h3>Verifying DigiLocker...</h3>;
};

export default DigiLockerCallback;
