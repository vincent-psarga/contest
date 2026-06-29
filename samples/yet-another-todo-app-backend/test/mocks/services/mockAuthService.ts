import type { IAuthService } from "../../../src/domain/services/IAuthService";
import { makeMock } from "../MockService";

export const mockAuthService = makeMock<IAuthService>({
  login: fn(),
  signup: fn(),
});
