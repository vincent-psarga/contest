# Contest

Trying to bring back Rspec greatness in Typescript.

## context.set (`let` in Rspec)

The main difference between Contest and Jest/Mocha/Vite is that the callback of the tests take a `context` parameter which enables setting test data outside of the test loop. Let's take this simple example with a classic test framework:

```ts
describe("/api/some-admin-endpoint", () => {
  describe("when there is no authenticated user", () => {
    it("returns a 401 status", () => {
      expect(request("//api/some-admin-endpoint").status).toEqual(401);
    });
  });

  describe("when user is authenticated", () => {
    let user: User;
    let jwtToken: string;

    describe("when user does not have admin rights", () => {
      beforeEach(async () => {
        user = await userFactory();
        jwtToken = await authenticate(user);
      });

      it("returns a 403 status", () => {
        expect(
          request("//api/some-admin-endpoint", { headers: { jwtToken } })
            .status,
        ).toEqual(403);
      });
    });

    describe("when user has admin rights", () => {
      beforeEach(async () => {
        user = await userFactory({ admin: true });
        jwtToken = await authenticate(user);
      });

      it("returns a 200 status", () => {
        expect(
          request("//api/some-admin-endpoint", { headers: { jwtToken } })
            .status,
        ).toEqual(200);
      });
    });
  });
});
```

With contest, this can be rewritten this way:

```ts
describe<{
  jwtToken: string | null;
  user: User;
  isAdmin: boolean;
}>("/api/some-admin-endpoint", (context) => {
  context.set("jwtToken", async () => await authenticate(context.get("user")));
  context.set(
    "user",
    async () => await userFactory({ admin: context.get("isAdmin") }),
  );

  let status: number;

  beforeEach(() => {
    status = request("//api/some-admin-endpoint", {
      headers: { jwtToken: context.get("jwtToken") },
    }).status;
  });

  describe("when there is no authenticated user", () => {
    context.set("jwtToken", null);

    it("returns a 401 status", () => {
      expect(status).toEqual(401);
    });
  });

  describe("when user is authenticated", () => {
    describe("when user does not have admin rights", () => {
      context.set("isAdmin", false);

      it("returns a 403 status", () => {
        expect(status).toEqual(403);
      });
    });

    describe("when user has admin rights", () => {
      context.set("isAdmin", true);

      it("returns a 200 status", () => {
        expect(status).toEqual(200);
      });
    });
  });
});
```

You can even simplify it further using the `.when` structure:

```ts
describe<{
  jwtToken: string | null;
  user: User;
  isAdmin: boolean;
}>("/api/some-admin-endpoint", (context) => {
  context.set("jwtToken", async () => await authenticate(context.get("user")));
  context.set(
    "user",
    async () => await userFactory({ admin: context.get("isAdmin") }),
  );

  let status: number;

  beforeEach(() => {
    status = request("//api/some-admin-endpoint", {
      headers: {
        jwtToken: context.get("jwtToken"),
      },
    }).status;
  });

  describe.when("there is no authenticated user", { jwtToken: null }, () => {
    it("returns a 401 status", () => {
      expect(status).toEqual(401);
    });
  });

  describe("when user is authenticated", () => {
    describe.when("user does not have admin rights", { isAdmin: false }, () => {
      it("returns a 403 status", () => {
        expect(status).toEqual(403);
      });
    });

    describe.when("user has admin rights", { isAdmin: true }, () => {
      it("returns a 200 status", () => {
        expect(status).toEqual(200);
      });
    });
  });
});
```

## Shared context

To ease sharing data between tests and avoid copy/pasting the same test data over and over, you can use `SharedContext` and `.with` structure. For example:

```ts
// File: test/contexts/userContext
const userContext = sharedContext<{
  username: string;
  password: string;
  status: UserStatus;
}>("with user", (context) => {
  context.set("username", "someone@example.com");
  context.set("password", "superS3cr3t");
  context.set("status", UserStatus.activated);
});

// File: login.controller.spec.ts
describe.with(userContext, "/api/login", (context) => {
  it("returns 200 with the correct username and password", () => {
    expect(
      request("/api/login", {
        method: POST,
        body: {
          username: context.get("username"),
          password: context.get("password"),
        },
      }),
    ).toHaveHttpStatus(200);
  });
});
```

To further ease sharing test context, you can extend a shared context from an existing one. For example:

```ts
const userContext = sharedContext<{ user: User }>("user context", (context) => {
  context.set("user", () => userFactory());
});

const projectContext = userContext.extends<{ project: Project }>(
  "project context",
  (context) => {
    context.set("project", () =>
      projectFactory({
        user: context.get("user"),
      }),
    );
  },
);
```

## Shared examples
