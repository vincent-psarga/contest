import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./infra/http/AppModule";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(
    `yet-another-todo-app-backend listening on http://localhost:${port}`,
  );
}

void bootstrap();
