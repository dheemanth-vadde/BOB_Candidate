import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from "react";

const EducationForm = ({
  goNext,
  showDegree = true,
  showSpecialization = true
}) => {

  const [certificateFile, setCertificateFile] = useState(null);

  const [formData, setFormData] = useState({
    university: "",
    college: "",
    degree: "Intermediate",
    from: "",
    to: "",
    percentage: "",
    specialization: "",
    educationType: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setCertificateFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goNext();
  };

  return (
    <form className="row g-4 formfields pt-1" onSubmit={handleSubmit}>

      {/* University */}
      <div className="col-md-4 col-sm-12 mt-2">
        <label htmlFor="university" className="form-label">
          Onboard/University <span className="text-danger">*</span>
        </label>
        <select
          id="university"
          className="form-select"
          value={formData.university}
          onChange={handleChange}
        >
          <option value="Intermediate">Intermediate</option>
          <option value="Graduate">Graduate</option>
          <option value="Post Graduate">Post Graduate</option>
        </select>
      </div>

      {/* College */}
      <div className="col-md-4 col-sm-12 mt-2">
        <label className="form-label">
          School/College <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="college"
          className="form-control"
          value={formData.college}
          onChange={handleChange}
        />
      </div>

      {/* DEGREE → only visible if showDegree = true */}
      {showDegree && (
        <div className="col-md-4 col-sm-12 mt-2">
          <label className="form-label">
            Degree <span className="text-danger">*</span>
          </label>
          <select
            id="degree"
            className="form-select"
            value={formData.degree}
            onChange={handleChange}
          >
            <option value="Intermediate">Intermediate</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
        </div>
      )}

      {/* From */}
      <div className="col-md-4 col-sm-12 mt-2">
        <label className="form-label">From <span className="text-danger">*</span></label>
        <input type="date" id="from" className="form-control" value={formData.from} onChange={handleChange} />
      </div>

      {/* To */}
      <div className="col-md-4 col-sm-12 mt-2">
        <label className="form-label">To <span className="text-danger">*</span></label>
        <input type="date" id="to" className="form-control" value={formData.to} onChange={handleChange} />
      </div>

      {/* Percentage */}
      <div className="col-md-4 col-sm-12 mt-2">
        <label className="form-label">Percentage <span className="text-danger">*</span></label>
        <input type="text" id="percentage" className="form-control" value={formData.percentage} onChange={handleChange} />
      </div>

      {/* SPECIALIZATION → only visible if showSpecialization = true */}
      {showSpecialization && (
        <div className="col-md-4 col-sm-12 mt-2">
          <label className="form-label">Specialization <span className="text-danger">*</span></label>
          <select
            id="specialization"
            className="form-select"
            value={formData.specialization}
            onChange={handleChange}
          >
            <option value="Intermediate">Intermediate</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
        </div>
      )}

      <div className="col-md-4 col-sm-12 mt-2">
        <label className="form-label">Education Type <span className="text-danger">*</span></label>
        <select
            id="educationType"
            className="form-select"
            value={formData.educationType}
            onChange={handleChange}
            >
            <option value="Intermediate">Intermediate</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
        </select>
      </div>

      {/* File Upload */}
      <div className="col-md-4 col-sm-12 mt-2">
        <label className="form-label">Education Certificate <span className="text-danger">*</span></label>

        <div
          className="border rounded d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "100px", cursor: "pointer" }}
          onClick={() => document.getElementById("educationCertInput").click()}
        >
          <FontAwesomeIcon icon={faUpload} className="me-2 text-secondary" />

          <div className="mt-2" style={{ color: "#7b7b7b", fontWeight: "500" }}>
            Click to upload or drag and drop
          </div>

          <div className="text-muted" style={{ fontSize: "12px" }}>
            Max: 2MB picture
          </div>

          <input
            id="educationCertInput"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        {certificateFile && (
          <small className="text-success mt-1 d-block">
            Selected: {certificateFile.name}
          </small>
        )}
      </div>

      <div className="d-flex justify-content-center mt-2">
        <button
          type="submit"
          className="btn btn-primary mt-3"
          style={{
            backgroundColor: "#ff7043",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            color: "#fff"
          }}>
          Save
        </button>
      </div>
    </form>
  );
};

export default EducationForm;
