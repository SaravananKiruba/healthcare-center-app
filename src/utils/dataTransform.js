/**
 * Utility functions to transform data between camelCase (frontend) and snake_case (backend)
 */

/**
 * Converts snake_case keys to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} Object with camelCase keys
 */
export function snakeToCamelCase(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelCase);
  }

  return Object.keys(obj).reduce((result, key) => {
    // Convert key from snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    
    // Recursively transform nested objects and arrays
    result[camelKey] = snakeToCamelCase(obj[key]);
    
    return result;
  }, {});
}

/**
 * Converts camelCase keys to snake_case
 * @param {Object} obj - Object with camelCase keys
 * @returns {Object} Object with snake_case keys
 */
export function camelToSnakeCase(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(camelToSnakeCase);
  }
  
  return Object.keys(obj).reduce((result, key) => {
    // Convert key from camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    // Recursively transform nested objects and arrays
    result[snakeKey] = camelToSnakeCase(obj[key]);
    
    return result;
  }, {});
}
