import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import type { User } from "../../domain/models/User";
import { EmailAlreadyInUseError } from "../../domain/errors/EmailAlreadyInUseError";
import { InvalidCredentialsError } from "../../domain/errors/InvalidCredentialsError";

export const IUserRepositorySharedExamples = sharedExamples<{
  makeRepository: () => IUserRepository;
}>("a user repository", (context) => {
  let repository: IUserRepository;
  beforeEach(() => {
    repository = context.get("makeRepository")();
  });

  describe("#create", () => {
    let user: User;

    beforeEach(async () => {
      user = await repository.create({
        email: "bob@example.com",
        password: "some-secret-password",
        displayName: "Bob",
      });
    });

    it("creates a new user", async () => {
      expect(user).toMatchObject({
        email: "bob@example.com",
        displayName: "Bob",
      });
    });

    it("creates an ID for the user", () => {
      expect(user.id).toBeDefined();
    });

    it("hashes the stored password", () => {
      expect(user.password).not.toEqual("some-secret-password");
    });

    describe("a user with the email already exists", () => {
      it("throw a EmailAlreadyInUseError error", async () => {
        await expect(
          repository.create({
            email: "bob@example.com",
            password: "some-secret-password",
            displayName: "Bob",
          }),
        ).rejects.toEqual(new EmailAlreadyInUseError("bob@example.com"));
      });
    });
  });

  describe("findByEmailAndPassword", () => {
    let storedUser: User;

    beforeEach(async () => {
      storedUser = await repository.create({
        email: "bob@example.com",
        password: "some-secret-password",
        displayName: "Bob",
      });
    });

    it("returns the user if the email and password matches", async () => {
      const user = await repository.findByEmailAndPassword(
        storedUser.email,
        "some-secret-password",
      );

      expect(user).toEqual(storedUser);
    });

    it("throws an InvalidCredentialsError error if the user does not exist", async () => {
      await expect(
        repository.findByEmailAndPassword("someone@example.com", "whatever"),
      ).rejects.toEqual(new InvalidCredentialsError("someone@example.com"));
    });

    it("throws an InvalidCredentialsError error if the password does not match", async () => {
      await expect(
        repository.findByEmailAndPassword(storedUser.email, "whatever"),
      ).rejects.toEqual(new InvalidCredentialsError(storedUser.email));
    });
  });
});
