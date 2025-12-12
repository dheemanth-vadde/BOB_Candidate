import Accordion from "react-bootstrap/Accordion";
import EducationForm from "./EducationForm";

const EducationDetails = ({ goNext, goBack }) => {
  return (
    <div className="px-4 py-3 border rounded bg-white accordion_div">

      <Accordion defaultActiveKey="0">

        {/* --- ACCORDION 1 --- */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <p className="tab_headers" style={{ marginBottom: 0 }}>SSC (If Applicable)</p>
          </Accordion.Header>
          <Accordion.Body>
            <EducationForm goNext={goNext} showDegree={false} showSpecialization={false} />
          </Accordion.Body>
        </Accordion.Item>

        {/* --- ACCORDION 2 --- */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <p className="tab_headers" style={{ marginBottom: 0 }}>Intermediate/Diploma (If Applicable)</p>
          </Accordion.Header>
          <Accordion.Body>
            <EducationForm goNext={goNext} showDegree={true} showSpecialization={true} />
          </Accordion.Body>
        </Accordion.Item>

        {/* --- ACCORDION 3 --- */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <p className="tab_headers" style={{ marginBottom: 0 }}>Graduation (If Applicable)</p>
          </Accordion.Header>
          <Accordion.Body>
            <EducationForm goNext={goNext} showDegree={true} showSpecialization={true} />
          </Accordion.Body>
        </Accordion.Item>

        {/* --- ACCORDION 4 --- */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <p className="tab_headers" style={{ marginBottom: 0 }}>Post-Graduation (If Applicable)</p>
          </Accordion.Header>
          <Accordion.Body>
            <EducationForm goNext={goNext} showDegree={true} showSpecialization={true} />
          </Accordion.Body>
        </Accordion.Item>

      </Accordion>

			<div className="d-flex justify-content-center">
				<button className="btn blue-button">+ Add Education</button>
			</div>

      {/* Bottom Nav Buttons */}
      <div className="d-flex justify-content-between mt-5">
        <button type="button" className="btn btn-outline-secondary" onClick={goBack}>Back</button>
        <button type="button" className="btn btn-primary" style={{
          backgroundColor: "#ff7043",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          color: "#fff"
        }} onClick={goNext}>
          Save and Next
        </button>
      </div>

    </div>
  );
};

export default EducationDetails;
