import { useCases } from "./useCases";
import { Test, TestingModule } from "@nestjs/testing";
import type { IUseCases } from "../../src/application/useCases/IUseCases";
import type { DynamicModule, Provider, Type } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

export const moduleFixture = useCases.extends<{
  moduleFixture: Promise<TestingModule>;
  controllers: Type<unknown>[];
  imports: (Type<unknown> | DynamicModule)[];
  providers: Type<unknown>[];
  enabledUseCases: Map<symbol, keyof IUseCases>;
  jwtSecretToken: string;
}>("app", (context) => {
  context.set("enabledUseCases", new Map());
  context.set("controllers", []);
  context.set("imports", () => [
    JwtModule.register({
      secret: context.get("jwtSecretToken"),
      signOptions: {
        expiresIn: "1m",
      },
    }),
  ]);
  context.set("providers", []);
  context.set("jwtSecretToken", "123456");

  context.set("moduleFixture", async () => {
    const providers: Provider[] = [
      ...context.get("providers"),
      ...Array.from(context.get("enabledUseCases").entries()).map(
        ([key, value]) => {
          return {
            provide: key,
            useFactory: () => context.get(value),
          };
        },
      ),
    ];

    const moduleBuilder = Test.createTestingModule({
      imports: context.get("imports"),
      controllers: context.get("controllers"),
      providers,
    });

    return moduleBuilder.compile();
  });
});
