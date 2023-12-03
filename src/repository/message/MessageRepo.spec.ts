import { describe, it, expect } from "bun:test";
import { faker } from "@faker-js/faker";

import { getNewProfile } from "../../__tests__/fixtures";
import Repository from "../Repository";

const repo = new Repository();

describe("Testing MessageRepo", () => {
  it("Get messages of followed", async () => {
    const { userName, fullName, description, region, mainUrl, avatar } =
      getNewProfile();

    const follower = await repo.profileRepo.insertProfile(
      userName,
      fullName,
      description,
      region,
      mainUrl,
      avatar
    );

    let listOfFollowedMessages = [];

    for (let i = 0; i < 4; i++) {
      const { userName, fullName, description, region, mainUrl, avatar } =
        getNewProfile();
      const followed = await repo.profileRepo.insertProfile(
        userName,
        fullName,
        description,
        region,
        mainUrl,
        avatar
      );

      listOfFollowedMessages.push(
        await repo.messageRepo.insertMessage(
          follower.id,
          faker.lorem.sentences(1)
        )
      );

      await repo.profileRepo.insertFollow(follower.id, followed.id);
    }

    listOfFollowedMessages.reverse();

    const followedMessages = await repo.messageRepo.selectMessagesFromFollowed(
      follower.id
    );

    for (let i = 0; i < followedMessages.length; i++) {
      const currentFollowed = followedMessages[i];
      const currentListMessage = listOfFollowedMessages[i];
      expect(currentFollowed.body).toBe(currentListMessage.body);
    }
  });

  it("selects messages by author id", async () => {
    const { userName, fullName, description, region, mainUrl, avatar } =
      getNewProfile();
    const author = await repo.profileRepo.insertProfile(
      userName,
      fullName,
      description,
      region,
      mainUrl,
      avatar
    );

    let authorMessages = [];
    for (let i = 0; i < 5; i++) {
      authorMessages.push(
        await repo.messageRepo.insertMessage(
          author.id,
          faker.lorem.sentences(1)
        )
      );
    }

    authorMessages.reverse();

    const resultMessages = await repo.messageRepo.selectedMessagesByAuthorId(
      author.id
    );

    for (let i = 0; i < authorMessages.length; i++) {
      const resultMessage = resultMessages[i];
      const authorMessage = authorMessages[i];
      expect(resultMessage.id).toBe(authorMessage.id);
      expect(resultMessage.body).toBe(authorMessage.body);
      expect(resultMessage.authorId).toBe(author.id);
    }
  });

  it("creates a new message", async () => {
    const { userName, fullName, description, region, mainUrl, avatar } =
      getNewProfile();
    const author = await repo.profileRepo.insertProfile(
      userName,
      fullName,
      description,
      region,
      mainUrl,
      avatar
    );

    const body = faker.lorem.sentences(1);
    const image = Buffer.from(faker.image.image());

    const message = await repo.messageRepo.insertMessage(
      author.id,
      body,
      image
    );

    expect(message.authorId).toBe(author.id);
    expect(message.body).toBe(body);
    expect(message.image).toEqual(image);
  });

  it("responses to messages", async () => {
    const responderParam = getNewProfile();
    const responder = await repo.profileRepo.insertProfile(
      responderParam.userName,
      responderParam.fullName,
      responderParam.description,
      responderParam.region,
      responderParam.mainUrl,
      responderParam.avatar
    );

    const respondedParam = getNewProfile();
    const responded = await repo.profileRepo.insertProfile(
      respondedParam.userName,
      respondedParam.fullName,
      respondedParam.description,
      respondedParam.region,
      respondedParam.mainUrl,
      respondedParam.avatar
    );

    const respondedBody = faker.lorem.sentences(1);
    const respondedMsg = await repo.messageRepo.insertMessage(
      responded.id,
      respondedBody
    );

    const responderBody = faker.lorem.sentences(1);
    const responderMsg = await repo.messageRepo.insertMessage(
      responder.id,
      responderBody,
      undefined,
      respondedMsg.id
    );

    const responseMessages = await repo.messageRepo.selectMessageResponses(
      respondedMsg.id
    );

    expect(responseMessages.length).toBe(1);
    expect(responseMessages[0].responderMsg.body).toBe(responderBody);
    expect(responseMessages[0].respondedMsg.body).toBe(respondedBody);
  });

  it("creates a new broadcast message successfully", async () => {
    const newBroadcaster = getNewProfile();
    const broadcaster = await repo.profileRepo.insertProfile(
      newBroadcaster.userName,
      newBroadcaster.fullName,
      newBroadcaster.description,
      newBroadcaster.region,
      newBroadcaster.mainUrl,
      newBroadcaster.avatar
    );
    const newBroadcast = getNewProfile();
    const broadcast = await repo.profileRepo.insertProfile(
      newBroadcast.userName,
      newBroadcast.fullName,
      newBroadcast.description,
      newBroadcast.region,
      newBroadcast.mainUrl,
      newBroadcast.avatar
    );

    const broadcastBody = faker.lorem.sentence();
    const broadcastImage = Buffer.from(faker.image.image());
    const broadcastMessage = await repo.messageRepo.insertMessage(
      broadcast.id,
      broadcastBody,
      broadcastImage
    );

    const broadcasterAdditionalMsg = "I am broadcasting original message";
    const broadcasterBody = faker.lorem.sentence();
    const broadcasterImage = Buffer.from(faker.image.image());
    const broadcasterMessage = await repo.messageRepo.insertMessage(
      broadcaster.id,
      broadcasterBody,
      broadcasterImage,
      undefined,
      broadcastMessage.id,
      broadcasterAdditionalMsg
    );

    const selectedBroadcasterMessages =
      await repo.messageRepo.selectMessageBroadcasts(broadcastMessage.id);
    expect(selectedBroadcasterMessages.length).toBe(1);
    expect(selectedBroadcasterMessages[0].broadcasterMsg.id).toBe(
      broadcasterMessage.id
    );
    expect(selectedBroadcasterMessages[0].broadcasterMsg.body).toBe(
      broadcasterBody
    );
    expect(selectedBroadcasterMessages[0].broadcasterMsg.image).toEqual(
      broadcasterImage
    );
    expect(selectedBroadcasterMessages[0].additionalMessage).toEqual(
      broadcasterAdditionalMsg
    );
  });
});
