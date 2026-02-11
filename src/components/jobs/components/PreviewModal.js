import React, { useState, useEffect } from "react";
import { Modal, Accordion } from "react-bootstrap";
import "../../../css/PreviewModal.css";
import logo_Bob from "../../../assets/bob-logo.png";
import sign from "../../../assets/download.png";
import { useSelector } from "react-redux";
import viewIcon from "../../../assets/view-icon.png";
import TurnstileWidget from "../../integrations/Cpatcha/TurnstileWidget";
import masterApi from "../../../services/master.api";
import { handleEyeClick } from "../../../shared/utils/fileDownload";
const PreviewModal = ({
  show,
  onHide,
  previewData,
  onEditProfile,
  onProceedToPayment,
  selectedJob,
  masterData,
  onBack,
  applyForm,              // ✅ NEW
  onApplyFormChange,       // ✅ NEW
  formErrors,
  setFormErrors,
  interviewCentres,
  setTurnstileToken
}) => {
  const [declarations, setDeclarations] = useState({
    decl1: false,
    decl2: false,
    decl3: false,
  });
  const [selectedStateId, setSelectedStateId] = useState("");
  // const [locations, setLocations] = useState([]);
  const [locationsMap, setLocationsMap] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [interviewCentreOptions, setInterviewCentreOptions] = useState([]);
  const [loadingInterviewCentres, setLoadingInterviewCentres] = useState(false);
  const allChecked =
    declarations.decl1 &&
    declarations.decl2 &&
    declarations.decl3;

  const preferenceData = useSelector(
    (state) => state.preference.preferenceData
  );
  const preferences = preferenceData?.preferences || {};
  // const [activeAccordion, setActiveAccordion] = useState(["0"]);
  const [activeAccordion, setActiveAccordion] = useState([
    "0",
    "1",
    "2",
    "3",
    "4",
  ]);
  const [photoSrc, setPhotoSrc] = useState(null);
  const [signatureSrc, setSignatureSrc] = useState(null);

  const states = masterData?.states ?? [];
  const stateIds = selectedJob?.state_id_array ?? [];

  const hasInvalidIds =
    stateIds.length &&
    !stateIds.some(id => states.some(s => s.zonal_state_id === id));

  const availableStates =
    !selectedJob?.isLocationWise || hasInvalidIds
      ? states   // ⚠️ fallback
      : states.filter(s => stateIds.includes(s.zonal_state_id));

  useEffect(() => {
    if (
      formErrors?.ctc ||
      formErrors?.examCenter
    ) {
      setActiveAccordion(["4"]); // 👈 Add Preference section
    }
  }, [formErrors]);

  const fetchLocationsForState = async (stateId, index) => {
    if (!stateId) return;

    setLoadingLocations(true);

    try {
      const res = await masterApi.getInterviewCentresByState(
        ["Regional Office", "Zonal Office"],
        stateId
      );

      setLocationsMap(prev => ({
        ...prev,
        [index]: Array.isArray(res.data) ? res.data : []
      }));

    } catch (err) {
      console.error("Failed to fetch locations", err);
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    if (!show) return;

    setLoadingInterviewCentres(true);
    const orgTypes = ["Zonal Office"];
    masterApi
      .getInterviewCentresByState(orgTypes, "") // 👈 explicitly empty
      .then((res) => {
        setInterviewCentreOptions(Array.isArray(res.data) ? res.data : []);
        console.log("Fetched interview centres for preview modal:", res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch interview centres", err);
        setInterviewCentreOptions([]);
      })
      .finally(() => {
        setLoadingInterviewCentres(false);
      });
  }, [show]);

  const allDocs = previewData?.documents?.allDocs || [];

  const photoDoc = allDocs.find(
    (doc) => doc.displayname?.toLowerCase() === "photo"
  );

  const signatureDoc = allDocs.find(
    (doc) => doc.displayname?.toLowerCase() === "signature"
  );

  const photoUrl = photoDoc?.url || null;
  const signatureUrl = signatureDoc?.url || null;

  const photoDisplayName = photoDoc?.displayname || null;
  const signatureDisplayName = signatureDoc?.displayname || null;

  console.log("Photo:", photoUrl, photoDisplayName);
  console.log("Signature:", signatureUrl, signatureDisplayName);

  useEffect(() => {
    const loadImages = async () => {
      try {
        if (photoUrl) {
          const res = await masterApi.getSasUrl(photoUrl);
          setPhotoSrc(res.replace(/\s+/g, "")); // ✅ SAS URL
          console.log("Photo SAS URL:", res.replace(/\s+/g, ""));
        }

        if (signatureUrl) {
          const res = await masterApi.getSasUrl(signatureUrl);
          setSignatureSrc(res.replace(/\s+/g, "")); // ✅ SAS URL
          console.log("Signature SAS URL:", res.replace(/\s+/g, ""));
        }
      } catch (err) {
        console.error("Failed to load images", err);
      }
    };

    loadImages();
  }, [photoUrl, signatureUrl]);

  if (!previewData) {
    return null;
  }

  console.log("Photo URL:", photoUrl);
  console.log("Signature URL:", signatureUrl);

  console.log("Stored preference:", preferenceData);
  console.log("Preview previewData:", previewData);
  const allDocuments = Object.values(previewData.documents || {}).flat();

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      dialogClassName="bob-preview-modal"
    >
      <Modal.Body className="bob-modal-body position-relative">
        {/* Close Button */}
        <button
          type="button"
          className="btn-close position-absolute"
          style={{ top: '6px', right: '15px', zIndex: 1 }}
          onClick={onHide}
          aria-label="Close"
        />

        {/* ===== HEADER ===== */}
        <div className="bob-header">
          <div className="title_pre">
            <span>{selectedJob?.requisition_code} - {selectedJob?.requisition_title}</span>
          </div>
          <div className="bob-header-title">
            {selectedJob?.position_title ||
              "Deputy Manager : Product - ONDC (Open Network for Digital Commerce)"}
          </div>
        </div>

        {/* ===== ACCORDION ===== */}
        {/* <Accordion defaultActiveKey={["0"]} alwaysOpen className="bob-accordion"> */}
        <Accordion
          activeKey={activeAccordion}
          onSelect={(key) => setActiveAccordion(key)}
          alwaysOpen
          className="bob-accordion"
        >

          {/* === PERSONAL DETAILS === */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Personal Details</Accordion.Header>
            <Accordion.Body>
              <div className="personal-details-wrapper">
                <table className="table table-bordered bob-table w-100 mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-med" style={{ width: "20%" }}>Full Name</td>
                      <td className="fw-reg" colSpan={4} style={{ width: "60%" }}>
                        {previewData.personalDetails.fullName}
                      </td>

                      {/* ✅ Make photo span the full height of the table */}
                      <td
                        rowSpan="3"
                        className="bob-photo-cell align-top text-center"
                        style={{ width: "20%", verticalAlign: "top" }}
                      >
                        <div className="bob-photo-box">
                          <img
                            src={photoSrc || logo_Bob}
                            alt="Applicant Photo"
                            className="img-fluid img1"
                          />

                          <img
                            src={signatureSrc || sign}
                            alt="Signature"
                            className="img-fluid img2"
                          />
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="fw-med">Address</td>
                      <td className="fw-reg" colSpan={4}>{previewData.personalDetails.address}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Permanent Address</td>
                      <td className="fw-reg" colSpan={4}>{previewData.personalDetails.permanentAddress}</td>
                    </tr>

                    <tr >
                      <td className="fw-med" >Mobile</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.mobile}</td>
                      <td className="fw-med">Email</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.email}</td>
                    </tr>

                    <tr >
                      <td className="fw-med">Mother’s Name</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.motherName || "-"}</td>
                      <td className="fw-med">Father’s Name</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.fatherName}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Gender</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.gender_name || "-"}</td>
                      <td className="fw-med">Religion</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.religion_name || "-"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Category</td>
                      <td className="fw-reg" colSpan={2}  >{previewData.personalDetails.reservationCategory_name || "-"}</td>
                      <td className="fw-med">Caste/Community</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.caste || "-"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Date of Birth</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.dob}</td>
                      <td className="fw-med">Nationality</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.nationality_name}</td>


                      {/* <td className="fw-med">Age (as on cut-off date)</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.age || "-"}</td> */}
                    </tr>

                    <tr>
                      <td className="fw-med">Ex-serviceman</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.exService || "N/A"}</td>
                      <td className="fw-med">Physical Disability</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.physicalDisability || "N"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Age (as on cut-off date)</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.age || "-"}</td>
                      <td className="fw-med"></td>
                      <td className="fw-reg" colSpan={2}></td>
                    </tr>

                    <tr>
                      <td className="fw-med">Marital Status</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.maritalStatus_name}</td>
                      <td className="fw-med">Name of Spouse</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.spouseName || "-"}</td>
                    </tr>
                    <tr>
                      <td className="fw-med">Twin Sibling</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.isTwin}</td>
                      {/* <td className="fw-med">Details</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.isTwin === "YES"
                        ? `${previewData.personalDetails.twinName} (${previewData.personalDetails.twinGender_name})`
                        : "-"}</td> */}
                      <td className="fw-med">CIBIL Score</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.cibilScore}</td>
                    </tr>
                    <tr>
                      <td className="fw-med">Current CTC</td>
                      <td className="fw-reg" colSpan={2}>{previewData.experienceSummary?.currentCtc || "-"}</td>
                      <td className="fw-med">Social Media Profile links</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.socialMediaProfileLink}</td>
                      {/* <td className="fw-med">Expected CTC</td>
                      <td className="fw-reg" colSpan={2}>{preferences.ctc ? `₹${Number(preferences.ctc).toLocaleString()}` : "-"}</td> */}
                    </tr>

                    {/* <tr>
                      <td className="fw-med">Location Preference 1</td>
                      <td className="fw-reg" colSpan={2}>{state1?.state_name || "-"}</td>
                      <td className="fw-med">Location Preference 2</td>
                      <td className="fw-reg" colSpan={2}>{state2?.state_name || "-"}</td>
                    </tr> */}

                    {/*<tr>
                       <td className="fw-med">Location Preference 3</td>
                      <td className="fw-reg" colSpan={2}>{state3?.state_name || "-"}</td> 
                      <td className="fw-med">Social Media Profile links</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.socialMediaProfileLink}</td>
                    </tr>*/}

                    <tr>
                      <td className="fw-med">Already secured regular employment under the Central Govt. in civil post?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.centralGovtEmployment || "No"}</td>
                      <td className="fw-med">Serving at a post lower than the one advertised?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.servingLowerPost || "No"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Family member of those who died in 1984 riots?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.familyMember1984 || "No"}</td>
                      <td className="fw-med">Belong to Religious Minority Community?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.religiousMinority || "No"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Whether serving in Govt./ quasi Govt./ Public Sector Undertaking?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.servingInGovt || "No"}</td>
                      <td className="fw-med">Disciplinary action in any of your previous/ Current Employment?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.disciplinaryAction || "No"}</td>
                    </tr>

                    {previewData.personalDetails.disciplinaryAction === "Yes" && (
                      <tr>
                        <td className="fw-med">Details of disciplinary proceedings, if Any</td>
                        <td className="fw-reg" colSpan={5}>{previewData.personalDetails.disciplinaryDetails || "N/A"}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* === EDUCATION DETAILS === */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>Education Details</Accordion.Header>
            <Accordion.Body>
              <div className="table-responsive">
                <table className="table table-bordered bob-table">
                  <thead className="table-header">
                    <tr>
                      <th>S. No</th>
                      <th>Education Level</th>
                      <th>School/College</th>
                      <th>Board</th>
                      <th>Specialization</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.education.map((edu, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>

                        {/* Education Level */}
                        <td>{edu.educationLevel_name || "-"}</td>

                        {/* School / College */}
                        <td>{edu.institution || "-"}</td>

                        {/* Board / Qualification */}
                        <td>{edu.mandatoryQualification_name || "-"}</td>

                        {/* Specialization */}
                        <td>{edu.specialization_name || "-"}</td>

                        {/* Dates */}
                        <td>{edu.startDate || "-"}</td>
                        <td>{edu.endDate || "-"}</td>

                        {/* Percentage */}
                        <td>
                          {edu.percentage !== null && edu.percentage !== undefined
                            ? `${edu.percentage}%`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* === EXPERIENCE DETAILS === */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Experience Details</Accordion.Header>
            <Accordion.Body>
              {/* Experience Summary Cards */}


              {/* Experience Table */}
              <div className="table-responsive">
                <table className="table table-bordered bob-table">
                  <thead className="table-header">
                    <tr>
                      <th>S. No</th>
                      <th>Organization</th>
                      <th>Post</th>
                      <th>Role</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Experience</th>
                      <th>Brief Description of Work</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.experience?.map((exp, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{exp.org}</td>
                        <td>{exp.designation}</td>
                        <td>{exp.department}</td>
                        <td>{exp.from}</td>
                        <td>{exp.to}</td>
                        <td>{exp.duration}</td>
                        <td>{exp.nature}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item>
          {/* === DOCUMENT DETAILS === */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>Documents Details</Accordion.Header>
            <Accordion.Body>
              <table className="table table-bordered bob-table">
                <thead className="table-header">
                  <tr>
                    <th>File Type</th>
                    <th className="textCenter">Action</th>
                    <th>File Type</th>
                    <th className="textCenter">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allDocuments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No documents available
                      </td>
                    </tr>
                  )}

                  {allDocuments.map((doc, index) => {
                    if (index % 2 !== 0) return null; // process in pairs only

                    const nextDoc = allDocuments[index + 1];

                    return (
                      <tr key={index}>
                        {/* LEFT DOCUMENT */}
                        <td>{doc.displayname ? doc.displayname : doc.name}</td>
                        <td className="textCenter">
                           <img
                              src={viewIcon}
                              alt="View"
                              style={{ width: "25px", cursor: "pointer" }}
                              onClick={() => handleEyeClick(doc.url)}
                            />
                        </td>

                        {/* RIGHT DOCUMENT */}
                        {nextDoc ? (
                          <>
                            <td>{nextDoc.displayname ? nextDoc.displayname : nextDoc.name}</td>
                            <td className="textCenter">
                               <img
                                src={viewIcon}
                                alt="View"
                                style={{ width: "25px", cursor: "pointer" }}
                                onClick={() => handleEyeClick(nextDoc.url)}
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td>-</td>
                            <td >-</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4">
            <Accordion.Header>
              Add Preference
            </Accordion.Header>

            <Accordion.Body>
              <div className="row g-3">

                  {/* LOCATION PREFERENCES */}
                  {selectedJob?.isLocationWise && (
                    <>
                      {[1, 2, 3].map((i) => (
                        <React.Fragment key={i}>
                          <div className="col-md-4">
                            <label className="form-label">
                              State Preference {i}
                            </label>
                            <select
                              className="form-control"
                              value={applyForm[`state${i}`]}
                              onChange={(e) => {
                                const stateId = e.target.value;

                                onApplyFormChange(`state${i}`, stateId);
                                onApplyFormChange(`location${i}`, "");

                                fetchLocationsForState(stateId, i);
                              }}
                            >
                              <option value="">Select State</option>

                              {availableStates.map(s => (
                                <option key={s.zonal_state_id} value={s.zonal_state_id}>
                                  {s.state_name}
                                </option>
                              ))}
                            </select>

                          </div>

                        {/* LOCATION */}
                        <div className="col-md-4">
                          <label className="form-label">
                            Location Preference {i}
                          </label>

                          <select
                            className="form-control"
                            value={applyForm[`location${i}`]}
                            disabled={!applyForm[`state${i}`]}
                            onChange={(e) =>
                              onApplyFormChange(`location${i}`, e.target.value)
                            }
                          >
                            <option value="">Select Location</option>

                            {applyForm[`state${i}`] && !(locationsMap[i]?.length) && (
                              <option disabled>Loading locations...</option>
                            )}

                            {(locationsMap[i] || []).map((loc) => (
                              <option
                                key={loc.interviewCentreId}
                                value={loc.interviewCentreId}
                              >
                                {loc.interviewCentre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </React.Fragment>
                    ))}
                  </>
                )}

                {/* ✅ EXPECTED CTC (ONLY FOR CONTRACT) */}
                {selectedJob?.employment_type?.toLowerCase() === "contract" && (
                  <div className="col-md-4">
                    <label className="form-label">
                      Expected CTC (in Lakhs) <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={applyForm.ctc}
                      onChange={(e) => {
                        onApplyFormChange("ctc", e.target.value);
                        setFormErrors(prev => ({ ...prev, ctc: "" }));
                      }}
                    />

                    {formErrors?.ctc && (
                      <div className="invalid-feedback d-block">
                        {formErrors.ctc}
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ EXAM / INTERVIEW CENTER (ALWAYS SHOW) */}
                <div className="col-md-4">
                  <label className="form-label">
                    Exam / Interview Center <span className="text-danger">*</span>
                  </label>

                  <select
                    className="form-control"
                    value={applyForm.examCenter}
                    onChange={(e) => {
                      onApplyFormChange("examCenter", e.target.value);
                      setFormErrors(prev => ({ ...prev, examCenter: null }));
                    }}
                  >
                    <option value="">Select Interview Center</option>

                    {loadingInterviewCentres && (
                      <option disabled>Loading interview centres...</option>
                    )}

                    {interviewCentreOptions.map((centre) => (
                      <option key={centre.interviewCentreId} value={centre.interviewCentreId}>
                        {centre.interviewCentre}
                      </option>
                    ))}
                  </select>

                  {formErrors.examCenter && (
                    <div className="invalid-feedback d-block">
                      {formErrors.examCenter}
                    </div>
                  )}
                </div>

              </div>
            </Accordion.Body>
          </Accordion.Item>

        </Accordion>



        {/* ===== DECLARATION + BUTTONS ===== */}
        <div className="mt-4 text-center">
          {/* <div className="captcha-box mb-3">
            <span className="captcha-text">X A Y 2 U</span>
            <input type="text" className="captcha-input" />
          </div> */}
          <TurnstileWidget onTokenChange={setTurnstileToken} />
          <div className="declaration-box text-start">
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="decl1"
                checked={declarations.decl1}
                onChange={(e) =>
                  setDeclarations((prev) => ({
                    ...prev,
                    decl1: e.target.checked,
                  }))
                }
              />
              <label htmlFor="decl1" className="form-check-label decl">
                I acknowledge that any misrepresentation, omission, or furnishing of
                incorrect information may render my application liable for rejection
                at any stage of the recruitment process.
              </label>
            </div>

            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="decl2"
                checked={declarations.decl2}
                onChange={(e) =>
                  setDeclarations((prev) => ({
                    ...prev,
                    decl2: e.target.checked,
                  }))
                }
              />
              <label htmlFor="decl2" className="form-check-label decl">
                I further confirm that all documents uploaded in this application
                have been provided voluntarily and as per my own understanding.
              </label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="decl3"
                checked={declarations.decl3}
                onChange={(e) =>
                  setDeclarations((prev) => ({
                    ...prev,
                    decl3: e.target.checked,
                  }))
                }
              />
              <label htmlFor="decl3" className="form-check-label decl">
                I declare that I possess the requisite work experience for this post,
                as stipulated in the terms of the advertisement, and undertake to
                submit necessary documents/testimonials in support of the same.
              </label>
            </div>
          </div>


          {/* Footer Buttons */}
          <div className="d-flex justify-content-end align-items-center mt-4">
            {/* <button className="btn btn-outline-secondary" onClick={onBack}>
              ← Back
            </button> */}
            <div className="d-flex gap-3">
              {onEditProfile && (
                <button
                  className="btn edit-button"
                  onClick={onEditProfile}
                >
                  Edit Profile Details
                </button>
              )}
              {/* <button
                className="btn edit-button"
                onClick={onEditProfile}
              >
                Edit Profile Details
              </button> */}
              {onProceedToPayment && (
                <button
                  className="btn btn-bob-orange"
                  disabled={!allChecked}
                  onClick={onProceedToPayment}
                >
                  Proceed for Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PreviewModal;
