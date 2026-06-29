import type { IAuthService } from "../../domain/services/IAuthService";
import { mockAuthService } from "../../../test/mocks/services/mockAuthService";
import type { Mocked } from "jest-mock";
import type { User } from "../../domain/models/User";
import { userFactory } from "../../../test/factories/userFactory";
import { SignupUseCase } from "./SignupUseCase";

describe<{
  authService: Mocked<IAuthService>;
  user: User;
}>("SignupUseCase", (context) => {
  context.set("authService", mockAuthService);

  const signupCommand = { email: "", password: "123" };
  let signupUseCase: SignupUseCase;

  beforeEach(() => {
    signupUseCase = new SignupUseCase(context.get("authService"));
  });

  describe("when AuthService.signup fails", () => {
    const err = new Error("Unable to sign-up");

    beforeEach(() => {
      context.get("authService").signup.mockRejectedValue(err);
    });

    it("forwards the error", async () => {
      await expect(signupUseCase.execute(signupCommand)).rejects.toThrow(err);
    });
  });

  describe("when AuthService.signup succeeds", () => {
    context.set("user", userFactory);

    beforeEach(() => {
      context.get("authService").signup.mockResolvedValue(context.get("user"));
    });

    it("returns the created user without the password", async () => {
      const createdUser = await signupUseCase.execute(signupCommand);

      expect(createdUser).toEqual({
        user: {
          id: context.get("user").id,
          email: context.get("user").email,
          displayName: context.get("user").displayName,
        },
      });
    });
  });
});
