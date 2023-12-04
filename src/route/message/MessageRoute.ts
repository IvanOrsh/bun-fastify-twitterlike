import { FastifyPluginAsync } from "fastify";
import { TypeBoxTypeProvider, Type } from "@fastify/type-provider-typebox";
import { ErrorCodeType, Status500 } from "../ResponseTypes";

const messageRoute: FastifyPluginAsync = async (fastify) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();

  instance.post(
    "/message",
    {
      schema: {
        body: Type.Object({
          authorId: Type.Integer(),
          body: Type.String(),
          image: Type.Optional(Type.Any()),
          respondedMsgId: Type.Optional(Type.Integer()),
          broadcastMsgId: Type.Optional(Type.Integer()),
          additionalMessage: Type.Optional(Type.String()),
        }),

        response: {
          200: Type.Object({
            id: Type.Integer(),
          }),

          500: ErrorCodeType,
        },
      },
    },
    async (req, rep) => {
      try {
        const {
          authorId,
          body,
          image,
          respondedMsgId,
          broadcastMsgId,
          additionalMessage,
        } = req.body;

        const result = await instance.repo.messageRepo.insertMessage(
          BigInt(authorId),
          body,
          image,
          respondedMsgId ? BigInt(respondedMsgId) : undefined,
          broadcastMsgId ? BigInt(broadcastMsgId) : undefined,
          additionalMessage
        );

        return rep.status(200).send({
          id: Number(result.id),
        });
      } catch (e) {
        instance.log.error(`Insert new message error: ${e}`);
        return rep.status(500).send(Status500);
      }
    }
  );
};

export default messageRoute;
