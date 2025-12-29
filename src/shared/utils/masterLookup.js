/**
 * Generic master lookup utility
 *
 * @param {Object} masters - full master data object
 * @param {String} masterKey - "departments", "cities", "jobGrade", etc.
 * @param {String} id - ID to search
 * @param {String} idKey - ID field name in that master
 * @returns {Object|null}
 */
export const getMasterById = (
  masters,
  masterKey,
  id,
  idKey = "id"
) => {
  if (!masters || !masterKey || !id) {
    console.log(`Invalid params: masters=${!!masters}, masterKey=${!!masterKey}, id=${!!id}`);
    return null;
  }

  const list = masters[masterKey];
  console.log(`Looking for ${idKey}=${id} in ${masterKey}`, list);      
  if (!Array.isArray(list)) {
    console.log(`Master key "${masterKey}" is not an array`);
    return null;
  }

  const found = list.find(item => item[idKey] === id);
  console.log(`Found:`, found);
  return found || null;
};
