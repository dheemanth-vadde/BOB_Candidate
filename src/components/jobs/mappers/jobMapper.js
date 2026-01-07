import {
  getDepartment,
  getCity,
  getLocation,
  getJobGrade,
  getEmploymentType,
  getState
} from "../../../shared/utils/masterHelpers";

export const mapJobApiToModel = (apiJob, masters = {}) => {
  if (!apiJob) return null;


  /* =========================
   STATE DISTRIBUTIONS
========================= */


  const {
    positionsDTO,
    masterPositionsDTO,
    requisitionsDTO,
   positionStateDistributions    
  } = apiJob;


  const stateDistributions = positionStateDistributions || [];
// const positionStateDistributions =
//   positionsDTO?.positionStateDistributions || [];
const stateIds = stateDistributions
  .map(s => s.stateId)
  .filter(Boolean);

  console.log("stateIds", stateIds)

const stateNames = stateIds
  .map(id => getState(masters, id)?.state_name)
  .filter(Boolean);
  console.log("stateNames", stateNames)

  /* =========================
     MASTER LOOKUPS
  ========================= */
  const dept = getDepartment(masters, positionsDTO?.deptId);
  const grade = getJobGrade(masters, positionsDTO?.gradeId);
  const employmentType = getEmploymentType(
    masters,
    positionsDTO?.employmentType
  );

  /* =========================
     STATE (NEW SOURCE)
  ========================= */
  const primaryStateId = positionStateDistributions[0]?.stateId || null;
  const state = primaryStateId
    ? getState(masters, primaryStateId)
    : null;


    /* =========================
     VACANCY DISTRIBUTION (NEW)
  ========================= */
  // const vacancyDistribution = positionStateDistributions.map(dist => {
  //   const state = getState(masters, dist.stateId);

  //   return {
  //     state_id: dist.stateId,
  //     state_name: state?.state_name || "Unknown",
  //     total: dist.totalVacancies ?? 0,

  //     general: {
  //       SC: dist.sc ?? 0,
  //       ST: dist.st ?? 0,
  //       OBC: dist.obc ?? 0,
  //       EWS: dist.ews ?? 0,
  //       GEN: dist.gen ?? 0
  //     },

  //     disability: {
  //       OC: dist.oc ?? 0,
  //       VI: dist.vi ?? 0,
  //       HI: dist.hi ?? 0,
  //       ID: dist.id ?? 0
  //     }
  //   };
  // });
// const vacancyDistribution = positionStateDistributions.map(stateDist => {
//   const state = getState(masters, stateDist.stateId);

//   /* =========================
//      CATEGORY MAP (DYNAMIC)
//   ========================= */
//   const categoryMap = {};

//   // initialize all categories with 0
//   (masters.reservationCategories || []).forEach(cat => {
//     categoryMap[cat.reservation_category_id] = 0;
//   });

//   // fill actual values from API
//   stateDist.positionCategoryDistributions
//     ?.filter(d => !d.isDisability)
//     .forEach(d => {
//       categoryMap[d.reservationCategoryId] = d.vacancyCount;
//     });

//   /* =========================
//      DISABILITY MAP (OPTIONAL)
//   ========================= */
//   const disabilityMap = {};

//   stateDist.positionCategoryDistributions
//     ?.filter(d => d.isDisability)
//     .forEach(d => {
//       disabilityMap[d.disabilityCategoryId] = d.vacancyCount;
//     });

//   return {
//     state_id: stateDist.stateId,
//     state_name: state?.state_name || "Unknown",
//     total: stateDist.totalVacancies ?? 0,
//     categories: categoryMap,       // ✅ dynamic
//     disability: disabilityMap      // ✅ dynamic
//   };
// });

  return {
    /* =========================
       IDS & TITLES
    ========================= */
    position_id: positionsDTO?.positionId || "",
    requisition_id: requisitionsDTO?.id || "",
    position_title: masterPositionsDTO?.positionName || "",
    position_code: masterPositionsDTO?.positionCode || "",
    requisition_code: requisitionsDTO?.requisitionCode || "",
    requisition_title: requisitionsDTO?.requisitionTitle || "",

    /* =========================
       DESCRIPTIONS
    ========================= */
    description: masterPositionsDTO?.positionDescription || "",
    roles_responsibilities: positionsDTO?.rolesResponsibilities || "",
    contract_period: positionsDTO?.contractYears || "",

    /* =========================
       JOB DETAILS
    ========================= */
    employment_type: employmentType
      ? employmentType.employment_type_name
      : "",
    position_status: positionsDTO?.positionStatus || "Inactive",

    grade_id: positionsDTO?.gradeId || "",
    grade_name: grade ? grade.job_grade_code : "—",
 // vacancy_distribution: vacancyDistribution,
  positionStateDistributions: positionStateDistributions || [],
    /* =========================
       ELIGIBILITY
    ========================= */
    eligibility_age_min: positionsDTO?.eligibilityAgeMin ?? null,
    eligibility_age_max: positionsDTO?.eligibilityAgeMax ?? null,
    mandatory_qualification: positionsDTO?.mandatoryEducation || "",
    preferred_qualification: positionsDTO?.preferredEducation || "",
    mandatory_experience: Number(positionsDTO?.mandatoryExperience) || 0,
    preferred_experience: Number(positionsDTO?.preferredExperience) || 0,

    /* =========================
       VACANCIES
    ========================= */
    no_of_vacancies: positionsDTO?.totalVacancies ?? 0,

    /* =========================
       LOCATION & DEPARTMENT
       (KEYS UNCHANGED)
    ========================= */
    dept_id: positionsDTO?.deptId || "",
    dept_name: dept ? dept.department_name : "—",

    location_id: "",           // ❗ not available in API anymore
    location_name: "—",

    city_id: "",               // ❗ not available in API anymore
    city_name: "—",

    /* =========================
       STATE (NEW DATA ADDED)
    ========================= */
    state_id: stateIds.join(",") || "",
    state_name: stateNames.join(", ") || "—",

   state_id_array: stateIds || [],
    state_name_array: stateNames || [],

    /* =========================
       SALARY
    ========================= */
    min_salary: grade ? grade.min_salary : null,
    max_salary: grade ? grade.max_salary : null,

    /* =========================
       REQUISITION DETAILS
    ========================= */
    registration_start_date: requisitionsDTO?.startDate || "",
    registration_end_date: requisitionsDTO?.endDate || "",
    requisition_status: requisitionsDTO?.requisitionStatus || "",
    requisition_comments: requisitionsDTO?.requisitionComments || null,

    /* =========================
       FLAGS
    ========================= */
    is_location_preference_enabled:
      positionsDTO?.isLocationPreferenceEnabled ?? false,
    is_location_wise:
      positionsDTO?.isLocationWise ?? false,
  };
};


/* =========================
   LIST MAPPER
========================= */
export const mapJobsApiToList = (apiJobs, masters = {}) => {
  if (!Array.isArray(apiJobs)) return [];
  return apiJobs.map(job => mapJobApiToModel(job, masters));
};

