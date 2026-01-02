import React from "react";
import logo_Bob from "../../../assets/bob-logo.png";
import sign from "../../../assets/download.png";
import viewIcon from "../../../assets/view-icon.png";
import { getState, getLocation } from "../../../shared/utils/masterHelpers";

const PreviewContent = ({ previewData, selectedJob, masterData, preferences }) => {
  if (!previewData) return null;

  const allDocuments = Object.values(previewData.documents || {}).flat();

  const state1 = getState(masterData, preferences?.state1);
  const state2 = getState(masterData, preferences?.state2);
  const state3 = getState(masterData, preferences?.state3);

  return (
    <div className="bob-preview-content">
      {/* ===== HEADER ===== */}
      <div className="bob-header">
        <div className="title_pre">
          <span>
            {selectedJob?.requisition_code} - {selectedJob?.requisition_title}
          </span>
        </div>
        <div className="bob-header-title">
          {selectedJob?.position_title}
        </div>
      </div>

      {/* ===== PERSONAL DETAILS ===== */}
      <table className="table table-bordered bob-table w-100 mb-4">
        <tbody>
          <tr>
            <td className="fw-med">Full Name</td>
            <td colSpan={3}>{previewData.personalDetails.fullName}</td>
            <td rowSpan={3} className="text-center">
              <img src={logo_Bob} alt="Applicant" className="img-fluid" />
              <img src={sign} alt="Signature" className="img-fluid mt-2" />
            </td>
          </tr>
          <tr>
            <td className="fw-med">Email</td>
            <td colSpan={3}>{previewData.personalDetails.email}</td>
          </tr>
          <tr>
            <td className="fw-med">Mobile</td>
            <td colSpan={3}>{previewData.personalDetails.mobile}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== EDUCATION ===== */}
      <h6 className="section-title">Education Details</h6>
      <table className="table table-bordered bob-table mb-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Institute</th>
            <th>Degree</th>
            <th>From</th>
            <th>To</th>
          </tr>
        </thead>
        <tbody>
          {previewData.education.map((edu, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{edu.institution}</td>
              <td>{edu.degree}</td>
              <td>{edu.startDate}</td>
              <td>{edu.endDate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== DOCUMENTS ===== */}
      <h6 className="section-title">Documents</h6>
      <table className="table table-bordered bob-table">
        <tbody>
          {allDocuments.map((doc, i) => (
            <tr key={i}>
              <td>{doc.name}</td>
              <td>
                <a href={doc.url} target="_blank" rel="noreferrer">
                  <img src={viewIcon} alt="View" width={20} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewContent;
