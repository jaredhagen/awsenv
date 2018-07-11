# awsenv

awsenv is a module that loads environment variables from AWS Parameter Store into process.env.

## Install

```shell
# with npm
npm install aws-sdk awsenv

# with yarn
yarn add aws-sdk awsenv
```

## Usage

As early as possible in your application, require and configure awsenv

```javascript
// Assuming the following parameters are defined in
// AWS Parameter Store:
//
// - app/production/DB_HOST
// - app/production/DB_USER
// - app/production/DB_PASS
//
// The following config can be used to pull those
// parameters into process.env
require("awsenv")
  .config({
    // path can be used to reduce redundancy when
    // referencing names from AWS Parameter Store
    path: "app/production/"
    parameters: [
      {
        name: "DB_HOST",
      },
      {
        name: "DB_USER",
      },
      {
        name: "DB_PASS",
        // envName can be used to rename variables
        // as they are applied to process.env
        envName: "DB_PASSWORD"
      }
    ],
    region: "us-east-1"
  })
  .then(() => {
    const { DB_HOST, DB_USER, DB_PASSWORD } = process.env;
    // code to run after the environment has been configured
  });
```

## Config

### Options

#### parameters

This value is an array of Parameter objects that define which parameters should be retrieved from the AWS Parameter Store and how those parameters should be named when saved to `process.env`.

Here is an example Parameter object

```javascript
{
  name: "app/production/secret",
  envName: "APP_SECRET"
}
```

The `name` attribute of the Parameter object is the name of the attribute to be retrieved from the AWS Parameter Store.

The `envname` attribute of the Parameter object is the name that should be used when applying the parameter value `process.env`. If the attribute isn't defined the `name` attribute will be used applying the parameter value to `process.env`

```javascript
require("awsenv")
  .config({
    parameters: [
      {
        name: "app/production/DB_HOST",
        envName: "DB_HOST"
      },
      {
        name: "app/production/DB_USER",
        envName: "DB_USER"
      },
      {
        name: "app/production/DB_PASS",
        envName: "DB_PASS"
      }
    ]
  })
  .then(() => {
    const { DB_HOST, DB_USER, DB_PASS } = process.env;
    // code to run after the environment has been configured
  });
```

#### path

The `path` attribute can be used to reduce redundancy in Parameter names.

```javascript
require("awsenv")
  .config({
    path: "app/production/"
    parameters: [
      {
        name: "DB_HOST",
      },
      {
        name: "DB_USER",
      },
      {
        name: "DB_PASS",
      }
    ]
  })
  .then(() => {
    const { DB_HOST, DB_USER, DB_PASS } = process.env;
    // code to run after the environment has been configured
  });
```

#### region

This value is passed to `aws-sdk` when the SSM service is created. This is the AWS region to pull parameters from.

#### withDecryption

Default: true

This value is passed passed to `aws-sdk`. It's then used to decide if secure string values should be decrypted by the SDK. See the [AWS documentation](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_GetParameters.html) for more information.

```javascript
require("awsenv")
  .config({
    parameters: [
      {
        name: "parameter/store/var/that/you/dont/want/decrypted",
        envName: "ENCRYPTED_VAR"
      }
    ],
    withDecryption: false
  })
  .then(() => {
    const { ENCRYPTED_VAR } = process.env;
    // code to run after the environment has been configured
  });
```
