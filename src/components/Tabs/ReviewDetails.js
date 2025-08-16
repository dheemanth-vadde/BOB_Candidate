import React, { useState, useEffect } from 'react';

const ReviewDetails = ({ initialData = {}, onSubmit }) => {
  const [formData, setFormData] = useState(initialData);

  // ✅ Keep formData in sync with initialData
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

const handleChange = (e) => {
  const { id, value } = e.target;
  setFormData(prev => ({ ...prev, [id]: value }));
};
const handleSubmit = (e) => {
  e.preventDefault();
  onSubmit(formData); // Send updated data back to parent
};

  if (!formData) {
    return <p>Loading details...</p>; // fallback UI
  }

  return (
    <div className="form-content-section text-start p-4 spaceform">
      <form className="row g-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label htmlFor="name" className="form-label">Name *</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <label htmlFor="dob" className="form-label">Date of Birth *</label>
          <input
            type="date"
            className="form-control"
            id="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <label htmlFor="email" className="form-label">Email *</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <label htmlFor="skills" className="form-label">Skills</label>
          <textarea
            className="form-control"
            id="skills"
            rows="3"
            value={formData.skills}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label htmlFor="totalExperience" className="form-label">Total Experience</label>
          <input
            type="text"
            className="form-control"
            id="totalExperience"
            value={formData.totalExperience}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label htmlFor="currentDesignation" className="form-label">Current Designation</label>
          <input
            type="text"
            className="form-control"
            id="currentDesignation"
            value={formData.currentDesignation}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label htmlFor="currentEmployer" className="form-label">Current Employer</label>
          <input
            type="text"
            className="form-control"
            id="currentEmployer"
            value={formData.currentEmployer}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label htmlFor="address" className="form-label">Address</label>
          <textarea
            className="form-control"
            id="address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Submit & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewDetails;
