import Fastify from "fastify";

import Repository from "./repository/Repository";

const server = Fastify({
  logger: true,
});

server.decorate("repo", new Repository());

server.listen(
  {
    port: Number(process.env.PORT),
    host: process.env.HOST,
  },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    server.log.info("Let's Go!");
  }
);
