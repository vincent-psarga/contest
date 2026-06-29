import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { LOGIN_USE_CASE, SIGNUP_USE_CASE } from "./tokens";
import type {
  ILoginUseCase,
  LoginCommand,
  LoginResponse,
} from "../../../domain/useCases/ILoginUseCase";
import type {
  ISignupUseCase,
  SignUpCommand,
  SignupResponse,
} from "../../../domain/useCases/ISignupUseCase";
import { EmailAlreadyInUseError } from "../../../domain/errors/EmailAlreadyInUseError";
import { AuthNestService } from "./auth.service";
import type { User } from "../../../domain/models/User";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthNestService) private readonly authService: AuthNestService,
    @Inject(LOGIN_USE_CASE) private readonly loginUseCase: ILoginUseCase,
    @Inject(SIGNUP_USE_CASE) private readonly signupUseCase: ISignupUseCase,
  ) {}

  @Post("login")
  login(@Body() body: LoginCommand): Promise<LoginResponse> {
    return this.loginUseCase.execute(body);
  }

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() body: SignUpCommand,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignupResponse> {
    try {
      const signupResponse = await this.signupUseCase.execute(body);

      await this.setJwtTokenCookie(res, signupResponse.user);
      return signupResponse;
    } catch (err) {
      if (err instanceof EmailAlreadyInUseError) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      throw err;
    }
  }

  private async setJwtTokenCookie(
    res: Response,
    user: Pick<User, "id" | "email">,
  ) {
    const token = await this.authService.createAccessToken(user);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });
  }
}
