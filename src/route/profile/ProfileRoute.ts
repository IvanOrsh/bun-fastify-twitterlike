import { TypeBoxTypeProvider, Type } from "@fastify/type-provider-typebox";
import { FastifyPluginAsync } from "fastify";

import { ErrorCodeType, Status500, Status404 } from "../ResponseTypes";

const profileRoute: FastifyPluginAsync = async (fastify) => {
  const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();

  instance.get(
    "/profile/:userName",
    {
      schema: {
        params: Type.Object({
          userName: Type.String(),
        }),
        response: {
          200: Type.Object({
            id: Type.Integer(),
            updatedAt: Type.String(),
            userName: Type.String(),
            fullName: Type.String(),
            description: Type.Optional(Type.String()),
            region: Type.Optional(Type.String()),
            mainUrl: Type.Optional(Type.String()),
            avatar: Type.Optional(Type.String({ contentEncoding: "base64" })), // special case
          }),

          404: ErrorCodeType,
        },
      },
    },
    async (req, rep) => {
      try {
        const result = await instance.repo.profileRepo.selectProfile(
          req.params.userName
        );

        if (!result) {
          return rep.status(404).send({
            ...Status404,
            message: "Profile not found",
          });
        }

        return rep.status(200).send({
          id: Number(result.id),
          updatedAt: result.updatedAt.toISOString(),
          userName: result.userName,
          fullName: result.fullName,
          description: result.description || undefined,
          region: result.region || undefined,
          mainUrl: result.mainUrl || undefined,
          avatar: result?.avatar?.toString("base64") || undefined,
        });
      } catch (e) {
        instance.log.error(`Get Profile Route error: ${e}`);
        return rep.status(500).send(Status500);
      }
    }
  );
};

export default profileRoute;
