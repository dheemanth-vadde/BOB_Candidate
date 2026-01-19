export const extractValidationErrors = (data) => {
  const errors = [];
  if (!data) return errors;

  /* ======================
   1️⃣ AGE VALIDATION
   ====================== */
  const age = data.ageValidation;

  if (age) {
    const failedStates =
      Array.isArray(age.stateWiseAgeValidations)
        ? age.stateWiseAgeValidations.filter(s => !s.passed)
        : [];

    // ❌ HARD FAILURE (no state eligible)
    if (!age.passed) {
      if (failedStates.length > 0) {
        const stateNames = failedStates.map(s => s.stateName);

        errors.push(
          <span>
            Your age does not meet the eligibility requirement in{" "}
            <strong>{stateNames.join(", ")}</strong>. Allowed age:{" "}
            {failedStates[0].allowedAge}.
          </span>
        );
      } else {
        errors.push(
          <span>
            Your age does not meet the eligibility requirement.
          </span>
        );
      }
    }


    // // ⚠️ PARTIAL RESTRICTION (some states blocked)
    // else if (failedStates.length > 0) {
    //   const passedStates = age.stateWiseAgeValidations.filter(s => s.passed);

    //   const allowedStateNames = passedStates.map(s => s.stateName).join(", ");
    //   const blockedStateNames = failedStates.map(s => s.stateName).join(", ");

    //   errors.push(
    //     `You are eligible to apply for positions in the following state(s): ${allowedStateNames}. ` +
    //     `You cannot apply for positions in: ${blockedStateNames}, due to age criteria.`
    //   );
    // }
      else if (failedStates.length > 0) {
        const passedStates = age.stateWiseAgeValidations.filter(s => s.passed);

        const allowedStateNames = passedStates.map(s => s.stateName).join(", ");
        const blockedStateNames = failedStates.map(s => s.stateName).join(", ");

        const allowedAge = failedStates[0]?.allowedAge;

        errors.push(
          <span>
            You are eligible to apply for positions in the following state(s):{" "}
            {allowedStateNames}.{" "}
            You cannot apply for positions in:{" "}
            <strong>{blockedStateNames}</strong>, due to age criteria.{" "}
            Allowed age: {allowedAge}.
          </span>
        );
      }
  }


  // 2️⃣ Experience
  const exp = data.experienceValidation;
  if (exp && !exp.passed) {
    errors.push(
      `Your experience does not meet the required criteria. Required: ${exp.requiredExperience}, Your experience: ${exp.candidateExperience}.`
    );
  }

  // 3️⃣ Education
  const edu = data.educationValidation;
  if (edu && !edu.passed) {
    if (edu.mandatoryEducation?.length) {
      errors.push(
        `Please update your education details. Required qualification(s): ${edu.mandatoryEducation.join(", ")}.`
      );
    } else {
      errors.push(
        "Your education details do not meet the eligibility requirements."
      );
    }
  }

  // 4️⃣ Documents
  const docs = data.documentValidation;
  if (docs && !docs.passed) {
    const missingDocs = docs.requiredDocuments.filter(
      d => !docs.submittedDocuments.includes(d)
    );

    if (missingDocs.length > 0) {
      errors.push(
        `Please upload the following mandatory document(s): ${missingDocs.join(", ")}.`
      );
    }
  }

  return errors;
};
