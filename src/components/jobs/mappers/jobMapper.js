import {
  getDepartment,
  getCity,
  getLocation,
  getJobGrade
} from "../../../shared/utils/masterHelpers";

export const mapJobApiToModel = (apiJob, masters = {}) => {
  if (!apiJob) return null;

  const { positionsDTO, masterPositionsDTO, requisitionsDTO } = apiJob;

  /* =========================
     MASTER LOOKUPS
  ========================= */
  const dept = getDepartment(masters, positionsDTO?.deptId);
  const location = getLocation(masters, positionsDTO?.locationId);
  console.log("masters", masters);
  console.log("cityId from positionsDTO:", positionsDTO?.cityId);
  const city = getCity(masters, positionsDTO?.cityId);
  const grade = getJobGrade(masters, positionsDTO?.gradeId);

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

    /* =========================
       JOB DETAILS
    ========================= */
    employment_type: positionsDTO?.employmentType || "",
    position_status: positionsDTO?.positionStatus || "Inactive",

    grade_id: positionsDTO?.gradeId || "",
    grade_name: grade ? grade.job_grade_code : "—",

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
    ========================= */
    dept_id: positionsDTO?.deptId || "",
    dept_name: dept ? dept.department_name : "—",

    location_id: positionsDTO?.locationId || "",
    location_name: location ? location.locationName : "—",

    city_id: positionsDTO?.cityId || "",
    city_name: city ? city.city_name : "—",

    /* =========================
       SALARY (FROM GRADE IF AVAILABLE)
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

