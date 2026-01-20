import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import deleteIcon from "../../../assets/delete-icon.png";
import viewIcon from "../../../assets/view-icon.png";
import editIcon from "../../../assets/edit-icon.png";
import profileApi from "../services/profile.api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { mapCertificationApiToUi, mapCertificationFormToApi } from "../mappers/CertificationMapper";
import BackButtonWithConfirmation from "../../../shared/components/BackButtonWithConfirmation";
import { Form } from 'react-bootstrap';
import Loader from "./Loader";
import greenCheck from '../../../assets/green-check.png'
import masterApi from "../../../services/master.api";

/* ================= HELPERS ================= */
const isFutureDate = (dateStr) =>
  dateStr && new Date(dateStr) > new Date();

const addYears = (dateStr, years) => {
  if (!dateStr) return undefined;

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;

  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split("T")[0];
};
const MAX_CERT_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_CERT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};
const isAtLeastOneYearLater = (start, end) =>
  new Date(end) >= new Date(addYears(start, 1));
/* ================= COMPONENT ================= */
const CertificationDetails = ({ goNext, goBack }) => {
  const user = useSelector((state) => state?.user?.user?.data);
  const candidateId = user?.user?.id;
  const [certList, setCertList] = useState([]);
  const [certificateFile, setCertificateFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    issuedBy: "",
    certificationMasterId: "",
    certificationName: "",
    certificationDate: "",
    expiryDate: ""
  });
  const [nextError, setNextError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasCertification, setHasCertification] = useState(false);
  const [certMasterOptions, setCertMasterOptions] = useState([]);

  /* ================= FETCH ================= */
  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getCertifications(candidateId);
      console.log("Certification masters fetched:", res.data);
      const mapped = Array.isArray(res?.data)
        ? res.data.map(mapCertificationApiToUi)
        : [];

      setCertList(mapped);
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to fetch certifications", err);
      setCertList([]);
      setIsDirty(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCertificationMasters = async () => {
      try {
        const res = await masterApi.getCertifications();
        
        const options = Array.isArray(res?.data?.data)
          ? res?.data?.data.map(c => ({
              value: c.certificationMasterId,
              label: c.certificationName
            }))
          : [];

        setCertMasterOptions(options);
      } catch (err) {
        console.error("Failed to fetch certification masters", err);
        setCertMasterOptions([]);
      }
    };

    fetchCertificationMasters();
  }, []);

  useEffect(() => {
    if (candidateId && hasCertification) {
      fetchCertifications();
    }
  }, [candidateId, hasCertification]);

  useEffect(() => {
    if (!candidateId) return;

    const initHasCertification = async () => {
      try {
        const res = await profileApi.getHasCertification(candidateId);
        const hasCert = Boolean(res?.data);

        setHasCertification(hasCert);

        // If backend says YES, load certifications
        if (hasCert) {
          fetchCertifications();
        } else {
          resetForm();
          setCertList([]);
        }
      } catch (err) {
        console.error("Failed to fetch hasCertification", err);
        setHasCertification(false);
      }
    };

    initHasCertification();
  }, [candidateId]);

  const isOtherSelected = () => {
    const selected = certMasterOptions.find(
      opt => opt.value === formData.certificationMasterId
    );
    return selected?.label === "Other";
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [id]: value };

      if (id === "certificationMasterId") {
        const selected = certMasterOptions.find(opt => opt.value === value);

        if (selected?.label === "Other") {
          // Enable manual entry
          updated.certificationName = "";
        } else {
          // Lock name to selected certification
          updated.certificationName = selected?.label || "";
        }
      }

      if (id === "certificationDate") {
        updated.expiryDate = "";
      }
      return updated;
    });
    setIsDirty(true);

    if (formErrors[id]) {
      setFormErrors((p) => ({ ...p, [id]: "" }));
    }

    setNextError(""); // ✅ CLEAR "Please add certification" error
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // 1️⃣ Validate file type
    if (!ALLOWED_CERT_TYPES.includes(file.type)) {
      setFormErrors((p) => ({
        ...p,
        certificate: "Invalid file type. Upload PDF, JPG, Word or PNG only",
      }));
      e.target.value = "";
      return;
    }
    // 2️⃣ Validate file size (2 MB)
    if (file.size > MAX_CERT_FILE_SIZE_BYTES) {
      setFormErrors((p) => ({
        ...p,
        certificate: "File size must be 2 MB or less",
      }));
      e.target.value = "";
      return;
    }
    // 3️⃣ Accept file
    setCertificateFile(file);
    setIsDirty(true);
    setExistingDocument(null);
    setFormErrors((p) => ({ ...p, certificate: "" }));
    setNextError("");
  };
  const handleBrowse = () => {
    document.getElementById("certInput").click();
  };
  /* ================= VALIDATION ================= */
  const validateForm = () => {
    if (!hasCertification) {
      setFormErrors({});
      return true;
    }
    const errors = {};

    if (!formData.certificationMasterId) {
      errors.certificationMasterId = "This field is required";
    }

    if (!formData.issuedBy.trim()) {
      errors.issuedBy = "This field is required";
    }

    if (isOtherSelected() && !formData.certificationName.trim()) {
      errors.certificationName = "This field is required";
    }

    if (!formData.certificationDate) {
      errors.certificationDate = "This field is required";
    } else if (isFutureDate(formData.certificationDate)) {
      errors.certificationDate = "Certification date cannot be in the future";
    }

    if (formData.expiryDate) {
      if (
        new Date(formData.expiryDate) <
        new Date(formData.certificationDate)
      ) {
        errors.expiryDate =
          "Expiry date cannot be before certification date";
      }
    }

    // Expiry Date — OPTIONAL
    // if (formData.expiryDate) {
    //   if (
    //     new Date(formData.expiryDate) <=
    //     new Date(formData.certificationDate)
    //   ) {
    //     errors.expiryDate = "Expiry date must be after certification date";
    //   } else if (
    //     !isAtLeastOneYearLater(
    //       formData.certificationDate,
    //       formData.expiryDate
    //     )
    //   ) {
    //     errors.expiryDate =
    //       "Expiry date must be at least 1 year after certification date";
    //   } else if (
    //     new Date(formData.expiryDate) >
    //     new Date(addYears(formData.certificationDate, 30))
    //   ) {
    //     errors.expiryDate = "Expiry date is unrealistically far";
    //   }
    // }

    if (!certificateFile && !existingDocument) {
      errors.certificate = "This field is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = mapCertificationFormToApi(
        formData,
        candidateId,
        isEditMode ? editingRow?.certificateId : null, // ✅ REQUIRED
        certificateFile,
        existingDocument
      );
      console.log("Payload to save:", payload);
      setLoading(true);

      await profileApi.saveCertification(
        candidateId,
        payload,
        certificateFile instanceof File ? certificateFile : undefined
      );

      toast.success(isEditMode ? "Updated successfully" : "Saved successfully");
      setIsDirty(false);
      setNextError("");
      resetForm();
      fetchCertifications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save certification");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = () => {
    if (!hasCertification) {
      setNextError("");
      goNext();
      return;
    }

    if (certList.length === 0) {
      setNextError("Please add at least one certification before proceeding");
      return;
    }

    setNextError("");
    goNext();
  };

  const resetForm = () => {
    setFormData({
      issuedBy: "",
      certificationMasterId: "",
      certificationName: "",
      certificationDate: "",
      expiryDate: ""
    });
    setCertificateFile(null);
    setExistingDocument(null);
    setIsEditMode(false);
    setEditingRow(null);
    setFormErrors({});
  };
  /* ================= EDIT / DELETE ================= */
  const handleEdit = (row) => {
    setIsEditMode(true);
    setEditingRow(row);
    setFormData({
      issuedBy: row.issuedBy,
      certificationMasterId: row.certificationMasterId,
      certificationName: row.certificationName,
      certificationDate: row.certificationDate,
      expiryDate: row.expiryDate || ""
    });
    setExistingDocument(row.certificate);
    setCertificateFile(null);
    setNextError(""); 
  };
  const handleDelete = async (row) => {
    try {
      setLoading(true);
      console.log("Deleting certificateId:", row);
      await profileApi.deleteCertification(row.certificateId);
      toast.success("Deleted successfully");
      fetchCertifications();
      if (editingRow?.certificationId === row.certificationId) resetForm();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = () => {
		// CASE 1: Newly uploaded file (local preview)
		if (certificateFile instanceof File) {
			const fileURL = URL.createObjectURL(certificateFile);
			window.open(fileURL, "_blank");

			// Prevent memory leaks
			setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
			return;
		}

		// CASE 2: Existing document from API
		if (existingDocument?.fileUrl) {
			window.open(existingDocument.fileUrl, "_blank");
			return;
		}

		toast.error("No certificate available to view");
	};

  const handleHasCertificationToggle = async (checked) => {
    setHasCertification(checked);
    setNextError(""); // ✅ CLEAR ERROR IMMEDIATELY

    try {
      await profileApi.saveHasCertification(candidateId, checked);
      setIsDirty(false);

      if (!checked) {
        resetForm();
        setCertList([]);
      } else {
        fetchCertifications();
      }
    } catch (err) {
      setHasCertification((prev) => !prev);
      toast.error("Failed to update certification status");
    }
  };


  /* ================= UI ================= */
  return (
    <div className="px-4 py-3 border rounded bg-white">
      {certList.length === 0 && (
        <div className="col-md-3 col-sm-12 d-flex align-items-center gap-2 p-2 rounded" style={{ backgroundColor: "rgb(255, 247, 237)", border: "1px solid rgb(231, 148, 109)", width: "fit-content" }}>
          <Form.Check
            type="checkbox"
            id="hasCertification"
            label="I hold certification(s)"
            checked={hasCertification}
            onChange={(e) =>
              handleHasCertificationToggle(e.target.checked)
            }
            style={{ fontSize: "14px", color: "rgb(110, 110, 110)", fontWeight: "500" }}
          />
        </div>
      )}
      {nextError && (
        <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
          {nextError}
        </div>
      )}
      <form className="row g-4 mt-2" noValidate>
        <div className="col-md-4">
          <label className="form-label">
            Certification {hasCertification && <span className="text-danger">*</span>}
          </label>

          <select
            id="certificationMasterId"
            disabled={!hasCertification}
            value={formData.certificationMasterId}
            onChange={handleChange}
            className={`form-select ${formErrors.certificationMasterId ? "is-invalid" : ""}`}
          >
            <option value="">Select certification</option>
            {certMasterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="invalid-feedback">
            {formErrors.certificationMasterId}
          </div>
        </div>

        {/* Name */}
        <div className="col-md-4">
          <label className="form-label">
            Certification Name {isOtherSelected() && <span className="text-danger">*</span>}
          </label>
          <input id="certificationName" disabled={!hasCertification || !isOtherSelected()} className={`form-control ${formErrors.certificationName ? "is-invalid" : ""}`} value={formData.certificationName} onChange={handleChange} />
          <div className="invalid-feedback">{formErrors.certificationName}</div>
        </div>

        {/* Issued By */}
        <div className="col-md-4">
          <label className="form-label">
            Certification Issued By {hasCertification && <span className="text-danger">*</span>}
          </label>
          <input id="issuedBy" disabled={!hasCertification} className={`form-control ${formErrors.issuedBy ? "is-invalid" : ""}`} value={formData.issuedBy} onChange={handleChange} />
          <div className="invalid-feedback">{formErrors.issuedBy}</div>
        </div>

        {/* Certification Date */}
        <div className="col-md-4">
          <label className="form-label">
            Certification Date {hasCertification && <span className="text-danger">*</span>}
          </label>
          <input type="date" id="certificationDate" disabled={!hasCertification} className={`form-control ${formErrors.certificationDate ? "is-invalid" : ""}`} value={formData.certificationDate} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
          <div className="invalid-feedback">{formErrors.certificationDate}</div>
        </div>

        {/* Expiry Date */}
        <div className="col-md-4">
          <label className="form-label">
            Expiry Date, if any
          </label>
          <input type="date" id="expiryDate" disabled={!hasCertification} className={`form-control ${formErrors.expiryDate ? "is-invalid" : ""}`} value={formData.expiryDate} onChange={handleChange} min={formData.certificationDate} />
          <div className="invalid-feedback">{formErrors.expiryDate}</div>
        </div>

        {/* Upload */}
        <div className="col-md-4">
          <label className="form-label">
            Upload Certificate {hasCertification && <span className="text-danger">*</span>}
          </label>

          <div
            className={`form-control d-flex align-items-center justify-content-center ${!hasCertification ? "uploadcertification" : ""
              } ${formErrors.certificate ? "is-invalid" : ""}`}
            style={{
              minHeight: "100px", cursor: hasCertification ? "pointer" : "not-allowed",
              pointerEvents: hasCertification ? "auto" : "none"
            }}
            onClick={hasCertification ? handleBrowse : undefined}
          >
            {!certificateFile && !existingDocument && (
              <div className="text-center">
                <FontAwesomeIcon icon={faUpload} className="mb-2" />
                <div>Click to upload or drag and drop</div>

                {/* helper text */}
                <small
                  className={`d-block mt-1 ${hasCertification ? "text-muted" : "text-muted opacity-75"
                    }`}
                >
                  PDF, JPG, Word or PNG (Max 2MB)
                </small>
              </div>
            )}
            {(certificateFile || existingDocument) && (
              <div className="d-flex justify-content-between w-100">
                <div className="d-flex align-items-center gap-2">
                  <img src={greenCheck} className="text-success" style={{ width: '22px', height: '22px' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {certificateFile?.name || existingDocument?.displayName}
                    </div>

                    {/* FILE SIZE — only for newly uploaded file */}
                    {certificateFile && (
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        {formatFileSize(certificateFile.size)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={viewIcon}
                    width={25}
                    height={25}
                    alt="View"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCertificate();
                    }}
                  />

                  <img src={deleteIcon} width={25} height={25} alt="Delete" onClick={(e) => {
                    e.stopPropagation();
                    if (!hasCertification) return;
                      setCertificateFile(null);
                      setExistingDocument(null);
                      // Reset file input so the same file can be uploaded again
                      const fileInput = document.getElementById("certInput");
                      if (fileInput) fileInput.value = "";
                      setFormErrors((p) => ({ ...p, certificate: "" }));
                    }}
                    style={{ cursor: hasCertification ? "pointer" : "not-allowed", opacity: hasCertification ? 1 : 0.5 }}
                  />
                </div>
              </div>
            )}
            <input id="certInput" type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileChange} disabled={!hasCertification} />
          </div>
          {hasCertification && formErrors.certificate && (
            <div className="invalid-feedback d-block">
              {formErrors.certificate}
            </div>
          )}
        </div>
        {/* ACTIONS */}
        <div className="d-flex justify-content-end gap-3">
          <button
            type="button" onClick={handleSave} disabled={!hasCertification} className={`btn blue-button px-4 ${!hasCertification ? "disabled bg-light text-muted border" : ""}`}
            style={{ cursor: !hasCertification ? "not-allowed" : "pointer" }}>
            {isEditMode ? "Update" : "Submit"}
          </button>
          {isEditMode && (
            <button type="button" className="btn btn-outline-secondary text-muted" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="d-none d-md-block w-100">
          <table className="w-100">
            <thead>
              <tr>
                <th className="profile_table_th text-center">S.No</th>
                <th className="profile_table_th">Certification Issued By</th>
                <th className="profile_table_th">Certification Name</th>
                <th className="profile_table_th">Certification Date</th>
                <th className="profile_table_th">Expiry Date, If any</th>
                <th className="profile_table_th">Action</th>
              </tr>
            </thead>
            <tbody>
              {certList.map((c, i) => (
                <tr key={i}>
                  <td className="profile_table_td text-center">{i + 1}</td>
                  <td className="profile_table_td">{c.issuedBy}</td>
                  <td className="profile_table_td">{c.certificationName}</td>
                  <td className="profile_table_td">{c.certificationDate}</td>
                  <td className="profile_table_td">{c.expiryDate || "-"}</td>
                  <td className="profile_table_td">
                    <div className="d-flex gap-2">
                      <div>
                        <img
                          src={viewIcon}
                          alt="View"
                          style={{ width: "25px", cursor: "pointer" }}
                          onClick={() => window.open(c.certificate?.fileUrl, "_blank")}
                        />
                      </div>
                      <div>
                        <img src={editIcon} alt="Edit" style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleEdit(c)} />
                      </div>
                      <div>
                        <img src={deleteIcon} alt="Delete" style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="d-block d-md-none">
          {certList.map((c, i) => (
            <div
              key={c.certificationId}
              className="border rounded p-3 mb-3 bg-white shadow-sm"
            >
              <div className="d-flex justify-content-between mb-2">
                <strong>Certification #{i + 1}</strong>
                <div className="d-flex gap-2">
                  <div>
                    <img
                      src={viewIcon}
                      alt="View"
                      style={{ width: "25px", cursor: "pointer" }}
                      onClick={() => window.open(c.certificate?.fileUrl, "_blank")}
                    />
                  </div>
                  <div>
                    <img src={editIcon} alt="Edit" style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleEdit(c)} />
                  </div>
                  <div>
                    <img src={deleteIcon} alt="Delete" style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                  </div>
                </div>
              </div>

              <div className="mb-1">
                <small className="text-muted">Issued By</small>
                <div className='wrap-text'>{c.issuedBy}</div>
              </div>

              <div className="mb-1">
                <small className="text-muted">Certification</small>
                <div className='wrap-text'>{c.certificationName}</div>
              </div>

              <div className="mb-1">
                <small className="text-muted">Certification Date</small>
                <div className='wrap-text'>{c.certificationDate}</div>
              </div>

              <div>
                <small className="text-muted">Expiry Date</small>
                <div className='wrap-text'>{c.expiryDate || "-"}</div>
              </div>
            </div>
          ))}
        </div>

        {/* NAV */}
        <div className="d-flex justify-content-between">
          <BackButtonWithConfirmation goBack={goBack} isDirty={isDirty} />
          <button
            type="button"
            className="btn btn-primary"
            style={{
              backgroundColor: "rgb(255, 112, 67)",
              border: "medium",
              padding: "0.6rem 2rem",
              borderRadius: "4px",
              color: "#fff",
              fontSize: '0.875rem'
            }}
            onClick={handleSaveAndNext}
          >
            Save & Next
            <FontAwesomeIcon icon={faChevronRight} size='sm' className="ms-2" />
          </button>
        </div>

      </form>

      {loading && (
        <Loader />
      )}

    </div >
  );
};

export default CertificationDetails;
