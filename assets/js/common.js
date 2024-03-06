"use strict";

/**
 * true, "true" -> true
 * false, "false" -> false
 * null -> defaultValue
 * anything else -> throw
 */
function toBool(value, defaultValue) {
  if (defaultValue !== true && defaultValue !== false) {
    throw "Invalid default " + defaultValue;
  }
  if (value === null) {
    return defaultValue;
  } else if (value === true || value === "true") {
    return true;
  } else if (value === false || value === "false") {
    return false;
  } else {
    throw "Invalid value " + value;
  }
  return value;
}
