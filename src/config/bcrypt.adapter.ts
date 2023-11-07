import { compareSync, genSaltSync, hashSync } from "bcryptjs";

// Todo: Cambiar a clase
export const bcryptAdapter = {
  hash: (password: string) => {
    const salt = genSaltSync();
    return hashSync(password, salt);
  },
  compare: (password: string, hashed: string) => {
    return compareSync(password, hashed);
  },
};
