import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from "react";
import profileApi from '../services/profile.api';
import { getDocCodeFromEducationLevelId, mapEducationFormToApi } from '../mappers/EducationMapper';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import deleteIcon from '../../../assets/delete-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import { hasDateCollision, isValidCollegeName, validateEndDateAfterStart, validateNonEmptyText } from '../../../shared/utils/validation';
import Loader from './Loader';
import { forwardRef, useImperativeHandle } from 'react';
import { removeParsedEducationById } from '../store/resumeSlice';
import greenCheck from '../../../assets/green-check.png'

const EducationForm = forwardRef((props, ref) => {
  const {
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
    masterData,
    refreshEducation,
    existingRanges = [],
    onDirtyChange = () => {},
    parsedId = null,
    onDelete = null
  } = props;
  const dispatch = useDispatch();
  const parsedList = useSelector((state) => state.resume?.parsed?.education || []);
  const user = useSelector((state) => state?.user?.user?.data);
  const candidateId = user?.user?.id;
  const [loading, setLoading] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  const [formErrors, setFormErrors] = useState({});
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
    // DO NOT override if GET data exists
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
    const { id, value } = e.target;
    // Clear the error for the current field when user starts typing/selecting
    setFormErrors(prev => ({
      ...prev,
      [id]: undefined
    }));

    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    onDirtyChange(true);
  };

  const handleBrowse = () => {
    document.getElementById("educationCertInput").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Clear any previous file error
    setFormErrors(prev => ({
      ...prev,
      certificateFile: undefined
    }));
    // Optional validation
    if (file.size > 2 * 1024 * 1024) {
      setFormErrors(prev => ({
        ...prev,
        certificateFile: "File size must be under 2MB"
      }));
      return;
    }
    setCertificateFile(file);
    onDirtyChange(true);
  };

  const formatFileSize = (size) => {
    if (!size) return "";
    const kb = size / 1024;
    if (kb < 1024) return kb.toFixed(1) + " KB";
    return (kb / 1024).toFixed(1) + " MB";
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    // Required fields validation
    const requiredFields = [
      { key: 'educationLevel', label: 'Education Level' },
      { key: 'college', label: 'School / College / University' },
      { key: 'from', label: 'From Date' },
      { key: 'to', label: 'To Date' },
      { key: 'percentage', label: 'Percentage/CGPA' },
      ...(showBoard ? [{ key: 'university', label: 'Board' }] : []),
      // ...(showSpecialization ? [{ key: 'specialization', label: 'Specialization' }] : []),
      { key: 'educationType', label: 'Education Type' }
    ];
    requiredFields.forEach(field => {
      if (!formData[field.key]?.toString().trim()) {
        errors[field.key] = `This field is required`;
        isValid = false;
      }
    });

    if (!formData.college?.trim()) {
      errors.college = "This field is required";
      isValid = false;
    } else if (!isValidCollegeName(formData.college)) {
      errors.college = "Only alphabets and spaces are allowed";
      isValid = false;
    }

    // Date range validation
    if (formData.from && formData.to) {
      const { isValid: isDateValid, error } = validateEndDateAfterStart(
        formData.from,
        formData.to
      );
      if (!isDateValid) {
        errors.dateRange = error || "Invalid education date range";
        isValid = false;
      }
    }
    // Certificate file validation
    if (!certificateFile && !existingDocument) {
      errors.certificateFile = "Certificate file is required";
      isValid = false;
    }
    setFormErrors(errors);
    // Scroll to first error immediately using the computed errors object
    if (!isValid) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    return { isValid, errors };
  };

  useImperativeHandle(ref, () => ({
    validate: () => validateForm(),
  }));

  const handleDelete = () => {
    if (parsedId) {
      // Check if this is a Redux-backed parsed entry or manually added entry
      const isReduxEntry = parsedList.some(e => e.__tempId === parsedId);
      
      if (isReduxEntry) {
        // Redux entry - remove from Redux
        dispatch(removeParsedEducationById(parsedId));
        if (refreshEducation) {
          refreshEducation(false);
        }
      } else {
        // Manually added entry - call parent callback to remove from local state
        if (onDelete) {
          onDelete(parsedId);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid } = validateForm();
    if (!isValid) {
      // Scroll to the first error
      const firstError = Object.keys(formErrors)[0];
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const collision = hasDateCollision({
      from: formData.from,
      to: formData.to,
      educationId,
      existingRanges
    });

    if (collision) {
      setFormErrors(prev => ({
        ...prev,
        dateRange: "These dates overlap with another education entry"
      }));
      setLoading(false);
      return;
    }

    setLoading(true)
    try {
      // Get the docCode from masterData based on the selected education level
      const selectedEducationLevel = masterData.educationLevels.find(
        level => level.documentTypeId === formData.educationLevel
      );
      const docCode = selectedEducationLevel?.docCode;
      if (!docCode) {
        toast.error("Education level docCode not found");
        return;
      }

      const normalizedFormData = {
        ...formData,
        college: formData.college
          ?.replace(/\s+/g, " ")
          .trim(),
        university: formData.university
          ?.replace(/\s+/g, " ")
          .trim(),
      };
      // Validate the document before uploading
      if (certificateFile && docCode === "BOARD") {
        const res = await profileApi.ValidateDocument(docCode, certificateFile);
        console.log(res)
        if (!res?.success) {
          toast.error(res?.message || "Invalid Certificate");
          return;
        }
      }
      const payload = mapEducationFormToApi({
        formData: normalizedFormData,
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
      onDirtyChange(false);

      // If this form came from parsed resume data, remove that parsed entry from redux by id
      if (parsedId) {
        try {
          // If there are more parsed entries remaining after this removal, do not force API refresh.
          // parsedList contains the list BEFORE removal; if its length > 1, others remain.
          const hadMultiple = Array.isArray(parsedList) && parsedList.length > 1;

          dispatch(removeParsedEducationById(parsedId));

          if (refreshEducation) {
            try {
              // Always call with forceUseApi=false so parent checks fresh parsedResume
              // Parent's fetchEducationDetails is now wrapped in useCallback with parsedResume dependency,
              // so it will have the updated Redux value after removal
              await refreshEducation(false);
            } catch (refreshErr) {
              console.error("Failed to refresh education details after save", refreshErr);
            }
          }

        } catch (e) {
          console.warn('Failed to remove parsed education from redux by id', e);
        }
      } else {
        if (refreshEducation) {
          try {
            await refreshEducation(true);
          } catch (refreshErr) {
            console.error("Failed to refresh education details after save", refreshErr);
          }
        }
      }
      // goNext();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save education");
    } finally {
      setLoading(false)
    }
  };

  if (!masterData) {
    return null; // THIS LINE FIXES CRASHES
  }

  return (
    <form className="row g-4 formfields pt-2" onSubmit={handleSubmit}>
      <div className="col-md-4 col-sm-12 mt-3">
        <label className="form-label">
          Education Level <span className="text-danger">*</span>
        </label>
        <select
          id="educationLevel"
          className={`form-select ${formErrors.educationLevel ? 'is-invalid' : ''}`}
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
            // Clear error when user selects an option
            setFormErrors(prev => ({
              ...prev,
              educationLevel: undefined,
              university: undefined
            }));
            setFormData(prev => ({
              ...prev,
              educationLevel: documentTypeId,
              educationDocCode: docCode,
              university: ""
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
      <div className="col-md-4 col-sm-12 mt-3">
        <label className="form-label">
          School/College/University <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="college"
          className={`form-control ${formErrors.college ? 'is-invalid' : ''}`}
          value={formData.college}
          onBeforeInput={(e) => {
            // block anything that is not letter or space
            if (!/^[A-Za-z ]$/.test(e.data)) {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");
            if (!/^[A-Za-z ]+$/.test(pasted)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            // only valid chars ever reach here
            setFormErrors(prev => ({ ...prev, college: undefined }));
            setFormData(prev => ({ ...prev, college: e.target.value }));
          }}
        />
        {formErrors.college && (
          <div className="invalid-feedback">{formErrors.college}</div>
        )}
      </div>

      {/* University */}
      {showBoard && (
        <div className="col-md-4 col-sm-12 mt-3">
          <label htmlFor="university" className="form-label">
            Board <span className="text-danger">*</span>
          </label>
          <select
            id="university"
            className={`form-select ${formErrors.university ? 'is-invalid' : ''}`}
            value={formData.university}
            disabled={!formData.educationLevel}
            onChange={handleChange}
          >
            <option value="">Select Board</option>
            {masterData?.boards.filter(b => b.levelId === formData.educationLevel).map(e => (
              <option key={e.educationQualificationsId} value={e.educationQualificationsId}>
                {e.qualificationCode}
              </option>
            ))}
          </select>
          {formErrors.university && (
            <div className="invalid-feedback">{formErrors.university}</div>
          )}

        </div>
      )}

      {/* From */}
      <div className="col-md-4 col-sm-12 mt-3">
        <label className="form-label">From <span className="text-danger">*</span></label>
        <input
          type="date"
          id="from"
          className={`form-control ${formErrors.from || formErrors.dateRange ? 'is-invalid' : ''}`}
          value={formData.from}
          onChange={handleChange}
          max={new Date().toISOString().split("T")[0]}
        />
        {formErrors.from && (
          <div className="invalid-feedback">{formErrors.from}</div>
        )}
        {formErrors.dateRange && !formErrors.from && !formErrors.to && (
          <div className="invalid-feedback">{formErrors.dateRange}</div>
        )}
      </div>

      {/* To */}
      <div className="col-md-4 col-sm-12 mt-3">
        <label className="form-label">To <span className="text-danger">*</span></label>
        <input type="date" id="to" className={`form-control ${formErrors.to || formErrors.dateRange ? 'is-invalid' : ''}`} onChange={handleChange} value={formData.to} min={formData.from || undefined} max={new Date().toISOString().split("T")[0]} />
        {formErrors.to && (
          <div className="invalid-feedback">{formErrors.to}</div>
        )}
        {formErrors.dateRange && !formErrors.from && !formErrors.to && (
          <div className="invalid-feedback">{formErrors.dateRange}</div>
        )}
      </div>

      {/* Percentage */}
      <div className="col-md-4 col-sm-12 mt-3">
        <label className="form-label">Percentage/CGPA <span className="text-danger">*</span></label>
        <input
          type="number"
          min={0}
          max={100}
          id="percentage"
          className={`form-control ${formErrors.percentage ? 'is-invalid' : ''}`}
          value={formData.percentage}
          onChange={(e) => {
            let value = e.target.value;
            // Clear error when user starts typing
            setFormErrors(prev => ({
              ...prev,
              percentage: undefined
            }));

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
        {formErrors.percentage && (
          <div className="invalid-feedback">{formErrors.percentage}</div>
        )}
      </div>

      {/* SPECIALIZATION → only visible if showSpecialization = true */}
      {showSpecialization && (
        <div className="col-md-4 col-sm-12 mt-3">
          <label className="form-label">Specialization</label>
          <select
            id="specialization"
            className={`form-select ${formErrors.specialization ? 'is-invalid' : ''}`}
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
          {formErrors.specialization && (
            <div className="invalid-feedback">{formErrors.specialization}</div>
          )}
        </div>
      )}

      <div className="col-md-4 col-sm-12 mt-3">
        <label className="form-label">Education Type <span className="text-danger">*</span></label>
        <select
          id="educationType"
          className={`form-select ${formErrors.educationType ? 'is-invalid' : ''}`}
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
        {formErrors.educationType && (
          <div className="invalid-feedback">{formErrors.educationType}</div>
        )}
      </div>

      <div className="col-md-4 col-sm-12 mt-3">
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
              <img
                src={greenCheck}
                style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#42579f" }}>
                  {existingDocument.displayName ?? existingDocument.fileName}
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
              {/* Delete */}
              <img
                src={deleteIcon}
                alt="Delete"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={() => {
                  setExistingDocument(null);
                  setCertificateFile(null);
                }}
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
              <img
                src={greenCheck}
                style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
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
        {formErrors.certificateFile && (
          <div className="invalid-feedback d-block">{formErrors.certificateFile}</div>
        )}
      </div>

      <div className="d-flex justify-content-center gap-2 mt-2">
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
        {parsedId && (
          <button
            type="button"
            className="btn btn-danger mt-3"
            onClick={handleDelete}
            style={{
              border: "1px solid #dc3545",
              backgroundColor: 'white',
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              color: "#dc3545"
            }}>
            Delete
          </button>
        )}
      </div>

      {loading && (
				<Loader />
			)}
    </form>
  );
});

export default EducationForm;
