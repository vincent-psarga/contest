import type { IAuthService } from "../../domain/services/IAuthService";
import type { User } from "../../domain/models/User";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";

export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  login(email: string, password: string): Promise<User> {
    return this.userRepository.findByEmailAndPassword(email, password);
  }

  signup(email: string, password: string): Promise<User> {
    return this.userRepository.create({
      displayName: "",
      email,
      password,
    });
  }
}
