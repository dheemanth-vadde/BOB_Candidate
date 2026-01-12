export const mapCertificationFormToApi = (
  formData,
  candidateId,
  certificateId,
  file
) => ({
  certificateId: certificateId ?? null, // ✅ THIS decides insert vs update
  candidateId,
  issuedBy: formData.issuedBy,
  certificationName: formData.certificationName,
  certificationDate: formData.certificationDate,
  expiryDate: formData.expiryDate || null,
  certificateFileName: file?.name || null,
  certificationId: formData.certificationMasterId
});



export const mapCertificationApiToUi = (apiItem) => {
  const cert = apiItem?.certifications || {};
  const doc = apiItem?.documentStore || null;

  return {
    // identifiers
    certificateId: cert.certificateId,
    certificationMasterId: cert.certificationId || "",

    // certification fields
    issuedBy: cert.issuedBy || "",
    certificationName: cert.certificationName || "",
    certificationDate: cert.certificationDate || "",
    expiryDate: cert.expiryDate || "",

    // document (used for edit + preview)
    certificate: doc
      ? {
          id: doc.id,
          fileUrl: doc.fileUrl,
          fileName: doc.fileName,
          displayName: doc.displayName,
          uploadedDate: doc.uploadedDate,
        }
      : null,
  };
};
