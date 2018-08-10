import * as AWS from "aws-sdk";
import { isBoolean, isFunction, isString } from "./utils";

export interface Parameter {
  name: string;
  envName: string;
}

export interface Config {
  path: string;
  parameters: Array<Parameter>;
  region: string;
  withDecryption: boolean;
}

function sanitizePath(path: string) {
  return isString(path) ? path : "";
}

function sanitizeParameters(parameters: Array<Parameter>) {
  return parameters
    .filter(({ name }) => isString(name))
    .map(({ name, envName }) => {
      return {
        name,
        envName: isString(envName) ? envName : name
      };
    });
}

function sanitizeRegion(region: string) {
  return isString(region) ? region : undefined;
}

function sanitizeWithDecryption(withDecryption: boolean) {
  return isBoolean(withDecryption) ? withDecryption : true;
}

function sanitizeConfig(config: Config) {
  const path = sanitizePath(config.path);
  const parameters = sanitizeParameters(config.parameters);
  const region = sanitizeRegion(config.region);
  const withDecryption = sanitizeWithDecryption(config.withDecryption);

  return {
    path,
    parameters,
    region,
    withDecryption
  };
}

function applyParameterToEnv({
  envName,
  value
}: {
  envName: string;
  value: string;
}) {
  process.env[envName] = value;
}

async function config(config: Config, callback: Function) {
  const sanitizedConfig = sanitizeConfig(config);

  const { parameters, path, region, withDecryption } = sanitizedConfig;

  const parametersWithPath = parameters.map(parameter => {
    return {
      ...parameter,
      name: `${path}${parameter.name}`
    };
  });

  const ssm = new AWS.SSM({ apiVersion: "2014-11-06", region });

  let parameterNames = parametersWithPath.map(({ name }) => name);

  try {
    const parameterPromises = [];

    const batchSize = 10;
    for (let index = 0; index < parameterNames.length; index += batchSize) {
      const names = parameterNames.slice(index, index + batchSize);
      parameterPromises.push(
        ssm
          .getParameters({
            Names: names,
            WithDecryption: withDecryption
          })
          .promise()
      );
    }

    const awsResponses = await Promise.all(parameterPromises);

    const awsParameters = awsResponses.reduce(
      (parameters, awsResponse) => parameters.concat(awsResponse.Parameters),
      [] as any
    );

    const parametersWithValues = awsParameters.map((awsParameter: any) => {
      const parameterConfig = parametersWithPath.find(
        ({ name }) => name === awsParameter.Name
      );
      return {
        ...parameterConfig,
        value: awsParameter.Value
      };
    });

    parametersWithValues.forEach(applyParameterToEnv);

    if (isFunction(callback)) {
      callback(null, parametersWithValues);
    }
    return parametersWithValues;
  } catch (err) {
    if (isFunction(callback)) {
      callback(err);
    }
    throw err;
  }
}

module.exports = {
  config
};
