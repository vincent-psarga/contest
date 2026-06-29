import type {
  ILoginUseCase,
  LoginCommand,
  LoginResponse,
} from "../../domain/useCases/ILoginUseCase";
import type { IAuthService } from "../../domain/services/IAuthService";

export class LoginUseCase implements ILoginUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute({ email, password }: LoginCommand): Promise<LoginResponse> {
    const user = await this.authService.login(email, password);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }
}
