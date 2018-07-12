const AWS = require("aws-sdk");

const { isBoolean, isFunction, isString } = require("./utils");

function sanitizePath(path) {
  return isString(path) ? path : "";
}

function sanitizeParameters(parameters) {
  return parameters
    .filter(({ name }) => isString(name))
    .map(({ name, envName }) => {
      return {
        name,
        envName: isString(envName) ? envName : name
      };
    });
}

function sanitizeRegion(region) {
  return isString(region) ? region : undefined;
}

function sanitizeWithDecryption(withDecryption) {
  return isBoolean(withDecryption) ? withDecryption : true;
}

function sanitizeConfig(config) {
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

function applyParameterToEnv({ envName, value }) {
  process.env[envName] = value;
}

async function config(config, callback) {
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
    const awsResponse = await ssm
      .getParameters({
        Names: parameterNames,
        WithDecryption: withDecryption
      })
      .promise();

    const awsParameters = awsResponse.Parameters;

    const parametersWithValues = awsParameters.map(awsParameter => {
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
