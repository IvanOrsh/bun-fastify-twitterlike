import { expect, describe, it } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

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
});
