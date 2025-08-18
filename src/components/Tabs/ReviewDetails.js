import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {apiService} from '../../services/apiService';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
const ReviewDetails = ({ initialData = {}, onSubmit ,resumePublicUrl }) => {
  const [formData, setFormData] = useState(initialData);
  const user = useSelector((state) => state.user.user);
  const candidateId = user?.candidate_id; // TODO: replace with logged-in candidate id
  // ✅ Keep formData in sync with initialData
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);
  

  const [masterData, setMasterData] = useState({
    countries: [],
    specialCategories: [],
    reservationCategories: []
  });
  const [loading, setLoading] = useState(true);
  
    // Fetch master data on component mount
    useEffect(() => {
      const fetchMasterData = async () => {
        try {
          const response = await apiService.getMasterData();
         // console.log("Master Data:", response);
          const data = await response.data;
          setMasterData({
            countries: response.data.countries || [],
            specialCategories: data.special_categories || [],
            reservationCategories: data.reservation_categories || []
          });
          
        } catch (error) {
          console.error('Error fetching master data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchMasterData();
    }, []);
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
      candidate_id: candidateId,
      file_url: resumePublicUrl,
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
      nationality_id: formData.nationality_id || '',
      education_qualification: formData.education_qualification || '',
      // Add any other fields that match your API requirements
    };

    console.log('Submitting candidate data:', candidatePayload);
    try {
      const response = await apiService.updateCandidates(candidatePayload);
      console.log('Candidate data updated successfully:', response);
      toast.success('Candidate data updated successfully!');
      onSubmit(formData);
    } catch (error) {
      console.error('Error updating candidate data:', error);
      throw error; // Re-throw to be caught by the outer catch block
    }
    
   
    
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
          <label htmlFor="phone" className="form-label">Phone *</label>
          <input
            type="text"
            className="form-control"
            id="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="education_qualification" className="form-label">Education Qualification *</label>
          <input
            type="text"
            className="form-control"
            id="education_qualification"
            value={formData.education_qualification || ''}
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
        <div className="col-md-4">
          <label htmlFor="nationality_id" className="form-label">Nationality *</label>
          <select
            className="form-select"
            id="nationality_id"
            value={formData.nationality_id || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Nationality</option>
            {masterData.countries.map(country => (
              <option key={country.country_id} value={country.country_id}>
                {country.country_name}
              </option>
            ))}
          </select>
        </div>

        {/* Special Category Dropdown */}
        {/* <div className="col-md-4">
          <label htmlFor="special_category_id" className="form-label">Special Category</label>
          <select
            className="form-select"
            id="special_category_id"
            value={formData.special_category_id || ''}
            onChange={handleChange}
          >
            <option value="">Select Special Category</option>
            {masterData.specialCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="reservation_category_id" className="form-label">Reservation Category</label>
          <select
            className="form-select"
            id="reservation_category_id"
            value={formData.reservation_category_id || ''}
            onChange={handleChange}
          >
            <option value="">Select Reservation Category</option>
            {masterData.reservationCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div> */}
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
