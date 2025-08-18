import React, { useState, useEffect } from 'react';

const ReviewDetails = ({ initialData = {}, onSubmit ,resumePublicUrl }) => {
  const [formData, setFormData] = useState(initialData);

  // ✅ Keep formData in sync with initialData
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

const handleChange = (e) => {
  const { id, value } = e.target;
  setFormData(prev => ({ ...prev, [id]: value }));
};
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Resume Public URL:", resumePublicUrl);
  
  try {
    // Prepare the candidate data with resume URL
    const candidatePayload = {
      //...formData,
      resume_url: resumePublicUrl,
      // Map your form fields to match the API expected format
      full_name: formData.name || '',
    
      email: formData.email || '',
      gender: formData.gender || 'Male', // Add gender to payload
      id_proof: formData.id_proof || '', // Add ID proof to payload
      phone: formData.phone || '',
      date_of_birth: formData.dob || '',
      skills: formData.skills || '',
      total_experience: formData.totalExperience || 0,
      current_designation: formData.currentDesignation || '',
      current_employer: formData.currentEmployer || '',
      address: formData.address || '',
      // Add any other fields that match your API requirements
    };

    console.log('Submitting candidate data:', candidatePayload);

    // const response = await fetch('https://bobbe.sentrifugo.com/api/candidate', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Add any required headers (e.g., authorization)
    //     // 'Authorization': `Bearer ${yourAuthToken}`
    //   },
    //   body: JSON.stringify(candidatePayload)
    // });

    // if (!response.ok) {
    //   throw new Error('Failed to submit candidate data');
    // }

    // const result = await response.json();
    // console.log('Candidate data submitted successfully:', result);
    
    // Call the original onSubmit with the form data
    onSubmit(formData);
    
  } catch (error) {
    console.error('Error submitting candidate data:', error);
    alert('Failed to submit candidate data: ' + error.message);
  }
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
          <label htmlFor="gender" className="form-label">Gender *</label>
          <select
            className="form-select"
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="id_proof" className="form-label">ID Proof*</label>
          <input
            type="text"
            className="form-control"
            id="id_proof"
            value={formData.id_proof}
            onChange={handleChange}
            required
            placeholder="Enter ID Proof (Aadhar/Passport/Driving License)"
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
          <button type="submit" className="btn btn-primary" style={{
              backgroundColor: 'rgb(255, 112, 67)',
              color: 'white',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Submit & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewDetails;
