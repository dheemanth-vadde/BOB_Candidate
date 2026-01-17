export const extractValidationErrors = (data) => {
  const errors = [];
  if (!data) return errors;

  // 1️⃣ Age
  const age = data.ageValidation;
  if (age && !age.passed) {
    if (Array.isArray(age.stateWiseAgeValidations) && age.stateWiseAgeValidations.length) {
      age.stateWiseAgeValidations.forEach(state => {
        if (!state.passed) { 
          errors.push(
            `Your age does not meet the eligibility requirement. Allowed age: ${state.allowedAge}.`
          );
        }
      });
    } else {
      errors.push(
        `Your age does not meet the eligibility requirement. Allowed age: ${age.allowedAge}.`
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
