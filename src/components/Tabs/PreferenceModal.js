import React from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import "../../css/PreferenceModal.css";

const PreferenceModal = ({
  show,
  onHide,
  selectedJob,
  applyForm,
  onApplyFormChange,
  onPreview,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onApplyFormChange(name, value);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      dialogClassName="bob-preference-modal"
    >
       <button
      type="button"
      className="btn-close"
      onClick={onHide}
      aria-label="Close"
    ></button>
      {/* ===== HEADER ===== */}
      <Modal.Header className="border-0 p-0">
  <div className="bob-pref-header">
    <div>
      <div className="bob-pref-header-top">
        <span>Advt. No:-</span>
        <span>{selectedJob?.requisition_code || "BOB/HRM/REC/ADVT/2025/17"}</span>
      </div>
      <div className="bob-pref-header-title">
        <span>Position for Application:-</span>
        <span>{selectedJob?.position_title || "Deputy Manager: Product - ONDC"}</span>
      </div>
    </div>
   
    <div className="bob-pref-info">
      <FontAwesomeIcon icon={faLightbulb} />
      <span style={{color:'#ff6f00'}}>All profile-related data will be dynamically sourced from the candidate's profile records</span>
    </div>
  </div>
</Modal.Header>

      {/* ===== BODY ===== */}
      <Modal.Body className="bob-pref-body">
  <h5 className="bob-pref-title">Add Preference</h5>

  <div className="row g-4">
    {/* Row 1 */}
    <div className="col-md-3">
      <label className="form-label">State preference 1</label>
      <select
        className="form-control"
        name="state1"
        value={applyForm.state1}
        onChange={handleInputChange}
      >
        <option value="">Select State</option>
        <option>Andhra Pradesh</option>
        <option>Maharashtra</option>
        <option>Karnataka</option>
        <option>Tamil Nadu</option>
        <option>Telangana</option>
      </select>
    </div>

    <div className="col-md-3">
      <label className="form-label">Location preference 1</label>
      <select
        className="form-control"
        name="location1"
        value={applyForm.location1}
        onChange={handleInputChange}
      >
        <option value="">Select Location</option>
        <option>Hyderabad</option>
        <option>Mumbai</option>
        <option>Bangalore</option>
        <option>Chennai</option>
        <option>Delhi</option>
      </select>
    </div>

    <div className="col-md-3">
      <label className="form-label">State preference 2</label>
      <select
        className="form-control"
        name="state2"
        value={applyForm.state2}
        onChange={handleInputChange}
      >
        <option value="">Select State</option>
        <option>Andhra Pradesh</option>
        <option>Maharashtra</option>
        <option>Karnataka</option>
        <option>Tamil Nadu</option>
        <option>Telangana</option>
      </select>
    </div>

    <div className="col-md-3">
      <label className="form-label">Location preference 2</label>
      <select
        className="form-control"
        name="location2"
        value={applyForm.location2}
        onChange={handleInputChange}
      >
        <option value="">Select Location</option>
        <option>Hyderabad</option>
        <option>Mumbai</option>
        <option>Bangalore</option>
        <option>Chennai</option>
        <option>Delhi</option>
      </select>
    </div>

    {/* Row 2 */}
    <div className="col-md-3">
      <label className="form-label">State preference 3</label>
      <select
        className="form-control"
        name="state3"
        value={applyForm.state3}
        onChange={handleInputChange}
      >
        <option value="">Select State</option>
        <option>Andhra Pradesh</option>
        <option>Maharashtra</option>
        <option>Karnataka</option>
        <option>Tamil Nadu</option>
        <option>Telangana</option>
      </select>
    </div>

    <div className="col-md-3">
      <label className="form-label">Location Pref 3</label>
      <select
        className="form-control"
        name="location3"
        value={applyForm.location3}
        onChange={handleInputChange}
      >
        <option value="">Select Location</option>
        <option>Hyderabad</option>
        <option>Mumbai</option>
        <option>Bangalore</option>
        <option>Chennai</option>
        <option>Delhi</option>
      </select>
    </div>

   <div className="col-md-3">
      <label className="form-label">
        Expected CTC (in Lakhs) <span className="text-danger">*</span>
      </label>
      <input
        type="text"
        className="form-control"
        name="ctc"
        value={applyForm.ctc}
        onChange={handleInputChange}
        placeholder="Enter expected CTC"
      />
    </div>

    <div className="col-md-3">
      <label className="form-label">
        Exam/ Interview Center <span className="text-danger">*</span>
      </label>
      <select
        className="form-control"
        name="examCenter"
        value={applyForm.examCenter}
        onChange={handleInputChange}
      >
        <option value="">Select Center</option>
        <option>Hyderabad</option>
        <option>Mumbai</option>
        <option>Bangalore</option>
        <option>Chennai</option>
        <option>Delhi</option>
      </select>
    </div>
  </div>
</Modal.Body>

      {/* ===== FOOTER ===== */}
    <Modal.Footer className="bob-pref-footer">
  <div className="footer-btn-group">
    <button className="btn btn-outline-secondary" onClick={onHide}>
      ← Back
    </button>
  </div>
  <button 
    className="btn btn-bob-orange" 
    onClick={onPreview}
  >
    Go to Preview
  </button>
</Modal.Footer>
    </Modal>
  );
};

export default PreferenceModal;
