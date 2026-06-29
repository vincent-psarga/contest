import { AuthService } from "./AuthService";
import type { IAuthService } from "../../domain/services/IAuthService";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { mockUserRepository } from "../../../test/mocks/repositories/mockUserRepository";
import type { Mocked } from "jest-mock";
import { userFactory } from "../../../test/factories/userFactory";

describe<{
  userRepository: Mocked<IUserRepository>;
}>("AuthService", (context) => {
  context.set("userRepository", mockUserRepository);
  let authService: IAuthService;

  beforeEach(() => {
    authService = new AuthService(context.get("userRepository"));
  });

  describe("#login", () => {
    describe("when userRepository.findByEmailAndPassword throws an error", () => {
      const err = new Error("Some error occurred");

      beforeEach(() => {
        context
          .get("userRepository")
          .findByEmailAndPassword.mockRejectedValue(err);
      });

      it("forwards the error", async () => {
        await expect(authService.login("", "")).rejects.toEqual(err);
      });
    });

    describe("when userRepository.findByEmailAndPassword succeeds", () => {
      const user = userFactory();

      beforeEach(() => {
        context
          .get("userRepository")
          .findByEmailAndPassword.mockResolvedValue(user);
      });

      it("returns the matching user", async () => {
        expect(await authService.login("", "")).toEqual(user);
      });
    });
  });

  describe("#signup", () => {
    describe("when userRepository.create throws an error", () => {
      const err = new Error("Some error occurred");
      beforeEach(() => {
        context.get("userRepository").create.mockRejectedValue(err);
      });

      it("forwards the error", async () => {
        await expect(authService.signup("", "")).rejects.toEqual(err);
      });
    });
  });
});
