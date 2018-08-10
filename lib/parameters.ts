import { Parameter } from "./types";

function getParametersWithPath(path: string, parameters: Array<Parameter>) {
  return parameters.map(parameter => {
    return {
      ...parameter,
      name: `${path}${parameter.name}`
    };
  });
}

function getParameterNames(parameters: Array<Parameter>): Array<string> {
  return parameters.map(({ name }) => name);
}

export { getParameterNames, getParametersWithPath };
