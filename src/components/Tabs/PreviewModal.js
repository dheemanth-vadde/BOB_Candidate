import React from "react";
import { Modal, Accordion } from "react-bootstrap";
import "../../css/PreviewModal.css";
import logo_Bob from "../../assets/bob-logo.png";
import sign from "../../assets/download.png";

const PreviewModal = ({
  show,
  onHide,
  previewData,
  onBack,
  onEditProfile,
  onProceedToPayment,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      dialogClassName="bob-preview-modal"
    >
      <Modal.Body className="bob-modal-body">
        {/* ===== HEADER ===== */}
        <div className="bob-header">
          <div className="fw-semibold text-dark small mb-1">
            Advt. No:-{" "}
            <span className="fw-bold">BOB/HRM/REC/ADVT/2025/17</span>
          </div>
          <div className="fw-semibold bob-header-title">
            Position for Application:- Deputy Manager: Product - ONDC (Open
            Network for Digital Commerce)
          </div>
        </div>

        {/* ===== ACCORDION ===== */}
        <Accordion defaultActiveKey="0" className="bob-accordion">
          {/* === PERSONAL DETAILS === */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Personal Details</Accordion.Header>
            <Accordion.Body>
              <div className="personal-details-wrapper">
                <table className="table table-bordered bob-table w-100 mb-0">
                 <tbody>
        <tr>
          <td className="fw-bold" style={{ width: "20%" }}>Full Name</td>
          <td colSpan={4} style={{ width: "60%" }}>
            {previewData.personalDetails.fullName}
          </td>

          {/* ✅ Make photo span the full height of the table */}
           <td
            rowSpan="3"
            className="bob-photo-cell align-top text-center"
            style={{ width: "20%", verticalAlign: "top" }}
          >
           <div className="bob-photo-box">
    <img
      src={logo_Bob}
      alt="Applicant"
      className="img-fluid img1"
    />
  <img
      src={sign}
      alt="Applicant"
      className="img-fluid img2"
    />
  </div>
  {/* <div className="bob-photo-box1">
   
   
  </div> */}


          </td> 
        
         
        </tr>

        <tr>
          <td className="fw-bold">Address</td>
          <td colSpan={4}>{previewData.personalDetails.address}</td>
        </tr>

        <tr>
          <td className="fw-bold">Permanent Address</td>
          <td colSpan={4}>{previewData.personalDetails.permanentAddress}</td>
        </tr>

        <tr >
          <td className="fw-bold" >Mobile</td>
          <td colSpan={2}>{previewData.personalDetails.mobile}</td>
          <td className="fw-bold">Email</td>
          <td colSpan={2}>{previewData.personalDetails.email}</td>
        </tr>

        <tr >
          <td className="fw-bold">Mother’s Name</td>
          <td  colSpan={2}>{previewData.personalDetails.motherName || "-"}</td>
          <td className="fw-bold">Father’s Name</td>
          <td  colSpan={2}>{previewData.personalDetails.fatherName}</td>
        </tr>

        <tr>
          <td className="fw-bold">Gender</td>
          <td colSpan={2}>{previewData.personalDetails.gender || "M"}</td>
          <td className="fw-bold">Religion</td>
          <td colSpan={2}>{previewData.personalDetails.religion}</td>
        </tr>

        <tr>
          <td className="fw-bold">Category</td>
          <td colSpan={2}  >{previewData.personalDetails.category || "General"}</td>
          <td className="fw-bold">Caste/Community</td>
          <td colSpan={2}>{previewData.personalDetails.caste || "Brahmin"}</td>
        </tr>

        <tr>
          <td className="fw-bold">Date of Birth</td>
          <td colSpan={2}>{previewData.personalDetails.dob}</td>
          <td className="fw-bold">Age (as on cut-off date)</td>
          <td colSpan={2}>{previewData.personalDetails.age || "30 years 11 months 1 day"}</td>
        </tr>

        <tr>
          <td className="fw-bold">Ex-serviceman</td>
          <td colSpan={2}>{previewData.personalDetails.exService || "N/A"}</td>
          <td className="fw-bold">Physical Disability</td>
          <td colSpan={2}>{previewData.personalDetails.physicalDisability || "N"}</td>
        </tr>

        <tr>
          <td className="fw-bold">Exam Center</td>
          <td colSpan={2}>{previewData.personalDetails.examCenter || "Hyderabad"}</td>
          <td className="fw-bold">Nationality</td>
          <td colSpan={2}>{previewData.personalDetails.nationality}</td>
        </tr>

        <tr>
          <td className="fw-bold">Marital Status</td>
          <td colSpan={2}>{previewData.personalDetails.maritalStatus}</td>
          <td className="fw-bold">Name of Spouse</td>
          <td colSpan={2}>{previewData.personalDetails.spouseName || "-"}</td>
        </tr>

        <tr>
          <td className="fw-bold">Current CTC</td>
          <td colSpan={2}>{previewData.personalDetails.currentCTC || "11"}</td>
          <td className="fw-bold">Expected CTC</td>
          <td colSpan={2}>{previewData.personalDetails.expectedCTC}</td>
        </tr>

        <tr>
          <td className="fw-bold">Location Preference 1</td>
          <td colSpan={2}>{previewData.personalDetails.location1}</td>
          <td className="fw-bold">Location Preference 2</td>
          <td colSpan={2}>{previewData.personalDetails.location2}</td>
        </tr>

        <tr>
          <td className="fw-bold">Location Preference 3</td>
          <td colSpan={5}>{previewData.personalDetails.location3}</td>
        </tr>
      </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* === EDUCATION DETAILS === */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>Education Details</Accordion.Header>
            <Accordion.Body>
              <div className="table-responsive">
                <table className="table table-bordered bob-table">
                  <thead className="table-header">
                    <tr>
                      <th>S. No</th>
                      <th>Board/University</th>
                      <th>School/College</th>
                      <th>Degree</th>
                      <th>Specialization</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.education.map((edu, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{edu.board}</td>
                        <td>{edu.school}</td>
                        <td>{edu.degree}</td>
                        <td>{edu.subject}</td>
                        <td>{edu.from}</td>
                        <td>{edu.to}</td>
                        <td>{edu.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* === EXPERIENCE DETAILS === */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Experience Details</Accordion.Header>
            <Accordion.Body>
              {/* Experience Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="exp-card text-center">
                    <div className="text-muted small">Total Experience</div>
                    <div className="fw-semibold text-bob-blue fs-6">
                      {previewData.experienceSummary?.total || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="exp-card text-center">
                    <div className="text-muted small">
                      Relevant Experience
                    </div>
                    <div className="fw-semibold text-bob-blue fs-6">
                      {previewData.experienceSummary?.relevant || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="exp-card text-center">
                    <div className="text-muted small">
                      Current Designation
                    </div>
                    <div className="fw-semibold text-bob-blue fs-6">
                      {previewData.experienceSummary?.designation || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Table */}
              <div className="table-responsive">
                <table className="table table-bordered bob-table">
                  <thead className="table-header">
                    <tr>
                      <th>S. No</th>
                      <th>Organization</th>
                      <th>Post</th>
                      <th>Role</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Duration</th>
                      <th>Brief Description of Work</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.experience?.map((exp, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{exp.org}</td>
                        <td>{exp.designation}</td>
                        <td>{exp.department}</td>
                        <td>{exp.from}</td>
                        <td>{exp.to}</td>
                        <td>{exp.duration}</td>
                        <td>{exp.nature}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* ===== DECLARATION + BUTTONS ===== */}
        <div className="mt-4 text-center">
          <div className="captcha-box mb-3">
            <span className="captcha-text">X A Y 2 U</span>
            <input type="text" className="captcha-input" />
          </div>

          <div className="declaration-box text-start">
            <div className="form-check mb-2">
              <input type="checkbox" className="form-check-input" id="decl1" />
              <label htmlFor="decl1" className="form-check-label">
                I acknowledge that any misrepresentation, omission, or
                furnishing of incorrect information may render my application
                liable for rejection at any stage of the recruitment process.
              </label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="decl2" />
              <label htmlFor="decl2" className="form-check-label">
                I further confirm that all documents uploaded in this
                application have been provided voluntarily and as per my own
                understanding.
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button className="btn btn-outline-secondary" onClick={onBack}>
              ← Back
            </button>
            <div className="d-flex gap-3">
              <button
                className="btn btn-outline-primary"
                onClick={onEditProfile}
              >
                Edit Profile Details
              </button>
              <button
                className="btn btn-bob-orange"
                onClick={onProceedToPayment}
              >
                Proceed for Payment
              </button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PreviewModal;
