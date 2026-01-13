import { Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import jobsApiService from "../services/jobsApiService";
import "../../../css/Offerletter.css";

const OfferLetterModal = ({ show, onHide, offerData, onDecisionSuccess }) => {
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [medicalLocations, setMedicalLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    const fetchMedicalLocations = async () => {
      if (!show) return;

      setIsLoadingLocations(true);
      try {
        const response = await jobsApiService.getMedicalLocations();
        setMedicalLocations(response.data || []);
      } catch (error) {
        console.error("Failed to fetch medical locations:", error);
        toast.error("Failed to load medical locations");
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchMedicalLocations();
  }, [show]);

  if (!offerData) return null;

  const handleDecision = async (accepted) => {
    try {
      if (!accepted && !comments.trim()) {
        setCommentError("Please enter comments before rejecting the offer");
        return;
      }
      setCommentError("");
      setLoading(true);

      if (!selectedLocation && accepted) {
        toast.error("Please select a medical location");
        return;
      }

      const payload = {
        applicationId: offerData.applicationId,
        offerAccepted: accepted,
        medicalCentreId: selectedLocation,
        comments: comments || ""
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
    <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="offer-modal">
      <Modal.Header closeButton>
        <Modal.Title className="lettertitle">Offer Letter</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ height: "75vh", padding: 0 }}>
        {/* <iframe
          src={offerData.fileUrl}   // FROM API
          title="Offer Letter"
          width="100%"
          height="100%"
          style={{ border: "none" }}
        /> */}
        {offerData?.fileUrl ? (
          <object
            data={offerData.fileUrl}
            type="application/pdf"
            width="100%"
            height="100%"
          >
            {/* Fallback if PDF cannot render */}
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <p className="text-muted mb-2">
                Unable to display the offer letter.
              </p>
              <a
                href={offerData.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                Open / Download Offer Letter
              </a>
            </div>
          </object>
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <span className="text-muted">Loading offer letter…</span>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="flex-row align-items-stretch">
        <div className="row gx-3">
          {/* MEDICAL LOCATION - Left Column */}
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Medical Location</label>
              <select 
                className="form-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={isLoadingLocations}
              >
                <option value="">Select Medical Location</option>
                {medicalLocations.map((location) => (
                  <option key={location.medicalCentreId} value={location.medicalCentreId}>
                    {location.medicalCentre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* COMMENTS - Right Column */}
          <div className="col-md-6">
            <div className="mb-3 h-100 d-flex flex-column">
              <label className="form-label">Comments</label>
              <textarea
                className="form-control flex-grow-1"
                placeholder="Enter comments..."
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                  if (commentError) setCommentError("");
                }}
              />
              {commentError && (
                <div className="invalid-feedback d-block">
                  {commentError}
                </div>
              )}
            </div>
          </div>
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