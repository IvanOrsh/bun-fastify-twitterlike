import { PrismaClient } from "@prisma/client";

export default class MessageRepo {
  constructor(private readonly client: PrismaClient) {}
}
