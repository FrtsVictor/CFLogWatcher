export const customLog = (color: string, print: any) => {
  console.log(`${color}%s\x1b[0m`, print);
};
