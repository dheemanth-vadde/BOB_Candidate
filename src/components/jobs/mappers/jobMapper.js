// src/mappers/jobMapper.js
export const mapJobApiToModel = (apiJob, citiess = []) => {
  if (!apiJob) return null;

  const {
    positions,
    postingLocation,
    vacancies,
    selectionProcess,
    relaxationPolicy,
    departmentsDTO,
    locationDTO,
    requisitionsDTO,
    gradeName,
  } = apiJob;
  console.log("cities",citiess)
 const cityId = postingLocation?.cityId || locationDTO?.city_id;
  const city = citiess.find((c) => c.city_id === cityId);
  return {
    // === IDs & Titles ===
    position_id: positions?.positionId || "",
    requisition_id: requisitionsDTO?.requisitionId || "",
    position_title: positions?.positionTitle || "",
    requisition_code: requisitionsDTO?.requisitionCode || "",
    requisition_title: requisitionsDTO?.requisitionTitle || "",

    // === Descriptions ===
    description: positions?.description || "",
    roles_responsibilities: positions?.rolesResponsibilities || "",
    selection_procedure: selectionProcess?.selectionProcedure || "",

    // === Job details ===
    grade_name: gradeName || "",
    employment_type: positions?.employmentType || "",
    position_status: positions?.positionStatus || "Inactive",

    // === Eligibility ===
    eligibility_age_min: positions?.eligibilityAgeMin ?? null,
    eligibility_age_max: positions?.eligibilityAgeMax ?? null,
    mandatory_qualification: positions?.mandatoryQualification || "",
    preferred_qualification: positions?.preferredQualification || "",
    mandatory_experience: positions?.mandatoryExperience ?? 0,
    preferred_experience: positions?.preferredExperience ?? 0,
    probation_period: positions?.probationPeriod ?? 0,

    // === Documents & Relaxation ===
    documents_required: positions?.documentsRequired || "",
    job_relaxation_policy_id: positions?.jobRelaxationPolicyId || "",
    job_relaxation_policy_json: relaxationPolicy?.relaxation || null,

    // === Vacancies ===
    no_of_vacancies: vacancies?.noOfVacancies ?? 0,
    special_cat_id: vacancies?.specialCatId ?? null,
    reservation_cat_id: vacancies?.reservationCatId ?? null,

    // === Location & Department ===
    dept_id: postingLocation?.deptId || departmentsDTO?.departmentId || "",
    dept_name: departmentsDTO?.departmentName || "",
    location_id: postingLocation?.locationId || locationDTO?.locationId || "",
    location_name: locationDTO?.locationName || "",
    city_id: cityId,
    state_id: postingLocation?.stateId || "",
    country_id: postingLocation?.countryId || "",

    // === Salary ===
    min_salary: positions?.minSalary ?? null,
    max_salary: positions?.maxSalary ?? null,

    // === Requisition Details ===
    registration_start_date: requisitionsDTO?.registrationStartDate || "",
    registration_end_date: requisitionsDTO?.registrationEndDate || "",
    requisition_status: requisitionsDTO?.requisitionStatus || "",

    // === City Lookup ===
    city_name: city?.city_name || "Unknown",
  };
};

// map full array
export const mapJobsApiToList = (apiJobs,cities) => {
  if (!Array.isArray(apiJobs)) return [];
  return apiJobs.map((job) => mapJobApiToModel(job,cities));
};
