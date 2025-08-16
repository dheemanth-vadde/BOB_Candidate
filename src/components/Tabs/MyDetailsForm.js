import React from 'react';

const MyDetails = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p>No details available. Please complete the Review Details form first.</p>;
  }

  return (
    <div className="details-section p-4">
      <h5>My Details</h5>
      <div className="details-grid row">
        <div className="col-md-4"><strong>Name:</strong> {data.name || "—"}</div>
        <div className="col-md-4"><strong>Date of Birth:</strong> {data.dob || "—"}</div>
        <div className="col-md-4"><strong>Email:</strong> {data.email || "—"}</div>
        <div className="col-md-4"><strong>Skills:</strong> {data.skills || "—"}</div>
        <div className="col-md-4"><strong>Total Experience:</strong> {data.totalExperience || "—"}</div>
        <div className="col-md-4"><strong>Current Designation:</strong> {data.currentDesignation || "—"}</div>
        <div className="col-md-4"><strong>Current Employer:</strong> {data.currentEmployer || "—"}</div>
        <div className="col-md-12"><strong>Address:</strong> {data.address || "—"}</div>
      </div>
    </div>
  );
};

export default MyDetails;
