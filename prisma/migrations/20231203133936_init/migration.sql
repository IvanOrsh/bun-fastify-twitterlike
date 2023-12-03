-- CreateTable
CREATE TABLE "Profile" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userName" VARCHAR(50) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "description" VARCHAR(250),
    "region" VARCHAR(50),
    "mainUrl" VARCHAR(250),
    "avatar" BYTEA,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "followerId" BIGINT NOT NULL,
    "followedId" BIGINT NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" BIGINT NOT NULL,
    "body" VARCHAR(150) NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "image" BYTEA,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageResponse" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "responderMsgId" BIGINT NOT NULL,
    "respondedMsgId" BIGINT NOT NULL,

    CONSTRAINT "MessageResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageBroadcast" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "broadcasterMsgId" BIGINT NOT NULL,
    "broadcastMsgId" BIGINT NOT NULL,
    "additionalMessage" VARCHAR(140),

    CONSTRAINT "MessageBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userName_key" ON "Profile"("userName");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageResponse" ADD CONSTRAINT "MessageResponse_responderMsgId_fkey" FOREIGN KEY ("responderMsgId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageResponse" ADD CONSTRAINT "MessageResponse_respondedMsgId_fkey" FOREIGN KEY ("respondedMsgId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageBroadcast" ADD CONSTRAINT "MessageBroadcast_broadcasterMsgId_fkey" FOREIGN KEY ("broadcasterMsgId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageBroadcast" ADD CONSTRAINT "MessageBroadcast_broadcastMsgId_fkey" FOREIGN KEY ("broadcastMsgId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
