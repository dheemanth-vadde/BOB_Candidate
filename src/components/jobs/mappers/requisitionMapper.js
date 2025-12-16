// requisitionMapper.js

/**
 * Map a single requisition from API to model (same field names)
 */
export const mapRequisitionApiToModel = (apiReq) => {
  if (!apiReq) return null;

  return {
    isActive: apiReq.isActive ?? false,
    created_by: apiReq.created_by || "",
    updated_by: apiReq.updated_by || "",
    created_date: apiReq.created_date || "",
    updated_date: apiReq.updated_date || "",

    requisition_id: apiReq.requisition_id || "",
    requisition_code: apiReq.requisition_code || "",
    requisition_title: apiReq.requisition_title || "",
    requisition_description: apiReq.requisition_description || "",
    registration_start_date: apiReq.registration_start_date || "",
    registration_end_date: apiReq.registration_end_date || "",
    requisition_status: apiReq.requisition_status || "",
    requisition_comments: apiReq.requisition_comments || "",
    requisition_approval: apiReq.requisition_approval || "",
    others: apiReq.others || null,
    no_of_positions: apiReq.no_of_positions ?? 0,
    job_postings: apiReq.job_postings || "",
    requisition_approval_notes: apiReq.requisition_approval_notes || "",
    no_of_approvals: apiReq.no_of_approvals ?? 0,
  };
};

/**
 * Map list of requisitions
 */
export const mapRequisitionsApiToList = (apiList = []) => {
  if (!Array.isArray(apiList)) return [];
  return apiList.map(mapRequisitionApiToModel);
};
