// src/jobs/mappers/masterDataMapper.js

export const mapMasterDataApi = (apiResponse) => {
  const data = apiResponse?.data || {};

  return {
    /* =====================
       DEPARTMENTS
    ====================== */
    departments: (data.departments || []).map(d => ({
      department_id: d.departmentId,
      department_name: d.departmentName,
      department_desc: d.departmentDesc,
      is_active: d.isActive,
    })),

    /* =====================
       COUNTRIES
    ====================== */
    countries: (data.countries || []).map(c => ({
      country_id: c.countryId,
      country_name: c.countryName,
      is_active: c.isActive,
    })),

    /* =====================
       STATES
    ====================== */
    states: (data.states || []).map(s => ({
      state_id: s.stateId,
      state_name: s.stateName,
      country_id: s.countryId,
      is_active: s.isActive,
    })),

    /* =====================
       CITIES
    ====================== */
    cities: (data.cities || []).map(c => ({
      city_id: c.cityId,
      city_name: c.cityName,
      state_id: c.stateId,
      is_active: c.isActive,
    })),

    /* =====================
       LOCATIONS
    ====================== */
    locations: (data.locations || []).map(l => ({
      location_id: l.locationId,
      location_name: l.locationName,
      city_id: l.cityId,
      is_active: l.isActive,
    })),

    /* =====================
       SKILLS
    ====================== */
    skills: (data.skills || []).map(s => ({
      skill_id: s.skillId,
      skill_name: s.skillName,
      skill_desc: s.skillDesc,
      is_active: s.isActive,
    })),

    /* =====================
       JOB GRADES
    ====================== */
    job_grades: (data.jobGrade || []).map(j => ({
      job_grade_id: j.jobGradeId,
      job_grade_code: j.jobGradeCode,
      job_grade_desc: j.jobGradeDesc,
      job_scale: j.jobScale,
      min_salary: j.minSalary?.parsedValue ?? 0,
      max_salary: j.maxSalary?.parsedValue ?? 0,
      is_active: j.isActive,
    })),

    /* =====================
       MANDATORY QUALIFICATIONS
    ====================== */
    mandatory_qualifications: (data.mandatoryQualification || []).map(q => ({
      qualification_id: q.educationQualificationsId,
      qualification_code: q.qualificationCode,
      qualification_name: q.qualificationName,
      level_id: q.levelId,
      is_active: q.isActive,
    })),

    /* =====================
       PREFERRED QUALIFICATIONS
    ====================== */
    preferred_qualifications: (data.preferredQualification || []).map(q => ({
      qualification_id: q.educationQualificationsId,
      qualification_code: q.qualificationCode,
      qualification_name: q.qualificationName,
      level_id: q.levelId,
      is_active: q.isActive,
    })),

    /* =====================
       MASTER POSITIONS
    ====================== */
    master_positions: (data.masterPositions || []).map(p => ({
      position_id: p.positionId,
      position_name: p.positionName,
      position_desc: p.positionDescription,
      job_grade_id: p.jobGradeId,
      department_id: p.deptId,
      is_active: p.isActive,
    })),

    /* =====================
       RESERVATION CATEGORIES
    ====================== */
    reservation_categories: (data.reservationCategories || []).map(r => ({
      category_id: r.reservationCategoriesId,
      category_code: r.categoryCode,
      category_name: r.categoryName,
      category_desc: r.categoryDesc,
      is_active: r.isActive,
    })),

    /* =====================
       GENDER
    ====================== */
    genders: (data.genderMasters || []).map(g => ({
      gender_id: g.genderId,
      gender_name: g.gender,
      is_active: g.isActive,
    })),

    /* =====================
       MARITAL STATUS
    ====================== */
    marital_statuses: (data.maritalStatusMaster || []).map(m => ({
      marital_status_id: m.maritalStatusId,
      marital_status: m.maritalStatus,
      is_active: m.isActive,
    })),

    /* =====================
       RELIGION
    ====================== */
    religions: (data.religionMaster || []).map(r => ({
      religion_id: r.religionId,
      religion_name: r.religion,
      is_active: r.isActive,
    })),

    /* =====================
       DISABILITY
    ====================== */
    disabilities: (data.disabilityCategories || []).map(d => ({
      disability_id: d.disabilityCategoryId,
      disability_code: d.disabilityCode,
      disability_name: d.disabilityName,
      is_active: d.isActive,
    })),

    /* =====================
       LANGUAGES
    ====================== */
    languages: (data.languageMasters || []).map(l => ({
      language_id: l.languageId,
      language_name: l.languageName,
    })),

    /* =====================
       PINCODES
    ====================== */
    pincodes: (data.pincodes || []).map(p => ({
      pincode_id: p.pincodeId,
      pin: p.pin,
      city_id: p.cityId,
      is_active: p.isActive,
    })),

    /* =====================
       DISTRICTS
    ====================== */
    districts: (data.districts || []).map(d => ({
      district_id: d.districtId,
      district_name: d.districtName,
      state_id: d.stateId,
      is_active: d.isActive,
    })),
  };
};
