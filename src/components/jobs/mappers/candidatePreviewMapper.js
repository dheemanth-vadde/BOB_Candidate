const yesNo = (value) => (value === true ? "YES" : "NO");

export const mapCandidateToPreview = (apiData = {}) => {
  const profile = apiData?.basicDetails?.candidateProfile || {};
  const address = apiData?.addressDetails || {};
  const experiences = apiData?.experienceDetails || [];

  return {
    personalDetails: {
      /* ================= BASIC ================= */
      fullName: profile.fullNameAadhar || "-",
      mobile: profile.contactNo || "-",
      email: profile.email || "-",
      motherName: profile.motherName || "-",
      fatherName: profile.fatherName || "-",
      spouseName: profile.spouseName || "-",
      dob: profile.dateOfBirth || "-",
      gender: profile.genderId || "-",
      religion: profile.religionId || "-",
      caste: profile.community || "-",
      nationality: profile.nationality || "-",
      maritalStatus: profile.maritalStatusId || "-",

      /* ================= ADDRESS ================= */
      address: `${address.addressLine1 || ""} ${address.addressLine2 || ""}`,
      permanentAddress: `${address.permanentAddressLine1 || ""} ${address.permanentAddressLine2 || ""}`,

      /* ================= GOVT / SERVICE ================= */
      centralGovtEmployment: yesNo(profile.centralGovtEmployed),
      servingLowerPost: yesNo(profile.employedInLowerPost),
      familyMember1984: yesNo(profile.riotVictimFamily),
      religiousMinority: yesNo(profile.minority),
      servingInGovt: yesNo(profile.isPublicSectorUndertaking),
      disciplinaryAction: yesNo(profile.anyDisciplinaryAction),

      /* ================= DISCIPLINARY ================= */
      disciplinaryDetails:
        profile.anyDisciplinaryAction === true
          ? profile.disciplinaryDetails || "-"
          : "-",

      /* ================= EX-SERVICE ================= */
      exService: yesNo(profile.exServiceman),
      physicalDisability: yesNo(profile.disability),

      /* ================= MISC ================= */
      location1: "-",
      location2: "-",
      location3: "-",
      currentCTC: "-",
      expectedCTC: "-",
    },

    /* ================= EXPERIENCE ================= */
    experience: experiences.map((e) => ({
      org: e.workExperience.organizationName,
      designation: e.workExperience.postHeld,
      department: e.workExperience.role,
      from: e.workExperience.fromDate,
      to: e.workExperience.isPresentlyWorking
        ? "Present"
        : e.workExperience.toDate,
      duration: `${e.workExperience.monthsOfExp} Months`,
      nature: e.workExperience.workDescription,
    })),

    experienceSummary: {
      total: `${experiences.reduce(
        (sum, e) => sum + (e.workExperience.monthsOfExp || 0),
        0
      )} Months`,
      relevant: "-",
      designation:
        experiences[0]?.workExperience?.postHeld || "-",
    },

    education: [],
  };
};
