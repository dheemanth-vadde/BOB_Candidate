import Accordion from "react-bootstrap/Accordion";
import EducationForm from "./EducationForm";
import Loader from '../../../shared/components/Loader';
import BackButtonWithConfirmation from "../../../shared/components/BackButtonWithConfirmation";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEducationDetails } from "../hooks/educationHooks";
import NextButtonWithConfirmation from "../../../shared/components/NextButtonWithConfirmation";

const EducationDetails = ({ goNext, goBack }) => {
  const {
    educations,
    masterData,
    loading,
    isDirty,
    activeAccordionKey,
    setActiveAccordionKey,
    getRef,
    addEducation,
    deleteEducation,
    refreshEducation,
    getExistingRanges,
    saveAndNext,
    setIsDirty
  } = useEducationDetails({ goNext });

  return (
    <div className="px-4 py-3 border bg-white accordion_div">
        <Accordion activeKey={activeAccordionKey} onSelect={(k) => setActiveAccordionKey(k)}>
          {educations.length > 0 ? (
            educations.map((edu, index) => (
              <Accordion.Item key={edu.uiId} eventKey={String(index)}>
                <Accordion.Header>
                  <div className="d-flex align-items-center justify-content-between w-100 gap-2">
                    <p className="tab_headers mb-0">{edu.label}</p>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <EducationForm
                    goNext={goNext}
                    educationId={edu.educationId}
                    existingData={edu.data}
                    parsedId={edu.parsedId}
                    masterData={masterData}
                    refreshEducation={refreshEducation}
                    onDirtyChange={setIsDirty}
                    onDelete={deleteEducation}
                    ref={getRef(String(index))}
                    existingRanges={getExistingRanges(edu.uiId)}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))
          ) : null}
        </Accordion>

      <div className="d-flex justify-content-center">
        <button
          className="btn blue-button"
          onClick={addEducation}
        >
          + Add Education
        </button>
      </div>

      {/* Bottom Nav Buttons — UNCHANGED */}
      <div className="d-flex justify-content-between mt-5">
        <BackButtonWithConfirmation goBack={goBack} isDirty={isDirty} />
        <NextButtonWithConfirmation
          onNext={saveAndNext}
          isDirty={isDirty}
        />
        {/* <button
          type="button"
          className="btn btn-primary"
          style={{
            backgroundColor: "#ff7043",
            border: "none",
            padding: "0.6rem 2rem",
            borderRadius: "4px",
            color: "#fff",
            fontSize: '0.875rem'
          }}
          onClick={saveAndNext}
        >
          Save & Next
          <FontAwesomeIcon icon={faChevronRight} size='sm' className="ms-2" />
        </button> */}
      </div>

      {loading && (
				<Loader />
			)}

    </div>
  );
};

export default EducationDetails;
