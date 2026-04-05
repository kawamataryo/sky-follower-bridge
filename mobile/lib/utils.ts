export const isOneSymbol = (str: string): boolean => {
  return /^[^\w\s]$/.test(str);
};

export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
