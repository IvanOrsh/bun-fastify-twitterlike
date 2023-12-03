import { PrismaClient } from "@prisma/client";

export default class ProfileRepo {
  constructor(private readonly client: PrismaClient) {}

  async selectProfile(userName: string) {
    return await this.client.profile.findUnique({
      where: {
        userName,
      },
    });
  }

  async selectFollowedProfile(followerId: bigint) {
    return (
      await this.client.follow.findMany({
        select: {
          followed: true,
        },
        where: {
          followerId,
        },
      })
    )

      .flatMap((item) => item.followed)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async selectFollowerProfile(followedId: bigint) {
    return (
      await this.client.follow.findMany({
        select: {
          follower: true,
        },
        where: {
          followedId,
        },
      })
    )
      .flatMap((item) => item.follower)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async insertProfile(
    userName: string,
    fullName: string,
    description?: string,
    region?: string,
    mainUrl?: string,
    avatar?: Buffer
  ) {
    return await this.client.profile.create({
      data: {
        userName,
        fullName,
        description,
        region,
        mainUrl,
        avatar,
      },
    });
  }

  async insertFollow(followerId: bigint, followedId: bigint) {
    return await this.client.follow.create({
      data: {
        followerId,
        followedId,
      },
    });
  }
}
