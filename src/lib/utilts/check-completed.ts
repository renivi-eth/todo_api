export const completedCheck = (req: string | undefined): boolean | undefined => {
  switch (req) {
    case 'true':
      return true;
    case 'false':
      return false;
  }
};
