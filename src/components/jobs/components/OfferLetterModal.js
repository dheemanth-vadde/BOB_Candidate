import { Modal } from "react-bootstrap";
import { useState } from "react";
import { toast } from "react-toastify";
import jobsApiService  from "../services/jobsApiService";
const OfferLetterModal = ({ show, onHide, offerData, onDecisionSuccess }) => {
    const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  if (!offerData) return null;
const handleDecision = async (accepted) => {
  try {
   if (!accepted && !comments.trim()) {
      toast.error("Please enter comments before rejecting the offer");
      return;
    }

    setLoading(true);

    const payload = {
      applicationId: offerData.applicationId,
      offerAccepted: accepted,
      comments
    };

    await jobsApiService.updateOfferDecision(payload);

    toast.success(
      accepted ? "Offer accepted successfully" : "Offer rejected successfully"
    );

    setComments("");
    onDecisionSuccess?.();  
    onHide();

  } catch (err) {
    console.error("Offer decision failed", err);
    toast.error("Failed to submit decision");
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Offer Letter</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ height: "75vh", padding: 0 }}>
        <iframe
          src={offerData.fileUrl}   // ✅ FROM API
          title="Offer Letter"
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </Modal.Body>

   <Modal.Footer className="flex-column align-items-stretch">

  {/* COMMENTS */}
  <div className="w-100 mb-3">
    <label className="form-label fw-semibold">Comments</label>
    <textarea
      className="form-control"
      rows={3}
      placeholder="Enter comments..."
      value={comments}
      onChange={(e) => setComments(e.target.value)}
    />
  </div>

  {/* ACTION BUTTONS */}
  <div className="d-flex justify-content-end gap-2 w-100">
    <button
      className="btn btn-danger"
      disabled={loading}
      onClick={() => handleDecision(false)}
    >
      Reject
    </button>

    <button
      className="btn btn-success"
      disabled={loading}
      onClick={() => handleDecision(true)}
    >
      Accept
    </button>
  </div>

</Modal.Footer>

    </Modal>
  );
};

export default OfferLetterModal;