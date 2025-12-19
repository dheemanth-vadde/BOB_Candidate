import React from "react";
import { Modal } from "react-bootstrap";
import Razorpay from "../../integrations/payments/Razorpay";

const PaymentModal = ({
  show,
  onHide,
  selectedJob,
  candidateId,
  user,
  onPaymentSuccess,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Application</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Please pay the required amount to apply for this job.</p>

        {selectedJob && (
          <div className="mt-3">
            <p className="mb-1">
              <strong>Job:</strong> {selectedJob.position_title}
            </p>
            <p className="mb-1">
              <strong>Requisition:</strong>{" "}
              {selectedJob.requisition_code}
            </p>
            <p className="mb-0">
              <strong>Application Fee:</strong>{" "}
              ₹{(selectedJob?.application_fee_paise ?? 50000) / 100}
            </p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button
          className="btn btn-outline-secondary"
          onClick={onHide}
        >
          Cancel
        </button>

        {selectedJob && (
          <Razorpay
            onSuccess={onPaymentSuccess}
            position_id={selectedJob.position_id}
            amountPaise={selectedJob?.application_fee_paise ?? 50000}
            candidate={{
              id: candidateId,
              full_name: user?.full_name,
              email: user?.email,
              phone: user?.phone,
            }}
          />
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
