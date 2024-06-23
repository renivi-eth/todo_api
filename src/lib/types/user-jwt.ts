export interface IUserJWT {
  id: string;
  role: string[];
  iat: number;
  exp: number;
}
