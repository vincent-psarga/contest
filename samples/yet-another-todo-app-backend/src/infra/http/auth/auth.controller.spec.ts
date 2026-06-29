import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import type { InferSharedContextType } from "contest";
import jwt from "jsonwebtoken";

import type { User } from "../../../domain/models/User";
import { LOGIN_USE_CASE, SIGNUP_USE_CASE } from "./tokens";

import { userFactory } from "../../../../test/factories/userFactory";
import { moduleFixture } from "../../../../test/sharedContexts/moduleFixture";
import { AuthController } from "./auth.controller";
import { AuthNestService } from "./auth.service";

describe.with<
  InferSharedContextType<typeof moduleFixture> & {
    user: User;
  }
>("AuthController", moduleFixture, (context) => {
  context.set("user", userFactory);
  context.set("providers", [AuthNestService]);
  context.set("controllers", [AuthController]);
  context.set(
    "enabledUseCases",
    new Map([
      [SIGNUP_USE_CASE, "signupUseCase"],
      [LOGIN_USE_CASE, "loginUseCase"],
    ]),
  );

  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await context.get("moduleFixture");
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe("POST /auth/signup", () => {
    describe("when user does not exist", () => {
      let response: request.Response;

      beforeEach(async () => {
        response = await request(app.getHttpServer())
          .post("/auth/signup")
          .send({
            email: context.get("user").email,
            password: context.get("user").password,
          });
      });

      it("returns the created user", () => {
        expect(response.body).toEqual({
          user: {
            id: expect.any(String),
            email: context.get("user").email,
            displayName: "",
          },
        });
      });

      it("returns status 201", () => {
        expect(response.status).toEqual(201);
      });

      it("sets a cookie with a JWT token identifying the user", () => {
        const cookies = response.headers["set-cookie"];
        const token = cookies[0].match(/^access_token=([^;]+)/)?.[1];

        const payload = jwt.verify(token!, context.get("jwtSecretToken"));
        expect(payload).toMatchObject({
          sub: expect.any(String),
          email: context.get("user").email,
        });
      });
    });

    describe("when user already exists", () => {
      beforeEach(async () => {
        context.get("userRepository").create(context.get("user"));
      });

      it("returns a 409 status", async () => {
        await request(app.getHttpServer())
          .post("/auth/signup")
          .send({
            email: context.get("user").email,
            password: context.get("user").password,
          })
          .expect(409);
      });
    });
  });
});
