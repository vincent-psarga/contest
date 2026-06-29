import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { User } from "../../../domain/models/User";

@Injectable()
export class AuthNestService {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  async createAccessToken(user: Pick<User, "id" | "email">): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
  }
}
