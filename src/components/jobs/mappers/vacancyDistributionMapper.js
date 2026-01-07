/**
 * Map Position State Distributions (API)
 * → UI friendly Vacancy Distribution (State-wise)
 */
export const mapVacancyDistributions = (
  positionStateDistributions = [],
  states = [],
  reservationCategories = [],
  disabilities = []
) => {
  if (!Array.isArray(positionStateDistributions)) return [];

  return positionStateDistributions.map(stateDist => {
    /* ===============================
       Resolve State Name
    =============================== */
    const stateName =
      states.find(s => s.state_id === stateDist.stateId)?.state_name || "-";

    /* ===============================
       Initialize Buckets
    =============================== */
    const categories = {};
    const disability = {};

    // ✅ initialize category buckets
    reservationCategories.forEach(cat => {
      categories[cat.category_id] = 0;
    });

    // ✅ initialize disability buckets
    disabilities.forEach(dis => {
      disability[dis.disability_id] = 0;
    });

    /* ===============================
       Populate Values
    =============================== */
    (stateDist.positionCategoryDistributions || []).forEach(item => {
      // CATEGORY
      if (!item.isDisability && item.reservationCategoryId) {
        categories[item.reservationCategoryId] =
          (categories[item.reservationCategoryId] || 0) + item.vacancyCount;
      }

      // DISABILITY
      if (item.isDisability && item.disabilityCategoryId) {
        disability[item.disabilityCategoryId] =
          (disability[item.disabilityCategoryId] || 0) + item.vacancyCount;
      }
    });

    return {
      state_id: stateDist.stateId,
      state_name: stateName,
      total: stateDist.totalVacancies ?? 0,
      categories,
      disability
    };
  });
};
