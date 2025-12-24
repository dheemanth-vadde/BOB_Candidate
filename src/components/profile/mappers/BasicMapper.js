export const mapBasicDetailsFormToApi = ({
  formData,
  candidateId,
  createdBy,
  candidateProfileId,
  email
}) => {
  return {
    candidateProfile: {
      isActive: true,
      candidateId: candidateId,
      candidateProfileId: candidateProfileId || null,
      firstName: formData.firstName || "",
      middleName: formData.middleName || "",
      lastName: formData.lastName || "",

      fullNameAadhar: formData.fullNameAadhar || "",
      fullNameSSC: formData.fullNameSSC || "",

      genderId: formData.gender || "",
      dateOfBirth: formData.dob || null,

      maritalStatusId: formData.maritalStatus || "",
      nationality: formData.nationality || "",
      religionId: formData.religion || "",
      reservationCategoryId: formData.category || "",

      community: formData.caste || "",
      stateId: formData.casteState || "",

      motherName: formData.motherName || "",
      fatherName: formData.fatherName || "",
      spouseName: formData.spouseName || "",

      contactNo: formData.contactNumber || "",
      altContactNo: formData.altNumber || "",
      socialMediaProfileLink: formData.socialMediaLink || "",

      isTwin: Boolean(formData.twinSibling),
      twinName: formData.siblingName || "",
      twinGenderId: formData.twinGender || "",

      disability: Boolean(formData.isDisabledPerson),
      disabilityCategoryId: formData.disabilityType || "",
      disabilityPercentage: Number(formData.disabilityPercentage) || 0,
      isScribeRequirement: formData.scribeRequirement === "Yes",

      exServiceman: Boolean(formData.isExService),
      serviceStartDate: formData.serviceEnrollment || null,
      serviceEndDate: formData.dischargeDate || null,
      serviceMonths: Number(formData.servicePeriod) || 0,

      centralGovtEmployed: formData.employmentSecured === "Yes",
      isPublicSectorUndertaking: formData.servingInGovt === "Yes",
      employedInLowerPost: formData.lowerPostStatus === "Yes",
      riotVictimFamily: formData.riotVictimFamily === "Yes",
      minority: formData.minorityCommunity === "Yes",
      anyDisciplinaryAction: formData.disciplinaryAction === "Yes",
      createdBy: createdBy,
      email: email,
      registrationNo: ""
    },

    languagesKnown: [
      {
        isActive: true,
        candidateId,
        languageId: formData.language1,
        canRead: formData.language1Read,
        canWrite: formData.language1Write,
        canSpeak: formData.language1Speak,
        createdBy
      },
      {
        isActive: true,
        candidateId,
        languageId: formData.language2,
        canRead: formData.language2Read,
        canWrite: formData.language2Write,
        canSpeak: formData.language2Speak,
        createdBy
      },
      {
        isActive: true,
        candidateId,
        languageId: formData.language3,
        canRead: formData.language3Read,
        canWrite: formData.language3Write,
        canSpeak: formData.language3Speak,
        createdBy
      }
    ].filter(l => l.languageId) // ✅ remove empty languages
  };
};

//  Map API → Form Fill (when editing)
export const mapBasicDetailsApiToForm = (apiData) => {
  const profile = apiData?.candidateProfile || {};
  const languages = apiData?.languagesKnown || [];

  return {
    // Personal
    firstName: profile.firstName || "",
    middleName: profile.middleName || "",
    lastName: profile.lastName || "",
    fullNameAadhar: profile.fullNameAadhar || "",
    fullNameSSC: profile.fullNameSSC || "",

    gender: profile.genderId || "",
    dob: profile.dateOfBirth || "",
    maritalStatus: profile.maritalStatusId || "",
    nationality: profile.nationality || "",
    religion: profile.religionId || "",
    category: profile.reservationCategoryId || "",
    caste: profile.community || "",
    casteState: profile.stateId || "",

    motherName: profile.motherName || "",
    fatherName: profile.fatherName || "",
    spouseName: profile.spouseName || "",
    contactNumber: profile.contactNo || "",
    altNumber: profile.altContactNo || "",
    socialMediaLink: profile.socialMediaProfileLink || "",

    // Twin
    twinSibling: Boolean(profile.isTwin),
    siblingName: profile.twinName || "",
    twinGender: profile.twinGenderId || "",

    // Disability
    isDisabledPerson: Boolean(profile.disability),
    disabilityType: profile.disabilityCategoryId || "",
    disabilityPercentage: profile.disabilityPercentage || "",
    scribeRequirement: profile.isScribeRequirement ? "Yes" : "No",
    disabilityCertificate: null,

    // Ex-Service
    isExService: Boolean(profile.exServiceman),
    serviceEnrollment: profile.serviceStartDate || "",
    dischargeDate: profile.serviceEndDate || "",
    servicePeriod: profile.serviceMonths || "",

    employmentSecured: profile.centralGovtEmployed ? "Yes" : "No",
    lowerPostStatus: profile.employedInLowerPost ? "Yes" : "No",

    riotVictimFamily: profile.riotVictimFamily ? "Yes" : "No",
    servingInGovt: profile.isPublicSectorUndertaking ? "Yes" : "No",
    minorityCommunity: profile.minority ? "Yes" : "No",
    disciplinaryAction: profile.anyDisciplinaryAction ? "Yes" : "No",

    serviceCertificate: null,

    // Languages
    language1: languages[0]?.languageId || "",
    language1Read: languages[0]?.canRead || false,
    language1Write: languages[0]?.canWrite || false,
    language1Speak: languages[0]?.canSpeak || false,

    language2: languages[1]?.languageId || "",
    language2Read: languages[1]?.canRead || false,
    language2Write: languages[1]?.canWrite || false,
    language2Speak: languages[1]?.canSpeak || false,

    language3: languages[2]?.languageId || "",
    language3Read: languages[2]?.canRead || false,
    language3Write: languages[2]?.canWrite || false,
    language3Speak: languages[2]?.canSpeak || false
  };
};
