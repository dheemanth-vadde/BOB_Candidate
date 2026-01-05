import React, { useEffect, useRef, useState } from 'react';
import UploadField from '../../../shared/components/UploadField';
import { useSelector } from 'react-redux';
import profileApi from '../services/profile.api';
import { toast } from 'react-toastify';

const DocumentDetails = ({ goNext, goBack, setActiveTab }) => {
  const [isFresher, setIsFresher] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const user = useSelector((state) => state?.user?.user?.data);
  const candidateId = user?.user?.id;

  const photoDoc = useSelector((state) =>
    state.documentTypes?.list?.data?.find(doc => doc.docCode === "PHOTO") || null
  );
  const signDoc = useSelector((state) =>
    state.documentTypes?.list?.data?.find(doc => doc.docCode === "SIGN") || null
  );
  const idProofDoc = useSelector((state) =>
    state.documentTypes?.list?.data?.find(doc => doc.docCode === "IDPROOF") || null
  );
  const payslipDoc1 = useSelector((state) =>
    state.documentTypes?.list?.data?.find(doc => doc.docCode === "PAYSLIP1") || null
  );
  const payslipDoc2 = useSelector((state) =>
    state.documentTypes?.list?.data?.find(doc => doc.docCode === "PAYSLIP2") || null
  );
  const payslipDoc3 = useSelector((state) =>
    state.documentTypes?.list?.data?.find(doc => doc.docCode === "PAYSLIP3") || null
  );
  const othersDoc = useSelector((state) =>
    state.documentTypes?.list?.data?.find(doc => doc.docCode === "OTHERS") || null
  );

  const uploadFieldsConfig = [
    { key: "photo", label: "Photo", required: true, docCode: photoDoc?.docCode, documentId: photoDoc?.documentTypeId },
    { key: "signature", label: "Signature", required: true, docCode: signDoc?.docCode, documentId: signDoc?.documentTypeId },
    { key: "idProof", label: "ID Proof", required: true, docCode: idProofDoc?.docCode, documentId: idProofDoc?.documentTypeId },
    { key: "salary1", label: "Last 3 Month Salary Slip - Month 1", required: true, docCode: payslipDoc1?.docCode, documentId: payslipDoc1?.documentTypeId },
    { key: "salary2", label: "Last 3 Month Salary Slip - Month 2", required: true, docCode: payslipDoc2?.docCode, documentId: payslipDoc2?.documentTypeId },
    { key: "salary3", label: "Last 3 Month Salary Slip - Month 3", required: true, docCode: payslipDoc3?.docCode, documentId: payslipDoc3?.documentTypeId },
    { key: "other", label: "Others - Name", required: false, customName: true, docCode: othersDoc?.docCode, documentId: othersDoc?.documentTypeId }
  ];

  const [files, setFiles] = useState({});
  const [customNames, setCustomNames] = useState({});
  const fileInputRefs = useRef({});

  const payslipDocCodes = [
    payslipDoc1?.docCode,
    payslipDoc2?.docCode,
    payslipDoc3?.docCode
  ].filter(Boolean);

  /* ================= FRESHER STATUS (BACKEND ONLY) ================= */
  useEffect(() => {
    const fetchFresherStatus = async () => {
      if (!candidateId) return;

      try {
        const res = await profileApi.getWorkStatus(candidateId);
        let fresherStatus = false;

        if (
          res?.data === true ||
          res?.data === "true" ||
          res?.data === 1 ||
          res?.data === "1"
        ) {
          fresherStatus = true;
        } else if (typeof res?.data === "object" && res.data !== null) {
          if (typeof res.data.isFresher !== "undefined") {
            fresherStatus = Boolean(res.data.isFresher);
          } else if (typeof res.data.data !== "undefined") {
            fresherStatus = Boolean(res.data.data);
          }
        }

        setIsFresher(fresherStatus);
      } catch (err) {
        console.error("Failed to fetch work status", err);
        setIsFresher(false);
      }
    };

    fetchFresherStatus();
  }, [candidateId]);

  /* ========== CLEAR PAYSLIPS WHEN FRESHER = TRUE ========== */
  useEffect(() => {
    if (!isFresher) return;

    setFiles(prev => {
      const updated = { ...prev };
      delete updated.salary1;
      delete updated.salary2;
      delete updated.salary3;
      return updated;
    });

    setFormErrors(prev => {
      const updated = { ...prev };
      delete updated.salary1;
      delete updated.salary2;
      delete updated.salary3;
      return updated;
    });
  }, [isFresher]);

  /* ================= FETCH EXISTING DOCUMENTS ================= */
  const fetchDocuments = async () => {
    if (!candidateId) return;

    try {
      const res = await profileApi.getDocumentDetails(candidateId);
      const docs = (res?.data || []).filter(d => d.documentId !== null);
      const populatedFiles = {};

      for (const field of uploadFieldsConfig) {
        if (!field.documentId) continue;

        const matchedDocs = docs.filter(d => d.documentId === field.documentId);
        if (!matchedDocs.length) continue;

        const latest = matchedDocs.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        )[0];

        populatedFiles[field.key] = {
          name: latest.displayName ?? latest.fileName,
          fileName: latest.fileName,
          displayName: latest.displayName,
          url: latest.fileUrl,
          documentTypeId: latest.documentId,
          isFromApi: true
        };
      }

      setFiles(populatedFiles);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  useEffect(() => {
    const allDocIdsReady = uploadFieldsConfig.every(
      f => !f.required || f.documentId
    );
    if (!candidateId || !allDocIdsReady) return;
    fetchDocuments();
  }, [
    candidateId,
    photoDoc?.documentTypeId,
    signDoc?.documentTypeId,
    idProofDoc?.documentTypeId,
    payslipDoc1?.documentTypeId,
    payslipDoc2?.documentTypeId,
    payslipDoc3?.documentTypeId
  ]);

  const handleBrowse = (key) => {
    fileInputRefs.current[key].click();
  };

  const uploadDocument = async (field, file) => {
    if (!candidateId || !field.documentId) return;

    try {
      const skipValidation =
        ["PHOTO", "SIGN", "OTHERS"].includes(field.docCode) ||
        field.customName === true;

      if (!skipValidation) {
        try {
          await profileApi.ValidateDocument(field.docCode, file);
        } catch {
          toast.error("Invalid Certificate");
          return false;
        }
      }

      await profileApi.postDocumentDetails(
        candidateId,
        field.documentId,
        file,
        field.docCode === "Others",
        customNames[field.key]
      );

      return true;
    } catch (err) {
      console.error(`Upload failed for ${field.label}`, err);
    }
  };

  const handleFileChange = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const field = uploadFieldsConfig.find(f => f.key === key);
    if (!field) return;

    setFormErrors(prev => ({ ...prev, [key]: '' }));

    const uploadSucceeded = await uploadDocument(field, file);
    if (uploadSucceeded) {
      setFiles(prev => ({ ...prev, [key]: file }));
    }
  };

  const handleCustomName = (key, value) => {
    setCustomNames(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const errors = {};

    uploadFieldsConfig.forEach(field => {
      const isPayslip = payslipDocCodes.includes(field.docCode);

      if (field.required && !files[field.key]) {
        if (isPayslip && isFresher) return;
        errors[field.key] = "This field is required";
      }
    });

    setFormErrors(errors);
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      document
        .getElementById(`upload-${firstKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      await profileApi.saveProfileComplete(candidateId, true);
      toast.success("Profile completed successfully");
      setActiveTab("jobs");
      goNext();
    } catch (err) {
      console.error(err);
      toast.error("Profile completion failed");
    }
  };

  return (
    <div className="px-4 py-3 border rounded bg-white">
      <div className="row g-5 mt-0">
        {uploadFieldsConfig.map(field => {
          const isPayslip = payslipDocCodes.includes(field.docCode);
          const disabled = isPayslip && isFresher;

          return (
            <div key={field.key} className="col-md-6 col-sm-12 mt-2">
              <div id={`upload-${field.key}`}>
                <UploadField
                  label={field.label}
                  required={field.required && !(isPayslip && isFresher)}
                  file={files[field.key]}
                  customName={field.customName}
                  customNameValue={customNames[field.key]}
                  onCustomNameChange={(v) => handleCustomName(field.key, v)}
                  onBrowse={!disabled ? () => handleBrowse(field.key) : undefined}
                  onChange={!disabled ? (e) => handleFileChange(field.key, e) : undefined}
                  ref={(el) => (fileInputRefs.current[field.key] = el)}
                  isInvalid={!!formErrors[field.key]}
                  disabled={disabled}
                />
                {formErrors[field.key] && (
                  <div className="text-danger" style={{ fontSize: "0.875rem" }}>
                    {formErrors[field.key]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-outline-secondary" onClick={goBack}>
          Back
        </button>

        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#ff7043", border: "none" }}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default DocumentDetails;
