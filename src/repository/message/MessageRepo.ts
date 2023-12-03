import { PrismaClient } from "@prisma/client";

import { SortOrder } from "../Repository";

export default class MessageRepo {
  constructor(private readonly client: PrismaClient) {}

  async selectMessagesFromFollowed(followerId: bigint) {
    return (
      await this.client.follow.findMany({
        select: {
          followed: {
            select: {
              messages: true,
            },
          },
        },

        where: {
          followerId,
        },
      })
    )
      .flatMap((item) => item.followed.messages)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async selectedMessagesByAuthorId(authorId: bigint) {
    return await this.client.message.findMany({
      where: {
        authorId,
      },

      orderBy: {
        updatedAt: SortOrder.Desc,
      },
    });
  }

  async selectMessageResponses(respondedMsgId: bigint) {
    return (
      await this.client.messageResponse.findMany({
        select: {
          responderMsg: true,
          respondedMsg: true,
        },

        where: {
          respondedMsgId,
        },
      })
    ).sort(
      (
        { responderMsg: responder_a, respondedMsg: responded_a },
        { responderMsg: responder_b, respondedMsg: responded_b }
      ) => {
        return (
          responder_b.updatedAt.getTime() - responder_a.updatedAt.getTime()
        );
      }
    );
  }

  async selectMessageBroadcasts(broadcastMsgId: bigint) {
    return (
      await this.client.messageBroadcast.findMany({
        select: {
          broadcasterMsg: true,
          broadcastMsg: true,
          additionalMessage: true,
        },

        where: {
          broadcastMsgId,
        },
      })
    ).sort(
      (
        { broadcasterMsg: broadcaster_a, broadcastMsg: broadcast_a },
        { broadcasterMsg: broadcaster_b, broadcastMsg: broadcast_b }
      ) => {
        return (
          broadcaster_b.updatedAt.getTime() - broadcaster_a.updatedAt.getTime()
        );
      }
    );
  }

  async insertMessage(
    authorId: bigint,
    body: string,
    image?: Buffer,
    respondedMsgId?: bigint,
    broadcastMsgId?: bigint,
    additionalMessage?: string
  ) {
    // invalid scenarios:
    if (respondedMsgId && broadcastMsgId) {
      throw new Error(
        "respondedMsgId and broadcastMsgId are mutually exclusive"
      );
    }

    if (!broadcastMsgId && additionalMessage) {
      throw new Error("additionalMessage cannot exist without broadcastMsgId");
    }

    return await this.client.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          authorId,
          body,
          image,
        },
      });

      if (respondedMsgId) {
        await tx.messageResponse.create({
          data: {
            responderMsgId: newMessage.id,
            respondedMsgId,
          },
        });
      } else if (broadcastMsgId) {
        await tx.messageBroadcast.create({
          data: {
            broadcasterMsgId: newMessage.id,
            broadcastMsgId, // broadcasted
            additionalMessage,
          },
        });
      }

      return newMessage;
    });
  }
}
