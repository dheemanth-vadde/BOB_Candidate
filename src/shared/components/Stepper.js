import React from "react";
import "./../../css/Stepper.css";
import whiteCheck from '../../assets/white-check.png'

const Stepper = ({ steps, activeStep, isProfileCompleted }) => {
  return (
    <div className="stepper-container">
      {steps.map((step, index) => {
        const isActive = index === activeStep;

        // 🔑 All completed if profile completed
        const isCompleted = isProfileCompleted || index < activeStep;

        return (
          <React.Fragment key={index}>
            <div
              className={`step-item
                ${isCompleted ? "completed" : ""}
                ${isActive ? "active" : ""}
              `}
            >
             <div className="step_circle">
                {isCompleted && !(isProfileCompleted && isActive) ? (
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

            {index !== steps.length - 1 && (
              <div
                className={`step-line ${
                  isCompleted ? "completed" : ""
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};


export default Stepper;
