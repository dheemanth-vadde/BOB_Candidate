import React from "react";
import { Modal, Accordion } from "react-bootstrap";
import "../../../css/PreviewModal.css";
import logo_Bob from "../../../assets/bob-logo.png";
import sign from "../../../assets/download.png";
import { useSelector } from "react-redux";
const PreviewModal = ({
  show,
  onHide,
  previewData,
  onBack,
  onEditProfile,
  onProceedToPayment,
  selectedJob
}) => {


  
  const preferenceData = useSelector(
    (state) => state.preference.preferenceData
  );
  
if (!previewData) {
    return null;
  }

  console.log("Stored preference:", preferenceData);
  console.log("Preview selectedJob:", selectedJob);

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
          <div className="fw-semibold text-dark small mb-1 title_pre">
                 <span>{selectedJob?.requisition_code} - {selectedJob?.requisition_title}</span>
          </div>
          <div className="bob-header-title">
            {selectedJob?.position_title ||
            "Deputy Manager : Product - ONDC (Open Network for Digital Commerce)"}
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
                      <td className="fw-med" style={{ width: "20%" }}>Full Name</td>
                      <td  className="fw-reg" colSpan={4} style={{ width: "60%" }}>
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
                      <td className="fw-med">Address</td>
                      <td className="fw-reg" colSpan={4}>{previewData.personalDetails.address}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Permanent Address</td>
                      <td className="fw-reg" colSpan={4}>{previewData.personalDetails.permanentAddress}</td>
                    </tr>

                    <tr >
                      <td className="fw-med" >Mobile</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.mobile}</td>
                      <td className="fw-med">Email</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.email}</td>
                    </tr>

                    <tr >
                      <td className="fw-med">Mother’s Name</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.motherName || "-"}</td>
                      <td className="fw-med">Father’s Name</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.fatherName}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Gender</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.gender || "M"}</td>
                      <td className="fw-med">Religion</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.religion}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Category</td>
                      <td className="fw-reg" colSpan={2}  >{previewData.personalDetails.category || "General"}</td>
                      <td className="fw-med">Caste/Community</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.caste || "Brahmin"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Date of Birth</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.dob}</td>
                      <td className="fw-med">Age (as on cut-off date)</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.age || "30 years 11 months 1 day"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Ex-serviceman</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.exService || "N/A"}</td>
                      <td className="fw-med">Physical Disability</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.physicalDisability || "N"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Exam Center</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.examCenter || "Hyderabad"}</td>
                      <td className="fw-med">Nationality</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.nationality}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Marital Status</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.maritalStatus}</td>
                      <td className="fw-med">Name of Spouse</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.spouseName || "-"}</td>
                    </tr>
                    <tr>
                      <td className="fw-med">Twin Sibling</td>
                      <td className="fw-reg" colSpan={2}></td>
                      <td className="fw-med">Details</td>
                      <td className="fw-reg" colSpan={2}></td>
                    </tr>
                    <tr>
                      <td className="fw-med">Current CTC</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.currentCTC || "11"}</td>
                      <td className="fw-med">Expected CTC</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.expectedCTC}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Location Preference 1</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.location1}</td>
                      <td className="fw-med">Location Preference 2</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.location2}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Location Preference 3</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.location3}</td>
                      <td className="fw-med">Social Media Profile links</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.location3}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Already secured regular employment under the Central Govt. in civil post?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.centralGovtEmployment || "No"}</td>
                      <td className="fw-med">Serving at a post lower than the one advertised?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.servingLowerPost || "No"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Family member of those who died in 1984 riots?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.familyMember1984 || "No"}</td>
                      <td className="fw-med">Belong to Religious Minority Community?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.religiousMinority || "No"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Whether serving in Govt./ quasi Govt./ Public Sector Undertaking?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.servingInGovt || "No"}</td>
                      <td className="fw-med">Disciplinary action in any of your previous/ Current Employment?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.disciplinaryAction || "No"}</td>
                    </tr>

                    {previewData.personalDetails.disciplinaryAction === "Yes" && (
                      <tr>
                        <td className="fw-med">Details of disciplinary proceedings, if Any</td>
                        <td className="fw-reg" colSpan={5}>{previewData.personalDetails.disciplinaryDetails || "N/A"}</td>
                      </tr>
                    )}
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
                      <th>Onboard/University</th>
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
