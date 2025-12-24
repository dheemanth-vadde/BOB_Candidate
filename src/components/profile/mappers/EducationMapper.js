export const mapEducationFormToApi = ({
  formData,
  candidateId,
  educationLevelId,
  educationId = null
}) => {
  return {
    isActive: true,
    candidateId,
    educationQualificationsId: formData.university, // documentTypeId
    // educationDocCode: formData.educationDocCode,
    institutionName: formData.college,
    // universityId: formData.university,
    specializationId: formData.specialization || null,
    educationTypeId: formData.educationType,
    startDate: formData.from,
    endDate: formData.to,
    percentage: Number(formData.percentage),
    educationId
  };
};

export const getEducationLevelIdFromQualification = (
  educationQualificationsId,
  mandatoryQualifications = []
) => {
  if (!educationQualificationsId || !mandatoryQualifications.length) {
    return null;
  }

  const match = mandatoryQualifications.find(
    q => q.educationQualificationsId === educationQualificationsId
  );

  return match?.levelId || null;
};

export const getDocCodeFromEducationLevelId = (
  educationLevelId,
  educationLevels
) => {
  return (
    educationLevels.find(
      lvl => lvl.documentTypeId === educationLevelId
    )?.docCode || ""
  );
};

export const mapEducationApiToUi = (item, mandatoryQualifications = []) => {
  const edu = item.education;
  const doc = item.documentStore;

  const educationLevelId = getEducationLevelIdFromQualification(
    edu.educationQualificationsId,
    mandatoryQualifications
  );
  console.log(educationLevelId)

  return {
    educationId: edu.educationId,
    educationLevel: educationLevelId, // documentTypeId
    educationDocCode: doc ? doc.fileName.split("_")[0] : "",
    university: edu.educationQualificationsId,
    college: edu.institutionName,
    specialization: edu.specializationId || "",
    educationType: edu.educationTypeId,
    from: edu.startDate,
    to: edu.endDate,
    percentage: String(edu.percentage),
    document: doc
      ? {
          fileName: doc.fileName,
          fileUrl: doc.fileUrl
        }
      : null
  };
};
