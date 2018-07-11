function isBoolean(value) {
  return typeof value === "boolean";
}

function isFunction(value) {
  return typeof value === "function";
}

function isString(value) {
  return typeof value === "string" || value instanceof String;
}

module.exports = {
  isBoolean,
  isFunction,
  isString
};
