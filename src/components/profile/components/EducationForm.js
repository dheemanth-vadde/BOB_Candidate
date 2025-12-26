import { faCheckCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from "react";
import masterApi from '../../../services/master.api';
import profileApi from '../services/profile.api';
import { getDocCodeFromEducationLevelId, mapEducationFormToApi } from '../mappers/EducationMapper';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import deleteIcon from '../../../assets/delete-icon.png';
import editIcon from '../../../assets/edit-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import { validateEndDateAfterStart, validateNonEmptyText } from '../../../shared/utils/validation';

const EducationForm = ({
  goNext,
  educationId,
  onEducationLevelChange,
  fixedEducationLevelId,
  fixedDocumentTypeId,
  disableEducationLevel = false,
  // showDegree = true,
  showSpecialization = true,
  showBoard = true,
  existingData = null,
  masterData 
}) => {
  const user = useSelector((state) => state?.user?.user?.data);
  const candidateId = user?.user?.id;
  // const documentTypes = useSelector(
  //   (state) => state.documentTypes?.list || []
  // );
  // const boardDoc = documentTypes.find(
  //   (doc) => doc.docCode === 'PAYSLIP'
  // );
  const [certificateFile, setCertificateFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);

  const [formData, setFormData] = useState({
    university: "",
    college: "",
    degree: "Intermediate",
    from: "",
    to: "",
    percentage: "",
    specialization: "",
    educationType: "",
    educationLevel: "",
    educationDocCode: ""
  });

  useEffect(() => {
    if (!existingData) return;

    if (existingData?.document) {
      setExistingDocument(existingData.document);
    }

    setFormData(prev => ({
      ...prev,
      ...existingData
    }));
  }, [existingData]);

  useEffect(() => {
    if (existingData?.document) {
      setExistingDocument(existingData.document);
    }
  }, [existingData]);

  useEffect(() => {
    // 🔥 DO NOT override if GET data exists
    if (existingData) return;

    const fixedId = fixedEducationLevelId || fixedDocumentTypeId;
    if (!fixedId || !masterData.educationLevels.length) return;

    const selected = masterData.educationLevels.find(
      el => el.documentTypeId === fixedId
    );

    if (!selected) return;

    setFormData(prev => ({
      ...prev,
      educationLevel: fixedId,
      educationDocCode: selected.docCode
    }));
  }, [
    fixedEducationLevelId,
    fixedDocumentTypeId,
    masterData.educationLevels,
    existingData
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleBrowse = () => {
		document.getElementById("educationCertInput").click();
	};

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB");
      return;
    }

    setCertificateFile(file);
  };

  const formatFileSize = (size) => {
		if (!size) return "";
		const kb = size / 1024;
		if (kb < 1024) return kb.toFixed(1) + " KB";
		return (kb / 1024).toFixed(1) + " MB";
	};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, error } = validateEndDateAfterStart(
      formData.from,
      formData.to
    );

    if (!isValid) {
      toast.error(error || "Invalid education date range");
      return;
    }

    const textFields = [
      { key: "college", label: "School / College / University" },
    ];

    for (const field of textFields) {
      const { isValid, error } = validateNonEmptyText(
        formData[field.key],
        field.label
      );
      if (!isValid) {
        toast.error(error);
        return;
      }
    }

    try {
      if (!formData.educationLevel) {
        toast.error("Invalid education level selection");
        return;
      }
      
      // Get the docCode from masterData based on the selected education level
      const selectedEducationLevel = masterData.educationLevels.find(
        level => level.documentTypeId === formData.educationLevel
      );
      
      const docCode = selectedEducationLevel?.docCode;
      if (!docCode) {
        toast.error("Education level docCode not found");
        return;
      }
      
      const payload = mapEducationFormToApi({
        formData,
        candidateId,
        fixedEducationLevelId,
        educationId,

      });
      console.log(payload)
      await profileApi.postEducationDetails(
        candidateId,
        payload,
        certificateFile,
        docCode
      );
      toast.success("Education details saved successfully");
      // goNext();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save education");
    }
  };

    if (!masterData) {
      return null; // ⬅️ THIS LINE FIXES YOUR CRASH
    }

  return (
    <form className="row g-4 formfields pt-2" onSubmit={handleSubmit}>

      <div className="col-md-4 col-sm-12 mt-2">
        <label className="form-label">
          Education Level <span className="text-danger">*</span>
        </label>
        <select
          id="educationLevel"
          className="form-select"
          value={formData.educationLevel}
          disabled={disableEducationLevel}
          onChange={(e) => {
            if (disableEducationLevel) return;
            const documentTypeId = e.target.value;
            const selected = masterData?.educationLevels.find(
              el => el.documentTypeId === documentTypeId
            );
            const docCode = getDocCodeFromEducationLevelId(
              documentTypeId,
              masterData.educationLevels
            );

            setFormData(prev => ({
              ...prev,
              educationLevel: documentTypeId,
              educationDocCode: docCode
            }));

            if (!educationId || !onEducationLevelChange || !selected) return;

            onEducationLevelChange(
              educationId,
              selected.documentName
            );
          }}
        >
          <option value="">Select Education Level</option>
          {masterData?.educationLevels.map(e => (
            <option key={e.documentTypeId} value={e.documentTypeId}>
              {e.documentName}
            </option>
          ))}
        </select>
      </div>

      {/* DEGREE → only visible if showDegree = true
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
            <option value="B.Tech">B.Tech</option>
            <option value="BE">BE</option>
            <option value="BCom">BCom</option>
          </select>
        </div>
      )} */}

      {/* College */}
      <div className="col-md-4 col-sm-12 mt-2">
        <label className="form-label">
          School/College/University <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="college"
          className="form-control"
          value={formData.college}
          onChange={handleChange}
        />
      </div>

      {/* University */}
      {showBoard && (
        <div className="col-md-4 col-sm-12 mt-2">
          <label htmlFor="university" className="form-label">
            Board <span className="text-danger">*</span>
          </label>
          <select
            id="university"
            className="form-select"
            value={formData.university}
            onChange={handleChange}
          >
            <option value="">Select Board</option>
            {masterData?.boards.map(e => (
              <option key={e.educationQualificationsId} value={e.educationQualificationsId}>
                {e.qualificationCode}
              </option>
            ))}
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
        <input type="date" id="to" className="form-control" value={formData.to} onChange={handleChange} min={formData.from || undefined} />
      </div>

      {/* Percentage */}
      <div className="col-md-4 col-sm-12 mt-2">
        <label className="form-label">Percentage/CGPA <span className="text-danger">*</span></label>
        <input type="number" min={0} max={100} id="percentage" className="form-control" value={formData.percentage}
          onChange={(e) => {
            let value = e.target.value;
            // allow empty while typing
            if (value === "") {
              setFormData(prev => ({ ...prev, percentage: "" }));
              return;
            }
            // convert to number
            let numericValue = Number(value);
            if (Number.isNaN(numericValue)) return;
            // clamp between 0 and 100
            if (numericValue < 0) numericValue = 0;
            if (numericValue > 100) numericValue = 100;
            setFormData(prev => ({
              ...prev,
              percentage: numericValue
            }));
          }}
        />
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
            <option value="">Select Specialization</option>
            {masterData?.specializations.map(e => (
              <option key={e.specializationId} value={e.specializationId}>
                {e.specializationName}
              </option>
            ))}
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
          <option value="">Select Education Type</option>
          {masterData?.educationTypes.map(e => (
            <option key={e.educationTypeId} value={e.educationTypeId}>
              {e.educationType}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload */}
      {/* <div className="col-md-4 col-sm-12 mt-2">
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
      </div> */}

      <div className="col-md-4 col-sm-12 mt-2">
        <label htmlFor="eduCert" className="form-label">Education Certificate <span className="text-danger">*</span></label>
        {!certificateFile && !existingDocument && (
        <div
          className="border rounded d-flex flex-column align-items-center justify-content-center"
          style={{
            minHeight: "100px",
            cursor: "pointer",
            opacity: 1
          }}
          onClick={handleBrowse}
        >
          {/* Upload Icon */}
          <FontAwesomeIcon
            icon={faUpload}
            className="me-2 text-secondary"
          />

          {/* Upload Text */}
          <div className="mt-2" style={{ color: "#7b7b7b", fontWeight: "500" }}>
          Click to upload or drag and drop
          </div>

          <div className="text-muted" style={{ fontSize: "12px" }}>
          Max: 2MB picture
          </div>

          {/* Hidden File Input */}
          <input
            id="educationCertInput"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
        )}

        {existingDocument && !certificateFile && (
          <div
            className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
            style={{
              border: "2px solid #bfc8e2",
              borderRadius: "8px",
              background: "#f7f9fc"
            }}
          >
            {/* LEFT SIDE: Check icon + File name + size */}
            <div className="d-flex align-items-center">
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{ color: "green", fontSize: "22px", marginRight: "10px" }}
              />

              <div>
                <div style={{ fontWeight: 600, color: "#42579f" }}>
                  {existingDocument.fileName}
                </div>
                {/* <div className="text-muted" style={{ fontSize: "12px" }}>
                  {formatFileSize(certificateFile.size)}
                </div> */}
              </div>
            </div>

            {/* RIGHT SIDE: View / Edit / Delete */}
            <div className="d-flex gap-2">

              {/* View */}
              <img
                src={viewIcon}
                alt="View"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={() => window.open(existingDocument.fileUrl, "_blank")}
              />

              {/* Edit → triggers file re-upload */}
              {/* <img
                src={editIcon}
                alt="Edit"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={handleBrowse}
              /> */}

              {/* Delete */}
              <img
                src={deleteIcon}
                alt="Delete"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={() => setExistingDocument(null)}
              />

            </div>
          </div>
        )}

        {certificateFile && (
          <div
            className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
            style={{
              border: "2px solid #bfc8e2",
              borderRadius: "8px",
              background: "#f7f9fc"
            }}
          >
            {/* LEFT SIDE: Check icon + File name + size */}
            <div className="d-flex align-items-center">
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{ color: "green", fontSize: "22px", marginRight: "10px" }}
              />

              <div>
                <div style={{ fontWeight: 600, color: "#42579f" }}>
                  {certificateFile?.name}
                </div>
                <div className="text-muted" style={{ fontSize: "12px" }}>
                  {formatFileSize(certificateFile.size)}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: View / Edit / Delete */}
            <div className="d-flex gap-2">

              {/* View */}
              <img
                src={viewIcon}
                alt="View"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={() => window.open(URL.createObjectURL(certificateFile), "_blank")}
              />

              {/* Edit → triggers file re-upload */}
              <img
                src={editIcon}
                alt="Edit"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={handleBrowse}
              />

              {/* Delete */}
              <img
                src={deleteIcon}
                alt="Delete"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={() => setCertificateFile(null)}
              />

            </div>
          </div>
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
