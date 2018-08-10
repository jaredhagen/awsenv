import { getSSM } from "./aws";
import { applyParameterToEnv } from "./env";
import { getParameterNames, getParametersWithPath } from "./parameters";
import { Options } from "./types";
import { isFunction, validate } from "./validation";

async function config(options: Options, callback: Function = () => {}) {
  validate(options);

  const parametersWithPath = getParametersWithPath(
    options.path as string,
    options.parameters
  );

  const parameterNames = getParameterNames(parametersWithPath);

  const ssm = getSSM(options.region);

  try {
    const parameterPromises = [];

    const batchSize = 10;
    for (let index = 0; index < parameterNames.length; index += batchSize) {
      const names = parameterNames.slice(index, index + batchSize);
      parameterPromises.push(
        ssm
          .getParameters({
            Names: names,
            WithDecryption: options.withDecryption
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

export { config };
