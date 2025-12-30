import React from "react";
import { Modal } from "react-bootstrap";

const ValidationErrorModal = ({
  show,
  onClose,
  message,
}) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="text-center p-4">
        <p className="mb-4">
          {message ||
            "Your profile does not meet the requirements for this job. Please update your profile."}
        </p>

        <button
          className="btn btn-bob-orange px-4"
          onClick={onClose}
        >
          OK
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default ValidationErrorModal;
