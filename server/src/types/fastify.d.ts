import "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
    };
    user: {
      sub: string;
      email: string;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: import("fastify").PreHandlerHookHandler;
  }
}
