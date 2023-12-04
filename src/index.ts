import Fastify from "fastify";

import Repository from "./repository/Repository";
import profileRoute from "./route/profile/ProfileRoute";
import messageRoute from "./route/message/MessageRoute";

const server = Fastify({
  logger: true,
});

server.decorate("repo", new Repository());

server.register(profileRoute);
server.register(messageRoute);

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
