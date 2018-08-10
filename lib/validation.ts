import { Options } from "./types";

function isArray(value: any): boolean {
  return Array.isArray(value);
}

function isBoolean(value: any): boolean {
  return typeof value === "boolean";
}

function isUndefined(value: any): boolean {
  return typeof value === "undefined";
}

function isFunction(value: any): boolean {
  return typeof value === "function";
}

function isString(value: any): boolean {
  return typeof value === "string" || value instanceof String;
}

function validate({
  parameters,
  path,
  region,
  withDecryption
}: Options): Options {
  if (!isArray(parameters)) {
    throw new Error(
      "Unexpected value for option 'parameters'.  Expected an array."
    );
  } else {
    parameters.forEach((parameter, index) => {
      if (!isString(parameter.name)) {
        throw new Error(
          `Unexpected value for attribute 'name' for parameter at index ${index}. Expected a string.`
        );
      }
    });
  }

  if (!isString(path) && !isUndefined(path)) {
    throw new Error(
      "Unexpected value for option 'path'. Expected a string or undefined."
    );
  }

  if (!isString(region)) {
    throw new Error("Unexpected value for option 'region'. Expected a string.");
  }

  if (!isBoolean(withDecryption) && !isUndefined(withDecryption)) {
    throw new Error(
      "Unexpected value for option 'withDecryption'. Expected a boolean or undefined."
    );
  }

  return {
    parameters,
    path,
    region,
    withDecryption
  };
}

export { isBoolean, isFunction, isString, validate };
