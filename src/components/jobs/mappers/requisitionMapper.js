// requisitionMapper.js

/**
 * Map a single requisition from API to model (same field names)
 */
export const mapRequisitionApiToModel = (apiReq) => {
  if (!apiReq) return null;

  return {
    isActive: apiReq.isActive ?? false,

    created_by: apiReq.createdBy || "",
    updated_by: apiReq.modifiedBy || "",
    created_date: apiReq.createdDate || "",
    updated_date: apiReq.modifiedDate || "",

    requisition_id: apiReq.requisitionId || "",
    requisition_code: apiReq.requisitionCode || "",
    requisition_title: apiReq.requisitionTitle || "",
    requisition_description: apiReq.requisitionDescription || "",

    registration_start_date: apiReq.registrationStartDate || "",
    registration_end_date: apiReq.registrationEndDate || "",

    requisition_status: apiReq.requisitionStatus || "",
    requisition_comments: apiReq.requisitionComments || "",
    requisition_approval: apiReq.requisitionApproval || "",
    requisition_approval_notes: apiReq.requisitionApprovalNotes || "",

    no_of_positions: apiReq.noOfPositions ?? 0,
    no_of_approvals: apiReq.noOfApprovals ?? 0,

    job_postings: apiReq.jobPostings || "",
    others: apiReq.others || null,
  };
};

/**
 * Map list of requisitions
 */
export const mapRequisitionsApiToList = (apiList = []) => {
  if (!Array.isArray(apiList)) return [];
  return apiList.map(mapRequisitionApiToModel);
};
