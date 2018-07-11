const AWS = require("aws-sdk");

const { isBoolean, isFunction, isString } = require("./utils");

function sanitizePath(path) {
  // If path isn't a string default it to undefined
  return isString(path) ? path : undefined;
}

function sanitizeParameters(parameters) {
  return (
    // Filter out any parameters don't have a string name
    parameters
      .filter(({ name }) => isString(name))
      // If envName isn't
      .map(parameter => {
        const { name, envName } = parameter;

        return {
          name,
          envName: isString(envName) ? envName : name
        };
      })
  );
}

function sanitizeRegion(region) {
  return isString(region) ? region : undefined;
}

function sanitizeWithDecryption(withDecryption) {
  // If withDecryption isn't a boolean default it to true
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

function mapParametersToEnv(parameters, config) {
  config.parameters.forEach(configParameter => {
    const { name, envName } = configParameter;

    const parameter = parameters.find(parameter => {
      const awsName = config.path
        ? parameter.Name.substring(config.path.length)
        : parameter.Name;

      return awsName === name;
    });

    if (parameter) {
      const parameterValue = parameter.Value;
      process.env[envName] = parameterValue;
    }
  });
}

async function config(config, callback) {
  const sanitizedConfig = sanitizeConfig(config);

  const { parameters, path, region, withDecryption } = sanitizedConfig;

  const ssm = new AWS.SSM({ apiVersion: "2014-11-06", region });

  let parameterNames = parameters.map(({ name }) => name);

  if (path) {
    parameterNames = parameterNames.map(name => `${path}${name}`);
  }

  const params = {
    Names: parameterNames,
    WithDecryption: withDecryption
  };

  try {
    const awsResponse = await ssm.getParameters(params).promise();

    mapParametersToEnv(awsResponse.Parameters, sanitizedConfig);

    if (isFunction(callback)) {
      callback(null, awsResponse);
    }
    return awsResponse;
  } catch (err) {
    if (isFunction(callback)) {
      callback(err);
    }
    throw err;
  }
}

module.exports = {
  config: config
};
