import React from "react";
import "./../css/Stepper.css";

const Stepper = ({ steps, activeStep, onStepChange }) => {
  return (
    <div className="stepper-container">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;

        return (
          <div
            key={index}
            className={`step-item ${isActive ? "active" : ""} ${
              isCompleted ? "completed" : ""
            }`}
            onClick={() => onStepChange(index)}
          >
            <div className="step-circle">
              {isCompleted ? "✓" : index + 1}
            </div>

            <div className="step-label">{step}</div>

            {index !== steps.length - 1 && (
              <div className="step-line" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
