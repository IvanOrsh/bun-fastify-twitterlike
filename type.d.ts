import { FastifyInstance as RealFastifyInstance } from "fastify";

import Repository from "./src/repository/Repository";

declare module "fastify" {
  export interface FastifyInstance extends RealFastifyInstance {
    repo: Repository;
  }
}
