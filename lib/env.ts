function applyParameterToEnv({
  envName,
  value
}: {
  envName: string;
  value: string;
}): void {
  process.env[envName] = value;
}

export { applyParameterToEnv };
