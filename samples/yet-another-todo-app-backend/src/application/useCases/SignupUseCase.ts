import type {
  ISignupUseCase,
  SignUpCommand,
  SignupResponse,
} from "../../domain/useCases/ISignupUseCase";
import type { IAuthService } from "../../domain/services/IAuthService";

export class SignupUseCase implements ISignupUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(command: SignUpCommand): Promise<SignupResponse> {
    const { password, ...userWithoutPassword } = await this.authService.signup(
      command.email,
      command.password,
    );

    return { user: userWithoutPassword };
  }
}
