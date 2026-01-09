import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import jobsApiService from "../../jobs/services/jobsApiService";
import { toast } from "react-toastify";
const CompensationSection = ({ onSubmit, onCancel }) => {
  const fileInputRef = useRef(null);
  const [salarySlip, setSalarySlip] = useState(null);
const [currentCTC, setCurrentCTC] = useState("");
const [expectedCTC, setExpectedCTC] = useState("");
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
      setSalarySlip(e.target.files[0]);
  setErrors((prev) => ({ ...prev, salarySlip: "" }));
  };
const formatINR = (value) => {
  if (!value) return "";
  return Number(value).toLocaleString("en-IN");
};
const validateCompensation = () => {
  const newErrors = {};

  if (!currentCTC) {
    newErrors.currentCTC = "Current CTC is required";
  }

  if (!expectedCTC) {
    newErrors.expectedCTC = "Expected CTC is required";
  }

  if (
    currentCTC &&
    expectedCTC &&
    Number(expectedCTC) < Number(currentCTC)
  ) {
    newErrors.expectedCTC =
      "Expected CTC should be greater than or equal to Current CTC";
  }
 if (!salarySlip) {
    newErrors.salarySlip = "Salary slip is required";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
const handleCompensationSubmit = async () => {
  if (!validateCompensation()) return;

  try {
    setLoading(true);

    const payload = {
  //   applicationId: job?.application_id,
      currentCtc: Number(currentCTC),
      expectedCtc: Number(expectedCTC),
    };

    //await jobsApiService.updateCompensation(payload);

    toast.success("Compensation details updated successfully");
  } catch (error) {
    console.error("Compensation update failed", error);
    toast.error("Failed to update compensation details");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="query-section bank-style">
      <h6 className="section-title">Compensation Details</h6>

      <div className="row g-4">
        {/* CTC Fields */}
        <div className="col-md-6">
          <label className="form-label">
            Current CTC <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={formatINR(currentCTC)}
            onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setCurrentCTC(raw);
                setErrors((prev) => ({ ...prev, currentCTC: "" }));
            }}
            />
            {errors.currentCTC && (
                <div className="invalid-feedback d-block">{errors.currentCTC}</div>
            )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Expected CTC <span className="text-danger">*</span>
          </label>
           <input
            type="text"
            className="form-control"
            value={formatINR(expectedCTC)}
            onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setExpectedCTC(raw);
                setErrors((prev) => ({ ...prev, expectedCTC: "" }));
            }}
            />
              {errors.expectedCTC && (
                    <div className="invalid-feedback d-block">{errors.expectedCTC}</div>
                )}
        </div>

        {/* Upload Salary Slip */}
        <div className="col-md-5">
          <label className="form-label">
            Upload Latest Salary Slip <span className="text-danger">*</span>
          </label>

          <div
            className="upload-card"
            onClick={handleUploadClick}
            style={{ cursor: "pointer" }}
          >
            <FontAwesomeIcon
              icon={faUpload}
              className="text-secondary mb-2"
              size="2x"
            />

            <div className="upload-text">
              {salarySlip ? salarySlip.name : "Upload document"}
            </div>

            <div className="upload-subtext">
              PDF, DOC, DOCX, JPG, PNG
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />
          {errors.salarySlip && (
  <div className="invalid-feedback d-block">{errors.salarySlip}</div>
)}

        </div>

        {/* ACTIONS */}
        <div className="col-md-7 d-flex align-items-end justify-content-end">
          <div className="query-actions">
            <button
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              className="btn btn-primaryy"
              onClick={() => handleCompensationSubmit()}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationSection;
