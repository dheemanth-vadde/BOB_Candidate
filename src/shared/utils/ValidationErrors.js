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
            `Age criteria not met for ${state.stateName} (Allowed: ${state.allowedAge})`
          );
        }
      });
    } else {
      errors.push(`Age criteria not met (Allowed: ${age.allowedAge})`);
    }
  }

  // 2️⃣ Experience
  const exp = data.experienceValidation;
  if (exp && !exp.passed) {
    errors.push(
      `Experience requirement not met (Required: ${exp.requiredExperience}, Yours: ${exp.candidateExperience})`
    );
  }

  // 3️⃣ Education
  const edu = data.educationValidation;
  if (edu && !edu.passed) {
    if (edu.mandatoryEducation?.length) {
      errors.push(
        `Missing mandatory education: ${edu.mandatoryEducation.join(", ")}`
      );
    } else {
      errors.push("Mandatory education qualification requirement not met");
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
        `Missing mandatory documents: ${missingDocs.join(", ")}`
      );
    }
  }

  return errors;
};
