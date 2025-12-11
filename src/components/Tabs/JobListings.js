import React, { useState } from 'react';
import { Card, Button,ButtonGroup  } from 'react-bootstrap';
import PreferenceModal from './PreferenceModal';
import PreviewModal from './PreviewModal';
import { toast } from "react-toastify";
//import "../../css/PreviewModal.css";
// import "../../css/PreferenceModal.css";
const JobListings = () => {
  // Sample static job data
  const staticJobs = [
    {
      id: 1,
      position_title: 'Software Engineer',
      requisition_code: 'JREQ-1001',
      department: 'Engineering',
      location: 'Hyderabad',
      experience: '3-5 years',
      description: 'We are looking for a skilled software engineer...'
    },
    {
      id: 2,
      position_title: 'Product Manager',
      requisition_code: 'JREQ-1002',
      department: 'Product',
      location: 'Bangalore',
      experience: '5-7 years',
      description: 'Looking for an experienced product manager...'
    }
  ];

  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyForm, setApplyForm] = useState({
    state1: '',
    location1: '',
    state2: '',
    location2: '',
    state3: '',
    location3: '',
    ctc: '',
    examCenter: ''
  });

const [previewData, setPreviewData] = useState({
  personalDetails: {
    fullName: "Jagadeesh",
    address: "Flat 25/123-A, Jagadgirigutta, Kukatpally, Hyderabad, Andhra Pradesh, 500090",
    permanentAddress: "Flat 25/123-A, Jagadgirigutta, Kukatpally, Hyderabad, Andhra Pradesh, 500090",
    mobile: "9998887777",
    email: "jagadeesh.karthik@gmail.com",
    fatherName: "Karthik Name",
    dob: "01-01-1994",
    maritalStatus: "Married",
    religion: "Hindu",
    nationality: "Indian",
    expectedCTC: "22 LPA",
    location1: "Andhra Pradesh - Guntur",
    location2: "Maharashtra - Mumbai",
    location3: "Telangana - Hyderabad",
  },
  education: [
    {
      degree: "B.Tech (Information Technology)",
      board: "Jawaharlal Nehru Technological University",
      subject: "Computer Science and Engineering",
      passingMonth: "June 2016",
      division: "First Class",
      marks: "8.09 GPA",
    },
    {
      degree: "Master of Business Administration (MBA)",
      board: "Indian Institute of Management",
      subject: "Finance & Marketing",
      passingMonth: "April 2020",
      division: "First Class",
      marks: "7.9 GPA",
    },
  ],
  experience: [
    {
      org: "Tech Solutions Pvt Ltd",
      designation: "Software Engineer",
      department: "IT Development",
      from: "July 2016",
      to: "March 2019",
      duration: "2 Years 9 Months",
      nature: "Full-stack development, UI design, database management",
    },
    {
      org: "PayTech Innovations",
      designation: "Senior Product Manager",
      department: "Digital Commerce",
      from: "April 2021",
      to: "Present",
      duration: "3 Years 8 Months",
      nature: "Leading ONDC integration, digital product solutions, cross-functional team leadership",
    },
  ],
  // ✅ Add this summary block
  experienceSummary: {
    total: "6 Years 8 Months",
    relevant: "5 Years 2 Months",
    designation: "Senior Product Manager",
  },
});

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowPreviewModal(true);
  };

  const handleInputChange = (name, value) => {
    setApplyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handlePreferenceClick = (job) => {
  setSelectedJob(job);
  setShowPreferenceModal(true);
};
  const handlePreview = () => {
    setShowPreferenceModal(false);
    setShowPreviewModal(true);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Available Job Positions</h2>
      <div className="row">
        {staticJobs.map((job) => (
          <div key={job.id} className="col-md-6 mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{job.position_title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {job.department} • {job.location}
                </Card.Subtitle>
                <Card.Text className="mb-3">
                  {job.description}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Experience: {job.experience}</span>
                  
                <ButtonGroup>
      <Button 
        variant="outline-primary" 
        onClick={() => handlePreferenceClick(job)}
        className="me-2"
      >
        Preference
      </Button>
      <Button 
        variant="primary" 
        onClick={() => handleApplyClick(job)}
      >
        Apply Now
      </Button>
    </ButtonGroup>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Preference Modal */}
      {/* {selectedJob && (
        <PreferenceModal
          show={showPreferenceModal}
          onHide={() => setShowPreferenceModal(false)}
          selectedJob={selectedJob}
          applyForm={applyForm}
          onApplyFormChange={handleInputChange}
          onPreview={handlePreview}
        />
      )} */}
{/* Add the PreferenceModal component back */}
  {selectedJob && (
    <PreferenceModal
      show={showPreferenceModal}
      onHide={() => setShowPreferenceModal(false)}
      selectedJob={selectedJob}
      applyForm={applyForm}
      onApplyFormChange={handleInputChange}
      onPreview={() => {
        setShowPreferenceModal(false);
        setShowPreviewModal(true);
      }}
    />
  )}
      {/* Preview Modal */}
      {selectedJob && (
       <PreviewModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        previewData={previewData}
        onBack={() => {
          setShowPreviewModal(false);
          //setShowApplyModal(true);
        }}
        onEditProfile={() => {
          // Handle edit profile action
          setShowPreviewModal(false);
          // You might want to navigate to profile page or open edit modal
          toast.info("Redirecting to profile editor...");
        }}
        onProceedToPayment={() => {
          // Handle proceed to payment action
          toast.success("Proceeding to payment...");
          // Add payment processing logic here
        }}
      />
      )}
    </div>
  );
};

export default JobListings;