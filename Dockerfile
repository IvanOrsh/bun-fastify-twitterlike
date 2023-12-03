FROM ubuntu:20.04

RUN  apt-get update -y && \
     apt-get upgrade -y && \
     apt-get dist-upgrade -y && \
     apt-get -y autoremove && \
     apt-get clean && \
     apt-get install -y mlocate && \
     apt-get install curl -y && \
     apt-get install zip -y

# node is needed because currently prisma cli is hard coded to it
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

COPY package.json ./
COPY bun.lockb ./
COPY prisma ./prisma
COPY src ./src

CMD curl -fsSL https://bun.sh/install | bash && \
    export PATH="${HOME}/.bun/bin:${PATH}" && \
    bun install --force && \    
    bun install -g prisma@5.5.2 && \    
    bun prisma generate && \
    bun prisma migrate deploy && \
    bun ./src/index.ts