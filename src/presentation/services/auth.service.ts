import { JwtAdapter, bcryptAdapter } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";

export class AuthService {
  constructor() {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(registerUserDto);

      user.password = bcryptAdapter.hash(registerUserDto.password);

      await user.save();

      /*
      Todo: Encriptar la contraseña
      Todo: JWT - Para mantener la sesión del usuario
      Todo: Enviar un email de verificación
       */

      const { password, ...userEntity } = UserEntity.fromObject(user);

      return { user: userEntity, token: "ASD" };
    } catch (error) {
      throw CustomError.internalServerError(`${error}`);
    }
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const user = await UserModel.findOne({ email: loginUserDto.email });
    if (!user) throw CustomError.badRequest("Email or password incorrect");

    const isMatch = bcryptAdapter.compare(loginUserDto.password, user.password);
    if (!isMatch) throw CustomError.badRequest("Email or password incorrect");

    const { password, ...userEntity } = UserEntity.fromObject(user);

    const token = await JwtAdapter.generateToken({
      id: user.id,
      email: user.email,
    });
    if (!token) throw CustomError.internalServerError("Error generating token");

    return {
      user: userEntity,
      token: token,
    };
  }
}
