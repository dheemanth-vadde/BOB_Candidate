import {
  getGender,
  getReligion,
  getNationality,
  getMaritalStatus,
  getState
} from "../../../shared/utils/masterHelpers";
export const mapCandidateToPreview = (
  apiData = {},
  masters = {}
) => {
  const profile = apiData?.basicDetails?.candidateProfile || {};
  const address = apiData?.addressDetails || {};
  const experiences = apiData?.experienceDetails || [];
  const educations = apiData?.educationDetails || [];
  const languagesKnown = apiData?.basicDetails?.languagesKnown || [];
const documents = apiData?.documentDetails || [];

  const yesNo = (value) => (value === true ? "YES" : "NO");

  /* =========================
     MASTER LOOKUPS (SAFE)
  ========================= */
  const gender = getGender?.(masters, profile.genderId);
  const religion = getReligion?.(masters, profile.religionId);
  const nationality = getNationality?.(masters, profile.nationality);
  const maritalStatus = getMaritalStatus?.(
    masters,
    profile.maritalStatusId
  );

  console.log("gender:", gender);
  console.log("religion:", religion);
  console.log("nationality:", nationality);
  console.log("maritalStatus:", maritalStatus);
  
  /* =========================
     DOCUMENT GROUPING
  ========================= */
  const groupDocs = (predicate) =>
    documents.filter(predicate).map(d => ({
      id: d.id,
      name: d.fileName,
      url: d.fileUrl,
    }));

  return {
    /* =========================
       PERSONAL DETAILS (UNCHANGED KEYS)
    ========================= */
    personalDetails: {
      fullName: profile.fullNameAadhar || "-",
      mobile: profile.contactNo || "-",
      email: profile.email || "-",
      motherName: profile.motherName || "-",
      fatherName: profile.fatherName || "-",
      spouseName: profile.spouseName || "-",
      dob: profile.dateOfBirth || "-",

      /* 🔁 IDs (existing behaviour) */
      gender: profile.genderId || "-",
      religion: profile.religionId || "-",
      nationality: profile.nationality || "-",
      maritalStatus: profile.maritalStatusId || "-",
      caste: profile.community || "-",

      /* 🆕 DISPLAY NAMES (NEW – NON-BREAKING) */
      gender_name: gender?.gender_name || "-",
      religion_name: religion?.religion_name || "-",
      nationality_name: nationality?.nationality_name || "-",
      marital_status_name: maritalStatus?.marital_status_name || "-",

      /* ================= ADDRESS ================= */
      address: `${address.addressLine1 || ""} ${address.addressLine2 || ""}`.trim(),
      permanentAddress: `${address.permanentAddressLine1 || ""} ${address.permanentAddressLine2 || ""}`.trim(),

      /* ================= GOVT / SERVICE ================= */
      centralGovtEmployment: yesNo(profile.centralGovtEmployed),
      servingLowerPost: yesNo(profile.employedInLowerPost),
      familyMember1984: yesNo(profile.riotVictimFamily),
      religiousMinority: yesNo(profile.minority),
      servingInGovt: yesNo(profile.isPublicSectorUndertaking),
      disciplinaryAction: yesNo(profile.anyDisciplinaryAction),

      disciplinaryDetails:
        profile.anyDisciplinaryAction === true
          ? profile.disciplinaryDetails || "-"
          : "-",

      exService: yesNo(profile.exServiceman),
      physicalDisability: yesNo(profile.disability),

      /* ================= MISC (UNCHANGED) ================= */
      location1: "-",
      location2: "-",
      location3: "-",
      currentCTC: "-",
      expectedCTC: "-",
    },

    /* =========================
       EXPERIENCE (UNCHANGED KEYS)
    ========================= */
    experience: experiences.map((e) => ({
      org: e.workExperience.organizationName || "-",
      designation: e.workExperience.postHeld || "-",
      department: e.workExperience.role || "-",
      from: e.workExperience.fromDate || "-",
      to: e.workExperience.isPresentlyWorking
        ? "Present"
        : e.workExperience.toDate || "-",
      duration: `${e.workExperience.monthsOfExp || 0} Months`,
      nature: e.workExperience.workDescription || "-",
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

    /* =========================
       EDUCATION (🆕 SAFE ADDITION)
    ========================= */
    education: educations.map((e) => ({
      qualification_id: e.education.educationQualificationsId,
      institution: e.education.institutionName || "-",
      percentage: e.education.percentage ?? "-",
      startDate: e.education.startDate || "-",
      endDate: e.education.endDate || "-",
    })),

    /* =========================
       LANGUAGES (🆕 SAFE ADDITION)
       (Not used yet, but future-ready)
    ========================= */
    // languages: languagesKnown.map((l) => {
    //   const lang = getLanguage?.(masters, l.languageId);
    //   return {
    //     language_id: l.languageId,
    //     language_name: lang?.language_name || "-",
    //     canRead: yesNo(l.canRead),
    //     canWrite: yesNo(l.canWrite),
    //     canSpeak: yesNo(l.canSpeak),
    //   };
    // }),

    /* =========================
       DOCUMENT DETAILS (NEW)
    ========================= */
    documents: {
      photo: groupDocs(d => d.fileName?.includes("Photo")),
      signature: groupDocs(d => d.fileName?.includes("Signature")),
      resume: groupDocs(d => d.fileName?.includes("Resume")),
      payslips: groupDocs(d => d.fileName?.includes("Payslip")),
      educationCertificates: groupDocs(d =>
        d.fileName?.includes("Board") ||
        d.fileName?.includes("Intermediate")
      ),
      identityProofs: groupDocs(d =>
        d.fileName?.includes("Aadhar") ||
        d.fileName?.includes("Proof")
      ),
      communityCertificates: groupDocs(d =>
        d.fileName?.includes("Community")
      ),
      disabilityCertificates: groupDocs(d =>
        d.fileName?.includes("DISABILITY")
      ),
    }
  };
};
