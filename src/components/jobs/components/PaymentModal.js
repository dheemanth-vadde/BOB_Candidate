import React from "react";
import { Modal } from "react-bootstrap";
import Razorpay from "../../integrations/payments/Razorpay";
import "../../../css/PaymentModal.css";

const PaymentModal = ({
  show,
  onHide,
  selectedJob,
  candidateId,
  user,
  onPaymentSuccess,
}) => {
  const amount =
    (selectedJob?.application_fee_paise ?? 50000) / 100;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      backdrop="static"
      className="payment-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm & Pay</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="payment-subtitle">
          Please review the details and proceed with payment.
        </p>

        {selectedJob && (
          <div className="payment-summary-card">
            <div className="summary-row">
              <span>Job Position</span>
              <strong>{selectedJob.position_title}</strong>
            </div>

            <div className="summary-row">
              <span>Requisition Code</span>
              <strong>{selectedJob.requisition_code}</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total-row">
              <span>Application Fee</span>
              <strong className="amount">₹{amount}</strong>
            </div>
          </div>
        )}

        <div className="payment-note">
          🔒 Payments are secure and powered by Razorpay.
        </div>
      </Modal.Body>

      <Modal.Footer className="payment-footer">
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
              full_name: user?.data?.user?.full_name,
              email: user?.data?.user?.email,
              phone: user?.data?.user?.phone,
            }}
          />
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
