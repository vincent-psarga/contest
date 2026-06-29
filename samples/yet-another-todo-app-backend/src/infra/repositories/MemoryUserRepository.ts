import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import type { User } from "../../domain/models/User";
import { EmailAlreadyInUseError } from "../../domain/errors/EmailAlreadyInUseError";
import { InvalidCredentialsError } from "../../domain/errors/InvalidCredentialsError";
import { createHash } from "crypto";

export class MemoryUserRepository implements IUserRepository {
  private readonly users: User[] = [];

  async create(user: Omit<User, "id">): Promise<User> {
    const existing = this.findUserByEmail(user.email);
    if (existing) {
      throw new EmailAlreadyInUseError(user.email);
    }

    const createdUser = {
      ...user,
      id: `${this.users.length}`,
      password: this.hashPassword(user.password),
    };
    this.users.push(createdUser);
    return createdUser;
  }

  async findByEmailAndPassword(email: string, password: string): Promise<User> {
    const user = this.findUserByEmail(email);

    if (!user || user.password !== this.hashPassword(password)) {
      throw new InvalidCredentialsError(email);
    }

    return user;
  }

  private findUserByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }

  private hashPassword(input: string): string {
    return createHash("sha256").update(input).digest("hex");
  }
}
