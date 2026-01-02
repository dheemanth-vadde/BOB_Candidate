import React, { forwardRef } from "react";
import "../../../css/PreviewModal.css";
import logo_Bob from "../../../assets/bob-logo.png";
import sign from "../../../assets/download.png";
import viewIcon from "../../../assets/view-icon.png";
import { getState } from "../../../shared/utils/masterHelpers";

const ApplicationDownload = forwardRef(
  ({ previewData, selectedJob, masterData, preferences }, ref) => {
    if (!previewData) return null;

    const state1 = getState(masterData, preferences?.state1);
    const state2 = getState(masterData, preferences?.state2);
    const state3 = getState(masterData, preferences?.state3);

    const allDocuments = Object.values(previewData.documents || {}).flat();

    return (
      <div
        ref={ref}
        style={{
              width: "794px",
    background: "#ffffff",
    padding: "20px",

    /* 🔥 CRITICAL PART */
    opacity: 0,              // invisible
    pointerEvents: "none",   // no interaction
    position: "relative"    // normal layout

        }}
      >
        {/* ================= HEADER ================= */}
        <div className="bob-header">
          <div className="title_pre">
            <span>
              {selectedJob?.requisition_code} -{" "}
              {selectedJob?.requisition_title}
            </span>
          </div>
          <div className="bob-header-title">
            {selectedJob?.position_title}
          </div>
        </div>

        {/* ================= PERSONAL DETAILS ================= */}
        <h6 className="section-title mt-3">Personal Details</h6>
        <table className="table table-bordered bob-table w-100 mb-4">
          <tbody>
            <tr>
              <td className="fw-med">Full Name</td>
              <td colSpan={3}>
                {previewData.personalDetails?.fullName || "-"}
              </td>
              <td rowSpan={3} className="text-center">
                <img src={logo_Bob} alt="Applicant" className="img-fluid" />
                <br />
                <img src={sign} alt="Signature" className="img-fluid mt-2" />
              </td>
            </tr>
            <tr>
              <td className="fw-med">Email</td>
              <td colSpan={3}>
                {previewData.personalDetails?.email || "-"}
              </td>
            </tr>
            <tr>
              <td className="fw-med">Mobile</td>
              <td colSpan={3}>
                {previewData.personalDetails?.mobile || "-"}
              </td>
            </tr>
            <tr>
              <td className="fw-med">Current CTC</td>
              <td>
                {previewData.experienceSummary?.currentCtc || "-"}
              </td>
              <td className="fw-med">Expected CTC</td>
              <td colSpan={2}>
                {preferences?.ctc
                  ? `₹${Number(preferences.ctc).toLocaleString()}`
                  : "-"}
              </td>
            </tr>
            <tr>
              <td className="fw-med">Location Preference 1</td>
              <td>{state1?.state_name || "-"}</td>
              <td className="fw-med">Location Preference 2</td>
              <td colSpan={2}>{state2?.state_name || "-"}</td>
            </tr>
            <tr>
              <td className="fw-med">Location Preference 3</td>
              <td>{state3?.state_name || "-"}</td>
              <td colSpan={3}></td>
            </tr>
          </tbody>
        </table>

        {/* ================= EDUCATION ================= */}
        <h6 className="section-title">Education Details</h6>
        <table className="table table-bordered bob-table mb-4">
          <thead>
            <tr>
              <th>#</th>
              <th>University</th>
              <th>College</th>
              <th>Degree</th>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {(previewData.education || []).map((edu, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{edu.institution || "-"}</td>
                <td>{edu.school || "-"}</td>
                <td>{edu.degree || "-"}</td>
                <td>{edu.startDate || "-"}</td>
                <td>{edu.endDate || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= EXPERIENCE ================= */}
        <h6 className="section-title">Experience Details</h6>
        <table className="table table-bordered bob-table mb-4">
          <thead>
            <tr>
              <th>#</th>
              <th>Organization</th>
              <th>Post</th>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {(previewData.experience || []).map((exp, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{exp.org || "-"}</td>
                <td>{exp.designation || "-"}</td>
                <td>{exp.from || "-"}</td>
                <td>{exp.to || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= DOCUMENTS ================= */}
        <h6 className="section-title">Documents</h6>
        <table className="table table-bordered bob-table">
          <tbody>
            {allDocuments.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center">
                  No documents available
                </td>
              </tr>
            )}

            {allDocuments.map((doc, i) => (
              <tr key={i}>
                <td>{doc.name}</td>
                <td>
                  <img src={viewIcon} alt="View" width={20} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default ApplicationDownload;
