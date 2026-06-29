import type { ILoginUseCase } from "../../domain/useCases/ILoginUseCase";
import type { IAuthService } from "../../domain/services/IAuthService";
import { mockAuthService } from "../../../test/mocks/services/mockAuthService";
import { userFactory } from "../../../test/factories/userFactory";
import type { User } from "../../domain/models/User";
import type { Mocked } from "jest-mock";
import { LoginUseCase } from "./LoginUseCase";

describe<{
  user: User;
  authService: Mocked<IAuthService>;
}>("LoginUseCase", (context) => {
  let useCase: ILoginUseCase;

  context.set("user", userFactory());
  context.set("authService", mockAuthService());

  beforeEach(() => {
    useCase = new LoginUseCase(context.get("authService"));
  });

  describe("authService.login fails", () => {
    const err = new Error("Unable to login");

    beforeEach(() => {
      context.get("authService").login.mockRejectedValue(err);
    });

    it("forwards the error", async () => {
      await expect(
        useCase.execute({ email: "", password: "" }),
      ).rejects.toThrow(err);
    });
  });

  describe("authService.login succeeds", () => {
    beforeEach(() => {
      context.get("authService").login.mockResolvedValue(context.get("user"));
    });

    it("returns the user except its password", async () => {
      const { password, ...userWithoutPassword } = context.get("user");

      expect(
        await useCase.execute({ email: "bob@example.com", password: "1234" }),
      ).toEqual({
        user: userWithoutPassword,
      });
    });
  });
});
