import type { ILoginUseCase } from "../../domain/useCases/ILoginUseCase";
import type { ISignupUseCase } from "../../domain/useCases/ISignupUseCase";

export type IUseCases = {
  loginUseCase: ILoginUseCase;
  signupUseCase: ISignupUseCase;
};
