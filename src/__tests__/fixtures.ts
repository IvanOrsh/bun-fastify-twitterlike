import { faker } from "@faker-js/faker";

export function getNewProfile() {
  return {
    userName: faker.internet.userName(),
    fullName: faker.person.fullName(),
    description: faker.lorem.sentences(1),
    region: faker.location.country(),
    mainUrl: faker.internet.url(),
    avatar: Buffer.from(faker.image.avatar()),
  };
}
