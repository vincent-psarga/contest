import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthNestService } from "./auth.service";
import {
  AUTH_SERVICE,
  LOGIN_USE_CASE,
  SIGNUP_USE_CASE,
  USER_REPOSITORY,
} from "./tokens";
import { MemoryUserRepository } from "../../repositories/MemoryUserRepository";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AuthService } from "../../../application/services/AuthService";
import type { IAuthService } from "../../../domain/services/IAuthService";
import { LoginUseCase } from "../../../application/useCases/LoginUseCase";
import { SignupUseCase } from "../../../application/useCases/SignupUseCase";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: "15m",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthNestService,
    {
      provide: USER_REPOSITORY,
      useFactory: () => new MemoryUserRepository(),
    },
    {
      provide: AUTH_SERVICE,
      useFactory: (userRepository: IUserRepository) =>
        new AuthService(userRepository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: LOGIN_USE_CASE,
      useFactory: (authService: IAuthService) => new LoginUseCase(authService),
      inject: [AUTH_SERVICE],
    },
    {
      provide: SIGNUP_USE_CASE,
      useFactory: (authService: IAuthService) => new SignupUseCase(authService),
      inject: [AUTH_SERVICE],
    },
  ],
})
export class AuthModule {}
