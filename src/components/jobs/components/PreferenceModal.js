import React from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import "../../../css/PreferenceModal.css";
import { toast } from "react-toastify";
import bulb from "../../../assets/bulb-icon.png";
const PreferenceModal = ({
  show,
  onHide,
  selectedJob,
  applyForm,
  onApplyFormChange,
  onPreview,
  states = [],
  locations = [],
}) => {

  console.log("selectedjob",selectedJob)
  // ✅ Helper: Get cities based on selected state ID
  const getCitiesByState = (stateId) => {
    if (!stateId) return [];
    return locations.filter((l) => l.state_id === stateId);
  };

  // // Helper: Get state name by ID
  // const getStateNameById = (stateId) => {
  //   const state = states.find(s => s.state_id === stateId);
  //   return state ? state.state_name : '';
  // };

  // ✅ Handle state/location change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent duplicate locations
    if (name.startsWith("state")) {
      const selected = [
        applyForm.state1,
        applyForm.state2,
        applyForm.state3,
      ].filter(Boolean);

      if (selected.includes(value)) {
        toast.info("This state is already selected in another preference.");
        return;
      }
    }

    // Reset corresponding location when state changes
    if (name.startsWith("state")) {
      const index = name.slice(-1);
      onApplyFormChange(`state${index}`, value);
      onApplyFormChange(`location${index}`, ""); // reset linked location
    } else {
      onApplyFormChange(name, value);
    }
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
        <div className="bob-pref-advt">
          <span>Digital Contractual 2025</span>
        </div>

        <div className="bob-pref-position">
          {selectedJob?.position_title ||
            "Deputy Manager : Product - ONDC (Open Network for Digital Commerce)"}
        </div>
      </div>
    </Modal.Header>

      {/* ===== BODY ===== */}
      <Modal.Body className="bob-pref-body">
        <h5 className="bob-pref-title">Add Preference</h5>

        <div className="row g-4">
          {/* ---- Row 1 ---- */}
          <div className="col-md-3">
            <label className="form-label">State preference 1</label>
            <select
              className="form-control"
              name="state1"
              value={applyForm.state1}
              onChange={handleInputChange}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.state_id} value={s.state_id}>
                  {s.state_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Location preference 1</label>
            <select
              className="form-control"
              name="location1"
              value={applyForm.location1}
              onChange={handleInputChange}
              disabled={!applyForm.state1}
            >
              <option value="">Select Location</option>
              {getCitiesByState(applyForm.state1).map((loc) => (
                <option key={loc.city_id} value={loc.city_id}>
                  {loc.city_name}
                </option>
              ))}
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
              {states.map((s) => (
                <option key={s.state_id} value={s.state_id}>
                  {s.state_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Location preference 2</label>
            <select
              className="form-control"
              name="location2"
              value={applyForm.location2}
              onChange={handleInputChange}
              disabled={!applyForm.state2}
            >
              <option value="">Select Location</option>
              {getCitiesByState(applyForm.state2).map((loc) => (
                <option key={loc.city_id} value={loc.city_id}>
                  {loc.city_name}
                </option>
              ))}
            </select>
          </div>

          {/* ---- Row 2 ---- */}
          <div className="col-md-3">
            <label className="form-label">State preference 3</label>
            <select
              className="form-control"
              name="state3"
              value={applyForm.state3}
              onChange={handleInputChange}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.state_id} value={s.state_id}>
                  {s.state_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Location Pref 3</label>
            <select
              className="form-control"
              name="location3"
              value={applyForm.location3}
              onChange={handleInputChange}
              disabled={!applyForm.state3}
            >
              <option value="">Select Location</option>
              {getCitiesByState(applyForm.state3).map((loc) => (
                <option key={loc.city_id} value={loc.city_id}>
                  {loc.city_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">
              Expected CTC(in Lakhs) 
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
    <input
      type="text"
      className="form-control"
      name="examCenter"
      value={applyForm.examCenter}
      onChange={handleInputChange}
      placeholder="Enter exam center"
    />
  </div>

          {/* ✅ INFO TEXT HERE */}
          <div className="bob-pref-info-bottom">
            <img 
    src={bulb}
    alt="Info" 
    style={{ width: '18px', height: '18px' }} 
  />
            <span>
              All personal information will be automatically retrieved from the candidate's profile.
            </span>
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
        <button className="btn btn-bob-orange" onClick={onPreview}>
          Go to Preview
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreferenceModal;
