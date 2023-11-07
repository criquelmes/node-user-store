import { CustomError } from "../errors/custom.error";

export class UserEntity {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public emailVerified: boolean,
    public password: string,
    public role: string[],
    public img?: string
  ) {}

  static fromObject(object: { [key: string]: any }) {
    const { id, _id, name, email, emailVerified, password, role, img } = object;

    if (!id && !_id) {
      throw CustomError.badRequest("Missing id");
    }

    if (!name) throw CustomError.badRequest("Missing name");
    if (!email) throw CustomError.badRequest("Missing email");
    if (emailVerified === undefined)
      throw CustomError.badRequest("Missing emailVerified");
    if (!password) throw CustomError.badRequest("Missing password");
    if (!role) throw CustomError.badRequest("Missing role");

    return new UserEntity(
      id || _id,
      name,
      email,
      emailVerified,
      password,
      role,
      img
    );
  }
}
