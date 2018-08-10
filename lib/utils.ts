function isBoolean(value: any): boolean {
  return typeof value === "boolean";
}

function isFunction(value: any): boolean {
  return typeof value === "function";
}

function isString(value: any): boolean {
  return typeof value === "string" || value instanceof String;
}

export { isBoolean, isFunction, isString };
