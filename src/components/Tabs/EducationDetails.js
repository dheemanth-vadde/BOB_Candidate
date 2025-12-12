import Accordion from "react-bootstrap/Accordion";
import EducationForm from "./EducationForm";

const EducationDetails = ({ goNext, goBack }) => {
  return (
    <div className="px-4 py-3 border rounded bg-white">

      <Accordion defaultActiveKey="0">

        {/* --- ACCORDION 1 --- */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <p className="tab_headers" style={{ marginBottom: 0 }}>Education Details 1</p>
          </Accordion.Header>
          <Accordion.Body>
            <EducationForm goNext={goNext} />
          </Accordion.Body>
        </Accordion.Item>

        {/* --- ACCORDION 2 --- */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <p className="tab_headers" style={{ marginBottom: 0 }}>Education Details 2</p>
          </Accordion.Header>
          <Accordion.Body>
            <EducationForm goNext={goNext} />
          </Accordion.Body>
        </Accordion.Item>

        {/* --- ACCORDION 3 --- */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <p className="tab_headers" style={{ marginBottom: 0 }}>Education Details 3</p>
          </Accordion.Header>
          <Accordion.Body>
            <EducationForm goNext={goNext} />
          </Accordion.Body>
        </Accordion.Item>

        {/* --- ACCORDION 4 --- */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <p className="tab_headers" style={{ marginBottom: 0 }}>Education Details 4</p>
          </Accordion.Header>
          <Accordion.Body>
            <EducationForm goNext={goNext} />
          </Accordion.Body>
        </Accordion.Item>

      </Accordion>

      {/* Bottom Nav Buttons */}
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="btn btn-outline-secondary" onClick={goBack}>Back</button>
        <button type="button" className="btn btn-primary" style={{
          backgroundColor: "#ff7043",
          border: "none",
          padding: "8px 24px",
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
