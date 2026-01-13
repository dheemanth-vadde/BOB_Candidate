export const formatExperience = (months = 0) => {
  if (!months || months <= 0) return "0";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years && remainingMonths) {
    return `${years}y ${remainingMonths}m`;
  }
  if (years) return `${years}y`;
  return `${remainingMonths}m`;
};
