import React from "react";
import "./../../css/Stepper.css";
import whiteCheck from '../../assets/white-check.png'

const Stepper = ({ steps, activeStep }) => {
  return (
    <div className="stepper-container">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;

        return (
          <React.Fragment key={index}>
            <div
              className={`step-item ${isActive ? "active" : ""} ${
                isCompleted ? "completed" : ""
              }`}
            >
              <div className="step_circle">
                {isCompleted ? (
                  <img
                    src={whiteCheck}
                    alt="Completed"
                    className="step-check-icon"
                  />
                ) : (
                  index + 1
                )}
              </div>
              <div className="step-label">{step}</div>
            </div>

            {/* Render line only if it's not the last step */}
            {index !== steps.length - 1 && (
              <div className={`step-line ${isCompleted ? "completed" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
