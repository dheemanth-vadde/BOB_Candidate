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
    requisition_id: requisitionsDTO?.requisition_id || "",
    position_title: positions?.positionTitle || "",
    requisition_code: requisitionsDTO?.requisition_code || "",
    requisition_title: requisitionsDTO?.requisition_title || "",

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

    // === Documents ===
    documents_required: positions?.documentsRequired || "",
    job_relaxation_policy_id: positions?.jobRelaxationPolicyId || "",
    job_relaxation_policy_json: relaxationPolicy?.relaxation || null,

    // === Vacancies ===
    no_of_vacancies: vacancies?.noOfVacancies ?? 0,
    special_cat_id: vacancies?.specialCatId || null,
    reservation_cat_id: vacancies?.reservationCatId || null,

    // === Location & Department ===
    dept_id: postingLocation?.deptId || departmentsDTO?.department_id || "",
    dept_name: departmentsDTO?.department_name || "",
    location_id: postingLocation?.locationId || locationDTO?.location_id || "",
    location_name: locationDTO?.location_name || "",
    city_id: postingLocation?.cityId || locationDTO?.city_id || "",
    state_id: postingLocation?.stateId || "",
    country_id: postingLocation?.countryId || "",

    // === Salary ===
    min_salary: positions?.minSalary ?? null,
    max_salary: positions?.maxSalary ?? null,

    // === Requisition Details ===
    registration_start_date: requisitionsDTO?.registration_start_date || "",
    registration_end_date: requisitionsDTO?.registration_end_date || "",
    requisition_status: requisitionsDTO?.requisition_status || "",

    //==cities==
    city_id: cityId || "",
    city_name: city?.city_name || "Unknown",
  };
};

// map full array
export const mapJobsApiToList = (apiJobs,cities) => {
  if (!Array.isArray(apiJobs)) return [];
  return apiJobs.map((job) => mapJobApiToModel(job,cities));
};
