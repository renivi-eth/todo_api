// удаление дубликатов;
export const removeDublicate = <T extends string | number | boolean>(...rest: T[][]): T[] => {
  return [...new Set(rest.flat()).values()];
};
