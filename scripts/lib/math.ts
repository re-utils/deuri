export const math = {
  truncate: (n: number): number => (n < 0.01 ? n : Math.round(n * 100) / 100),
};
