import { Modal } from "react-bootstrap";

const OfferLetterModal = ({ show, onHide, pdfUrl }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Offer Letter</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ height: "75vh", padding: 0 }}>
        <iframe
            src="/offers/Novartis_Afinitor.pdf"
            title="Offer Letter"
            width="100%"
            height="100%"
            style={{ border: "none" }}
        />
    </Modal.Body>

      <Modal.Footer className="">
        <button className="btn btn-danger">Reject</button>
        <button className="btn btn-success">Accept</button>
      </Modal.Footer>
    </Modal>
  );
};
export default OfferLetterModal;