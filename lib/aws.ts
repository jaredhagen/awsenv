import * as AWS from "aws-sdk";

function getSSM(region: string) {
  return new AWS.SSM({ apiVersion: "2014-11-06", region });
}

export { getSSM };
