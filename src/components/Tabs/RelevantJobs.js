// components/Tabs/RelevantJobs.jsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBriefcase,
  faMapMarkerAlt,
  faCalendarAlt,
  faUsers,
  faClock,
  faTools
} from '@fortawesome/free-solid-svg-icons';
import { Modal } from 'react-bootstrap';
import '../../css/Relevantjobs.css';
import axios from 'axios';

const RelevantJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
const [showModal, setShowModal] = useState(false);
  // Static JSON (sample data from your request)
  const sampleData = {
    "success": true,
    "message": "Active jobs found",
    "data": [
      {
        "position_id": "e15bdef7-a76e-48f8-a9ee-97b2adfee949",
        "requisition_id": "11111111-1111-1111-1111-111111111111",
        "position_title": "Information Security",
        "description": "ewr",
        "position_code": null,
        "roles_responsibilities": "dfdg",
        "grade_id": 1,
        "employment_type": "Full-Time",
        "eligibility_age_min": 3,
        "eligibility_age_max": 4,
        "mandatory_qualification": "dfgfdg",
        "preferred_qualification": "dfgdfg",
        "mandatory_experience": 3,
        "preferred_experience": 3,
        "probation_period": 5,
        "documents_required": "Pan",
        "min_credit_score": 4,
        "position_status": "Active",
        "created_by": null,
        "created_date": null,
        "updated_by": null,
        "updated_date": null
      },
      {
        "position_id": "df301804-23f7-4401-a776-6a74e66e0fbc",
        "requisition_id": "11111111-1111-1111-1111-111111111111",
        "position_title": "Digital Banking",
        "description": "sdf",
        "position_code": null,
        "roles_responsibilities": "sdf",
        "grade_id": 1,
        "employment_type": "Full-Time",
        "eligibility_age_min": 3,
        "eligibility_age_max": 4,
        "mandatory_qualification": "sdf",
        "preferred_qualification": "dsfds",
        "mandatory_experience": 3,
        "preferred_experience": 3,
        "probation_period": 4,
        "documents_required": "Pan",
        "min_credit_score": 4,
        "position_status": "close",
        "created_by": null,
        "created_date": null,
        "updated_by": null,
        "updated_date": null
      }
    ]
  };
  const handleKnowMore = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        
        //const response = await fetch('http://192.168.20.111:8081/api/active_jobs');
        const response = await axios.get('http://docs.sentrifugo.com:8080/jobcreation/api/active_jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        setJobs(data.data || []);
      } catch (err) {
        console.error('Error fetching jobs, using sample data:', err);
        setJobs(sampleData.data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means this runs once on mount

const handleApply = async (positionId) => {
    try {
      // You'll need to get these values from your application state or props
      const candidateId = "d90b00ab-9d58-469e-a474-7afd76864d01"; // Replace with actual candidate ID
      const resumePath = "path/to/resume.pdf"; // Replace with actual resume path
  
      const response = await fetch('YOUR_API_ENDPOINT_HERE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          position_id: positionId,
          resumePath: resumePath
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit application');
      }
  
      const result = await response.json();
      alert('Application submitted successfully!');
      // Handle successful application (e.g., show success message, update UI)
      
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  return (
    
    <div>
      {loading && (
        <div style={{ textAlign: "center", margin: "20px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading Relevant Jobs...</p>
        </div>
      )}

      <div className="row" id="matched-jobs-container">
        {jobs.length === 0 && !loading && <p>No matching jobs found.</p>}

        {jobs.map((job, index) => (
          <div className="col-md-4 mb-4" key={index}>
            <div
              className="card h-100"
              style={{
                background: 'linear-gradient(135deg, #e0f7fa, #ffffff)',
                boxShadow: '0px 8px 20px rgba(0, 123, 255, 0.15)',
                borderRadius: '12px',
                border: 0
              }}
            >
              <div className="card-body">
                <h6 className="job-title">
                  <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                  <b>{job.position_title}</b>
                </h6>

                {/* <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faBriefcase} className="me-2 text-muted" />
                  {job.description}
                </p> */}

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
                  <b>Employment Type:</b> {job.employment_type}
                </p>

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faUsers} className="me-2 text-muted" />
                  <b>Eligibility Age:</b> {job.eligibility_age_min} - {job.eligibility_age_max} years
                </p>

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faClock} className="me-2 text-muted" />
                  <b>Experience:</b> {job.mandatory_experience} years (Mandatory)
                </p>

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faTools} className="me-2 text-muted" />
                  <b>Required Qualification:</b> {job.mandatory_qualification}
                </p>

                <p className="mb-1 text-muted small">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-muted" />
                  <b>Status:</b> {job.position_status}
                </p>

                <div className="d-flex mt-3">
                  <button className="btn btn-sm btn-outline-primary hovbtn" onClick={() => handleApply(job.position_id)}><b>Apply Online</b></button>
                  <button
                      className="btn btn-sm knowntb ms-2"
                      onClick={() => handleKnowMore(job)}
                    >Know More</button>
                  
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
  <Modal.Header closeButton className="modal-header-custom">
    <Modal.Title className="text-primary">
      {selectedJob?.position_title || 'Job Details'}
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedJob && (
      <div className="job-details">
        <h5 className="section-header">Job Description</h5>
        <p className="mb-4">{selectedJob.description || 'No description available'}</p>
        
        <div className="row">
          <div className="col-md-6">
            <h6 className="section-header">Key Details</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <strong>Employment Type:</strong> {selectedJob.employment_type || 'N/A'}
              </li>
              <li className="mb-2">
                <strong>Eligibility Age:</strong> {selectedJob.eligibility_age_min} - {selectedJob.eligibility_age_max} years
              </li>
              <li className="mb-2">
                <strong>Mandatory Experience:</strong> {selectedJob.mandatory_experience} years
              </li>
              <li className="mb-2">
                <strong>Preferred Experience:</strong> {selectedJob.preferred_experience} years
              </li>
            </ul>
          </div>
          
          <div className="col-md-6">
            <h6 className="section-header">Requirements</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <strong>Mandatory Qualification:</strong> {selectedJob.mandatory_qualification || 'Not specified'}
              </li>
              <li className="mb-2">
                <strong>Preferred Qualification:</strong> {selectedJob.preferred_qualification || 'Not specified'}
              </li>
              <li className="mb-2">
                <strong>Probation Period:</strong> {selectedJob.probation_period} months
              </li>
              <li className="mb-2">
                <strong>Documents Required:</strong> {selectedJob.documents_required || 'Not specified'}
              </li>
            </ul>
          </div>
        </div>

        {selectedJob.roles_responsibilities && (
          <div className="mt-4">
            <h6 className="section-header">Roles & Responsibilities</h6>
            <p className="text-muted">{selectedJob.roles_responsibilities}</p>
          </div>
        )}
      </div>
    )}
  </Modal.Body>
  <Modal.Footer className="bg-light">
    <button 
      className="btn btn-outline-secondary" 
      onClick={handleCloseModal}
    >
      Close
    </button>
    {/* <button 
      className="btn btn-primary"
      onClick={() => {
        // Add your apply logic here
        console.log('Applying for:', selectedJob.position_title);
      }}
    >
      Apply Now
    </button> */}
  </Modal.Footer>
</Modal>
    </div>
  );
};

export default RelevantJobs;
