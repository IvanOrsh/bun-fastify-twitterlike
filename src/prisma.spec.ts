import { expect, describe, it } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { faker, tr } from "@faker-js/faker";

import { getNewProfile } from "./__tests__/fixtures";

const prisma = new PrismaClient();

describe("testing prisma access", () => {
  it("create new profile", async () => {
    const { userName, fullName, description, region, mainUrl, avatar } =
      getNewProfile();

    const profile = await prisma.profile.create({
      data: {
        userName,
        fullName,
        description,
        region,
        mainUrl,
        avatar,
      },
    });

    expect(profile.userName).toBe(userName);
    expect(profile.fullName).toBe(fullName);
    expect(profile.description).toBe(description);
  });

  it("create new profile and message", async () => {
    const { userName, fullName, description, region, mainUrl, avatar } =
      getNewProfile();

    const messages = [
      {
        body: faker.lorem.sentences(1),
      },
      {
        body: faker.lorem.sentences(1),
      },
      {
        body: faker.lorem.sentences(1),
      },
    ];

    const profile = await prisma.profile.create({
      data: {
        userName,
        fullName,
        description,
        region,
        mainUrl,
        avatar,

        messages: {
          create: messages,
        },
      },

      include: {
        messages: true,
      },
    });

    expect(profile.userName).toBe(userName);
    expect(profile.fullName).toBe(fullName);
    expect(profile.description).toBe(description);

    expect(profile.messages).toHaveLength(3);

    for (let i = 0; i < profile.messages.length; i++) {
      expect(profile.messages[i].body).toBe(messages[i].body);
    }
  });

  it("update relationship of message", async () => {
    const {
      userName: userNameA,
      fullName: fullNameA,
      description: descriptionA,
      region: regionA,
      mainUrl: mainUrlA,
      avatar: avatarA,
    } = getNewProfile();
    const profileA = await prisma.profile.create({
      data: {
        userName: userNameA,
        fullName: fullNameA,
        description: descriptionA,
        region: regionA,
        mainUrl: mainUrlA,
        avatar: avatarA,
      },
    });

    const {
      userName: userNameB,
      fullName: fullNameB,
      description: descriptionB,
      region: regionB,
      mainUrl: mainUrlB,
      avatar: avatarB,
    } = getNewProfile();
    const profileB = await prisma.profile.create({
      data: {
        userName: userNameB,
        fullName: fullNameB,
        description: descriptionB,
        region: regionB,
        mainUrl: mainUrlB,
        avatar: avatarB,
      },
    });

    let message = await prisma.message.create({
      data: {
        body: "123",
        authorId: profileA.id,
      },
    });

    expect(message.authorId).toBe(profileA.id);

    message = await prisma.message.update({
      where: { id: message.id },
      data: {
        authorId: profileB.id,
      },
    });

    expect(message.authorId).toBe(profileB.id);
  });

  it("update relation of message (modifying association)", async () => {
    const {
      userName: userNameA,
      fullName: fullNameA,
      description: descriptionA,
      region: regionA,
      mainUrl: mainUrlA,
      avatar: avatarA,
    } = getNewProfile();
    const profileA = await prisma.profile.create({
      data: {
        userName: userNameA,
        fullName: fullNameA,
        description: descriptionA,
        region: regionA,
        mainUrl: mainUrlA,
        avatar: avatarA,
      },
    });

    const {
      userName: userNameB,
      fullName: fullNameB,
      description: descriptionB,
      region: regionB,
      mainUrl: mainUrlB,
      avatar: avatarB,
    } = getNewProfile();
    let profileB = await prisma.profile.create({
      data: {
        userName: userNameB,
        fullName: fullNameB,
        description: descriptionB,
        region: regionB,
        mainUrl: mainUrlB,
        avatar: avatarB,
      },
      include: {
        messages: true,
      },
    });

    let message = await prisma.message.create({
      data: {
        body: "abc",
        authorId: profileA.id,
      },
    });

    profileB = await prisma.profile.update({
      where: { id: profileB.id },
      data: {
        messages: {
          connect: {
            id: message.id,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    expect(profileB.messages[0].authorId).toBe(profileB.id);

    const updatedProfileA = await prisma.profile.findFirst({
      where: {
        id: profileA.id,
      },
      include: {
        messages: true,
      },
    });

    expect(updatedProfileA?.messages.length).toBe(0);
  });

  it("retrieve only userName and fullName of profile", async () => {
    const {
      userName: userNameA,
      fullName: fullNameA,
      description: descriptionA,
      region: regionA,
      mainUrl: mainUrlA,
      avatar: avatarA,
    } = getNewProfile();
    const profileA = await prisma.profile.create({
      data: {
        userName: userNameA,
        fullName: fullNameA,
        description: descriptionA,
        region: regionA,
        mainUrl: mainUrlA,
        avatar: avatarA,
      },
    });

    let freshProfile = await prisma.profile.findFirstOrThrow({
      select: {
        userName: true,
        fullName: true,
      },
      where: {
        id: profileA.id,
      },
    });

    expect(freshProfile.userName).toBe(profileA.userName);
    expect(freshProfile.fullName).toBe(profileA.fullName);
  });

  it("retrieve multiple profiles", async () => {
    const {
      userName: userNameA,
      fullName: fullNameA,
      description: descriptionA,
      region: regionA,
      mainUrl: mainUrlA,
      avatar: avatarA,
    } = getNewProfile();
    const profileA = await prisma.profile.create({
      data: {
        userName: userNameA,
        fullName: fullNameA,
        description: descriptionA,
        region: regionA,
        mainUrl: mainUrlA,
        avatar: avatarA,
      },
    });

    const {
      userName: userNameB,
      fullName: fullNameB,
      description: descriptionB,
      region: regionB,
      mainUrl: mainUrlB,
      avatar: avatarB,
    } = getNewProfile();
    let profileB = await prisma.profile.create({
      data: {
        userName: userNameB,
        fullName: fullNameB,
        description: descriptionB,
        region: regionB,
        mainUrl: mainUrlB,
        avatar: avatarB,
      },
      include: {
        messages: true,
      },
    });

    let message = await prisma.message.create({
      data: {
        body: "abc",
        authorId: profileA.id,
      },
    });

    const profiles = await prisma.profile.findMany({
      where: {
        // messages: {
        //   some: {
        //     id: {
        //       in: [BigInt(24323234), BigInt(2343242), message.id],
        //     },
        //   },
        // },

        OR: [
          {
            userName: {
              endsWith: profileB.userName.substring(2),
            },
          },

          {
            userName: {
              contains: profileA.userName.substring(2),
            },
          },
        ],
      },
    });

    expect(profiles.length).toBe(2);
    expect(profiles[0].id).toBe(profileA.id);
    expect(profiles[1].id).toBe(profileB.id);
  });
});
