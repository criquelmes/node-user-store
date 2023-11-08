import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";
import { EmailService } from "./email.service";

export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(registerUserDto);

      user.password = bcryptAdapter.hash(registerUserDto.password);

      await user.save();
      await this.sendEmailVerification(user.email);

      const { password, ...userEntity } = UserEntity.fromObject(user);

      const token = await JwtAdapter.generateToken({
        id: user.id,
      });
      if (!token)
        throw CustomError.internalServerError("Error generating token");

      return { user: userEntity, token: token };
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

  private sendEmailVerification = async (email: string) => {
    const token = await JwtAdapter.generateToken({ email });
    if (!token) throw CustomError.internalServerError("Error generating token");

    const url = `${envs.WEBSERVICE_URL}/auth/verify-email/${token}`;

    const html = `
    <h1>Verify your email</h1>
    <p>Click on the following url to verify your email</p>
    <a href="${url}">Validate your email</a>
    `;

    const options = {
      to: email,
      subject: "Verify your email",
      htmlBody: html,
    };

    const isSet = await this.emailService.sendEmail(options);
    if (!isSet) throw CustomError.internalServerError("Error sending email");

    return true;
  };

  public verifyEmail = async (token: string) => {
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.unauthorized("Invalid token");

    const { email } = payload as { email: string };
    if (!email) throw CustomError.internalServerError("Email not in token");

    const user = await UserModel.findOne({ email });
    if (!user) throw CustomError.internalServerError("User not found");

    user.emailVerified = true;
    await user.save();

    return true;
  };
}
