import { services } from "./services";
import type { IUseCases } from "../../src/application/useCases/IUseCases";
import { LoginUseCase } from "../../src/application/useCases/LoginUseCase";
import { SignupUseCase } from "../../src/application/useCases/SignupUseCase";

export const useCases = services.extends<IUseCases>("useCases", (context) => {
  context.set(
    "loginUseCase",
    () => new LoginUseCase(context.get("authService")),
  );
  context.set(
    "signupUseCase",
    () => new SignupUseCase(context.get("authService")),
  );
});
