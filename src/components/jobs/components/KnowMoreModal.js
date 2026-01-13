import React from "react";
import { Modal } from "react-bootstrap";
import "../../../css/Relevantjobs.css";
import LocationWiseVacancyTable from "./LocationWiseVacancyTable";
import NationalVacancyTable from "./NationalVacancyTable";
import start from "../../../assets/start.png";
import end from "../../../assets/end.png";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";
const KnowMoreModal = ({ show, onHide, selectedJob,masterData}) => {
  if (!selectedJob) return null;


const reservationCategories = masterData?.reservation_categories || [];
const disabilities = masterData?.disabilities || [];
const states = masterData?.states || [];
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="job-detail-modal"
    >
      <Modal.Header closeButton className="knowmore-header">
        <div className="header-content w-100">
          
          {/* ===== Top Row: Requisition + Dates ===== */}
          <div className="req-date-row">
            <span className="req-code">
              {selectedJob?.requisition_code}
            </span>

            <span className="date-item">
              {/* <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" /> */}
              <img src={start}  className="date-icon" alt="start"></img>
              Start: {formatDateDDMMYYYY(selectedJob?.registration_start_date)}
            </span>

            <span className="date-divider">|</span>

            <span className="date-item">
              {/* <FontAwesomeIcon icon={faCalendarTimes} className="date-icon" /> */}
               <img src={end}  className="date-icon" alt="end"></img>
              End: {formatDateDDMMYYYY(selectedJob?.registration_end_date)}
            </span>
          </div>

          {/* ===== Job Title ===== */}
          <div className="job-title-main">
            {selectedJob?.position_title}
          </div>

        </div>
      </Modal.Header>


      <Modal.Body className="p-4">
        {/* Top Stats Box */}
        <div className="stats-container mb-3">
          <div className="row">
            <div className="col-md-4 mb-2">
              <span className="stat-label">Employment Type:</span> <span className="stat-value">{selectedJob.employment_type || "N/A"}</span>
            </div>
            {selectedJob.employment_type === "contract" && (
            <div className="col-md-4 mb-2">
              <span className="stat-label">Contract Period:</span> <span className="stat-value">{selectedJob.contract_period || "N/A"}</span>
            </div>
            )}
            <div className="col-md-4 mb-2">
              <span className="stat-label">Eligibility Age:</span> <span className="stat-value">{selectedJob.eligibility_age_min} -{" "}
                      {selectedJob.eligibility_age_max} years</span>
            </div>
            <div className="col-md-4 mb-2">
              <span className="stat-label">Experience:</span> <span className="stat-value">  {selectedJob.mandatory_experience} years</span>
            </div>
            <div className="col-md-4">
              <span className="stat-label">Department:</span> <span className="stat-value">{selectedJob.dept_name}</span>
            </div>
            <div className="col-md-4">
              <span className="stat-label">Vacancies:</span> <span className="stat-value">{selectedJob.no_of_vacancies}</span>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="info-card mt-3">
          <h6 className="card-section-header">Mandatory Education:</h6>
           <ul className="custom-list">
            {selectedJob.mandatory_qualification ? (
              <li>{selectedJob.mandatory_qualification}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
          <h6 className="card-section-header">Preferred Education:</h6>
          <ul className="custom-list">
            {selectedJob.preferred_qualification ? (
              <li>{selectedJob.preferred_qualification}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
        </div>

        {/* Experience Section */}
        <div className="info-card mt-3">
          <h6 className="card-section-header">Mandatory Experience:</h6>
         <ul className="custom-list">
            {selectedJob.mandatory_experience ? (
              <li>{selectedJob.mandatory_experience}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
          <h6 className="card-section-header">Preferred Experience:</h6>
          <ul className="custom-list">
            {selectedJob.preferred_experience ? (
              <li>{selectedJob.preferred_experience}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
        </div>

        {/* Responsibilities Section */}
        <div className="info-card mt-3">
          <h6 className="card-section-header">Key Responsibilities:</h6>
          <ul className="custom-list">
            {selectedJob.roles_responsibilities ? (
              <li>{selectedJob.roles_responsibilities}</li>
            ) : (
              <li>Not specified</li>
            )}
          </ul>
        </div>
     
{/* ================= VACANCY DISTRIBUTION ================= */}
{/* {vacancyDistribution.length > 0 && (
  <div className="info-card mt-3">
    <h6 className="card-section-header">
      Vacancy Distribution (State-wise)
    </h6>

    <div className="table-responsive">
      <table className="table table-bordered vacancy-table">
        <thead>
          <tr>
            <th rowSpan="2">State Name</th>
            <th rowSpan="2">Vacancies</th>

            <th colSpan={reservationCategories.length + 1} className="text-center">
              Category
            </th>

            <th colSpan={disabilities.length + 1} className="text-center">
              Out of Which (Disability)
            </th>
          </tr>

          <tr>
            {reservationCategories.map(cat => (
              <th key={cat.category_id}>{cat.category_code}</th>
            ))}
            <th>Total</th>

            {disabilities.map(dis => (
              <th key={dis.disability_id}>{dis.disability_code}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {vacancyDistribution.map((dist, index) => {
            const categoryTotal = reservationCategories.reduce(
              (sum, cat) => sum + (dist.categories?.[cat.category_id] || 0),
              0
            );

            const disabilityTotal = disabilities.reduce(
              (sum, dis) => sum + (dist.disability?.[dis.disability_id] || 0),
              0
            );

            return (
              <tr key={index}>
                <td>{dist.state_name}</td>
                <td>{dist.total}</td>

                {reservationCategories.map(cat => (
                  <td key={cat.category_id}>
                    {dist.categories?.[cat.category_id] || 0}
                  </td>
                ))}
                <td>{categoryTotal}</td>

                {disabilities.map(dis => (
                  <td key={dis.disability_id}>
                    {dist.disability?.[dis.disability_id] || 0}
                  </td>
                ))}
                <td>{disabilityTotal}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)} */}
{selectedJob?.isLocationWise ? (
  <LocationWiseVacancyTable
    positionStateDistributions={selectedJob.positionStateDistributions}
    states={states}
    reservationCategories={reservationCategories}
    disabilities={disabilities}
  />
) : (
  <NationalVacancyTable
    positionCategoryNationalDistributions={
      selectedJob.positionCategoryNationalDistributions
    }
    reservationCategories={reservationCategories}
    disabilities={disabilities}
  />
)}
      </Modal.Body>

      <Modal.Footer className="border-0 pb-4">
        <button className="ok-btn" onClick={onHide}>
          OK
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default KnowMoreModal;