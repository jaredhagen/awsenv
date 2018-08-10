export interface Options {
  path?: string;
  parameters: Array<Parameter>;
  region: string;
  withDecryption?: boolean;
}

export interface Parameter {
  name: string;
  envName?: string;
}
