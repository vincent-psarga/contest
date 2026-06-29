import type { IServices } from "../../src/domain/services/IServices";
import { repositories } from "./repositories";
import { AuthService } from "../../src/application/services/AuthService";

export const services = repositories.extends<IServices>(
  "services",
  (context) => {
    context.set(
      "authService",
      () => new AuthService(context.get("userRepository")),
    );
  },
);
