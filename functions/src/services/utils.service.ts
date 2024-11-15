export const isProdEnv = () => {
  const projectId = process.env.GCLOUD_PROJECT;
  return projectId === 'fortliving-dev';
};

export const toNormalCase = (fieldName: string) => {
  return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => {
    return str.toUpperCase();
  });
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
