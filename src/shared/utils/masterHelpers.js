import { getMasterById } from "./masterLookup";

/* =========================
   DEPARTMENT
========================= */
export const getDepartment = (masters, deptId) =>
  getMasterById(
    masters,
    "departments",
    deptId,
    "department_id"   // ✅ FIXED
  );

/* =========================
   CITY
========================= */
export const getCity = (masters, cityId) =>
  getMasterById(
    masters,
    "cities",
    cityId,
    "city_id"         // ✅ FIXED
  );

/* =========================
   STATE
========================= */
export const getState = (masters, stateId) =>
  getMasterById(
    masters,
    "states",
    stateId,
    "state_id"        // ✅ FIXED
  );

/* =========================
   LOCATION
========================= */
export const getLocation = (masters, locationId) =>
  getMasterById(
    masters,
    "locations",
    locationId,
    "location_id"     // ✅ FIXED
  );

/* =========================
   JOB GRADE
========================= */
export const getJobGrade = (masters, gradeId) =>
  getMasterById(
    masters,
    "job_grades",     // ✅ FIXED (NOT jobGrade)
    gradeId,
    "job_grade_id"    // ✅ FIXED
  );

/* =========================
   SKILL
========================= */
export const getSkill = (masters, skillId) =>
  getMasterById(
    masters,
    "skills",
    skillId,
    "skill_id"        // ✅ FIXED
  );
