// src/jobs/mappers/masterDataMapper.js

export const mapMasterDataApi = (apiResponse) => {
  const data = apiResponse?.data || {};

  return {
    // ✅ Departments
    departments: (data.departments || []).map(d => ({
      department_id: d.departmentId,
      department_name: d.departmentName,
      department_desc: d.departmentDesc,
      isActive: d.isActive,
    })),

    // ✅ States
    states: (data.states || []).map(s => ({
      state_id: s.stateId,
      state_name: s.stateName,
      country_id: s.countryId,
      isActive: s.isActive,
    })),

    // ✅ Cities
    cities: (data.cities || []).map(c => ({
      city_id: c.cityId,
      city_name: c.cityName,
      state_id: c.stateId,
      isActive: c.isActive,
    })),

    // ✅ Locations
    locations: (data.locations || []).map(l => ({
      location_id: l.locationId,
      location_name: l.locationName,
      city_id: l.cityId,
      isActive: l.isActive,
    })),

    // ✅ Skills
    skills: (data.skills || []).map(s => ({
      skill_id: s.skillId,
      skill_name: s.skillName,
      skill_desc: s.skillDesc,
      isActive: s.isActive,
    })),

    // ✅ Job Grades (IMPORTANT – UI uses this)
    job_grade_data: (data.jobGrade || []).map(j => ({
      job_grade_id: j.jobGradeId,
      job_grade_code: j.jobGradeCode,
      job_grade_desc: j.jobGradeDesc,
      job_scale: j.jobScale,
      min_salary: j.minSalary,
      max_salary: j.maxSalary,
      isActive: j.isActive,
    })),

    // ✅ Mandatory Qualification
    mandatory_qualification: (data.mandatoryQualification || []).map(q => ({
      edu_qualification_id: q.eduQualificationId,
      edu_qualification_name: q.eduQualificationName,
      edu_desc: q.eduDesc,
      isActive: q.isActive,
    })),

    // ✅ Preferred Qualification
    preferred_qualification: (data.preferredQualification || []).map(q => ({
      edu_qualification_id: q.eduQualificationId,
      edu_qualification_name: q.eduQualificationName,
      edu_desc: q.eduDesc,
      isActive: q.isActive,
    })),

    // ✅ Master Positions
    masterPositionsList: (data.masterPositions || []).map(p => ({
      masterPositionId: p.positionId,
      positionCode: p.positionCode,
      positionName: p.positionName,
      positionDescription: p.positionDescription,
      jobGradeId: p.jobGradeId,
      deptId: p.deptId,
      isActive: p.isActive,
    })),
  };
};
