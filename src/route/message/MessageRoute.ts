import { FastifyPluginAsync } from "fastify";
import { TypeBoxTypeProvider, Type } from "@fastify/type-provider-typebox";

import { ErrorCodeType, Status500, Status404 } from "../ResponseTypes";

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

  instance.get(
    "/followedmsgs/:followerId",
    {
      schema: {
        params: Type.Object({
          followerId: Type.Integer(),
        }),

        response: {
          200: Type.Array(
            Type.Object({
              id: Type.Integer(),
              authorId: Type.Integer(),
              updatedAt: Type.String(),
              body: Type.String(),
              likes: Type.Integer(),
              image: Type.Optional(Type.Any()),
            })
          ),

          404: ErrorCodeType,
        },
      },
    },
    async (req, rep) => {
      try {
        const result =
          await instance.repo.messageRepo.selectMessagesFromFollowed(
            BigInt(req.params.followerId)
          );

        if (result.length === 0) {
          return rep.status(404).send({
            ...Status404,
            message: "Followed messages not found",
          });
        }

        return rep.status(200).send(
          result.map((message) => ({
            id: Number(message.id),
            updatedAt: message.updatedAt.toISOString(),
            authorId: Number(message.authorId),
            body: message.body,
            likes: message.likes,
            image: message.image,
          }))
        );
      } catch (e) {
        instance.log.error(`Get followed messages error: ${e}`);
        return rep.status(500).send(Status500);
      }
    }
  );

  instance.get(
    "/broadcastermsgs/:broadcastId",
    {
      schema: {
        params: Type.Object({
          broadcastId: Type.Integer(),
        }),

        response: {
          200: Type.Array(
            Type.Object({
              id: Type.Integer(),
              authorId: Type.Integer(),
              updatedAt: Type.String(),
              body: Type.String(),
              likes: Type.Integer(),
              image: Type.Optional(Type.Any()),
            })
          ),

          404: ErrorCodeType,
        },
      },
    },
    async (req, rep) => {
      try {
        const result = await instance.repo.messageRepo.selectMessageBroadcasts(
          BigInt(req.params.broadcastId)
        );

        if (result.length === 0) {
          return rep.status(404).send({
            ...Status404,
            message: "Broadcast messages not found",
          });
        }

        return rep.status(200).send(
          result.map((message) => ({
            id: Number(message.broadcasterMsg.id),
            updatedAt: message.broadcasterMsg.updatedAt.toISOString(),
            authorId: Number(message.broadcasterMsg.authorId),
            body: message.broadcasterMsg.body,
            likes: message.broadcasterMsg.likes,
            image: message.broadcasterMsg.image,
          }))
        );
      } catch (e) {
        instance.log.error(`Get broadcast messages error: ${e}`);
        return rep.status(500).send(Status500);
      }
    }
  );

  instance.get(
    "/authormsgs/:authorId",
    {
      schema: {
        params: Type.Object({
          authorId: Type.Integer(),
        }),

        response: {
          200: Type.Array(
            Type.Object({
              id: Type.Integer(),
              updatedAt: Type.String(),
              authorId: Type.Integer(),
              body: Type.String(),
              likes: Type.Integer(),
              image: Type.Optional(Type.Any()),
            })
          ),

          404: ErrorCodeType,
        },
      },
    },
    async (req, rep) => {
      try {
        const result =
          await instance.repo.messageRepo.selectedMessagesByAuthorId(
            BigInt(req.params.authorId)
          );

        if (result.length === 0) {
          return rep.status(404).send({
            ...Status404,
            message: "Author messages not found",
          });
        }

        return rep.status(200).send(
          result.map((message) => ({
            id: Number(message.id),
            updatedAt: message.updatedAt.toISOString(),
            authorId: Number(message.authorId),
            body: message.body,
            likes: message.likes,
            image: message.image,
          }))
        );
      } catch (e) {
        instance.log.error(`Get author messages error: ${e}`);
        return rep.status(500).send(Status500);
      }
    }
  );

  instance.get(
    "/responsemsgs/:respondedMsgId",
    {
      schema: {
        params: Type.Object({
          respondedMsgId: Type.Integer(),
        }),

        response: {
          200: Type.Array(
            Type.Object({
              id: Type.Integer(),
              authorId: Type.Integer(),
              updatedAt: Type.String(),
              body: Type.String(),
              likes: Type.Integer(),
              image: Type.Optional(Type.Any()),
            })
          ),

          404: ErrorCodeType,
        },
      },
    },
    async (req, rep) => {
      try {
        const { respondedMsgId } = req.params;
        const result = await instance.repo.messageRepo.selectMessageResponses(
          BigInt(respondedMsgId)
        );

        if (result.length === 0) {
          return rep.status(404).send({
            ...Status404,
            message: "Response messages not found",
          });
        }

        return rep.status(200).send(
          result.map((message) => ({
            id: Number(message.responderMsg.id),
            updatedAt: message.responderMsg.updatedAt.toISOString(),
            authorId: Number(message.responderMsg.authorId),
            body: message.responderMsg.body,
            likes: message.responderMsg.likes,
            image: message.responderMsg.image,
          }))
        );
      } catch (e) {
        instance.log.error(`Get response messages error: ${e}`);
        return rep.status(500).send(Status500);
      }
    }
  );
};

export default messageRoute;
