export const getAbsoluteUrl = (path: string) => {
  if (typeof window !== 'undefined') return path;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`;
  }

  return `${process.env.BASE_URL}${path}`;
};
