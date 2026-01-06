export const mapCertificationFormToApi = (
  formData,
  candidateId,
  certificationId,
  file
) => ({
  certificationId: certificationId ?? null, // ✅ THIS decides insert vs update
  candidateId,
  issuedBy: formData.issuedBy,
  certificationName: formData.certificationName,
  certificationDate: formData.certificationDate,
  expiryDate: formData.expiryDate || null,
  certificateFileName: file?.name || null,
});



export const mapCertificationApiToUi = (apiItem) => {
  return {
    certificationId: apiItem.certificationId,
    issuedBy: apiItem.issuedBy,
    certificationName: apiItem.certificationName,
    certificationDate: apiItem.certificationDate,
    expiryDate: apiItem.expiryDate || "",

    // ✅ THIS IS WHAT YOU WERE MISSING
    certificate: apiItem.certificateFilePath
      ? {
          fileUrl: apiItem.certificateFilePath,
          fileName: apiItem.certificateFileName,
          displayName: apiItem.certificateFileName,
        }
      : null,
  };
};
