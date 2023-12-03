import { describe, it, expect } from "bun:test";

import Repository from "../Repository";
import { getNewProfile } from "../../__tests__/fixtures";

const repo = new Repository();

describe("Test ProfileRepo", () => {
  it("creates a valid profile", async () => {
    const { userName, fullName, description, region, mainUrl, avatar } =
      getNewProfile();

    const profile = await repo.profileRepo.insertProfile(
      userName,
      fullName,
      description,
      region,
      mainUrl,
      avatar
    );

    expect(profile.userName).toBe(userName);
    expect(profile.fullName).toBe(fullName);
    expect(profile.description).toBe(description);
    expect(profile.region).toBe(region);
    expect(profile.mainUrl).toBe(mainUrl);
    expect(profile.avatar).toEqual(avatar);
  });

  it("create profile and select it", async () => {
    const { userName, fullName, description, region, mainUrl, avatar } =
      getNewProfile();

    await repo.profileRepo.insertProfile(
      userName,
      fullName,
      description,
      region,
      mainUrl,
      avatar
    );

    const profile = await repo.profileRepo.selectProfile(userName);

    expect(profile?.userName).toBe(userName);
    expect(profile?.fullName).toBe(fullName);
    expect(profile?.description).toBe(description);
    expect(profile?.region).toBe(region);
    expect(profile?.mainUrl).toBe(mainUrl);
    expect(profile?.avatar).toEqual(avatar);
  });

  it("get followed from follower", async () => {
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

    const size = 4;
    let followedList: {
      id: bigint;
      userName: string;
      fullName: string;
      description: string | null;
      region: string | null;
      mainUrl: string | null;
      avatar: Buffer | null;
    }[] = new Array(size);

    for (let i = 0; i < size; i++) {
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
      followedList[i] = followed;

      await repo.profileRepo.insertFollow(follower.id, followed.id);
    }

    const followedProfiles = await repo.profileRepo.selectFollowerProfile(
      follower.id
    );

    followedList.reverse();

    for (let i = 0; i < followedProfiles.length; i++) {
      const currentFollowed = followedProfiles[i];

      expect(currentFollowed.id).toBe(followedList[i].id);
      expect(currentFollowed.userName).toBe(followedList[i].userName);
      expect(currentFollowed.fullName).toBe(followedList[i].fullName);
      expect(currentFollowed.description).toBe(followedList[i].description);
      expect(currentFollowed.region).toBe(followedList[i].region);
      expect(currentFollowed.mainUrl).toBe(followedList[i].mainUrl);
      expect(currentFollowed.avatar).toEqual(followedList[i].avatar);
    }
  });

  it("get followers from followed", async () => {
    const { userName, fullName, description, region, mainUrl, avatar } =
      getNewProfile();

    const followedProfile = await repo.profileRepo.insertProfile(
      userName,
      fullName,
      description,
      region,
      mainUrl,
      avatar
    );

    const size = 4;
    let listOfFollowerProfiles: {
      id: bigint;
      createdAt: Date;
      updatedAt: Date;
      userName: string;
      fullName: string;
      description: string | null;
      region: string | null;
      mainUrl: string | null;
      avatar: Buffer | null;
    }[] = new Array(size);
    for (let i = 0; i < size; i++) {
      const { userName, fullName, description, region, mainUrl, avatar } =
        getNewProfile();

      const followerProfile = await repo.profileRepo.insertProfile(
        userName,
        fullName,
        description,
        region,
        mainUrl,
        avatar
      );
      listOfFollowerProfiles[i] = followerProfile;

      await repo.profileRepo.insertFollow(
        followerProfile.id,
        followedProfile.id
      );
    }

    const followerProfiles = await repo.profileRepo.selectFollowerProfile(
      followedProfile.id
    );

    listOfFollowerProfiles.reverse();
    for (let i = 0; i < followerProfiles.length; i++) {
      const dbFollowerProfile = followerProfiles[i];
      const listedFollowerProfile = listOfFollowerProfiles[i];

      expect(dbFollowerProfile.userName).toBe(listedFollowerProfile.userName);
      expect(dbFollowerProfile.fullName).toBe(listedFollowerProfile.fullName);
      expect(dbFollowerProfile.description).toBe(
        listedFollowerProfile.description
      );
      expect(dbFollowerProfile.region).toBe(listedFollowerProfile.region);
      expect(dbFollowerProfile.mainUrl).toBe(listedFollowerProfile.mainUrl);
      expect(dbFollowerProfile.avatar).toEqual(listedFollowerProfile.avatar);
    }
  });
});
