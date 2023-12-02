FROM ubuntu:20.04

RUN  apt-get update -y && \
     apt-get upgrade -y && \
     apt-get dist-upgrade -y && \
     apt-get -y autoremove && \
     apt-get clean && \
     apt-get install -y mlocate && \
     apt-get install curl -y && \
     apt-get install zip -y

COPY package.json ./
COPY bun.lockb ./
COPY src ./src

CMD curl -fsSL https://bun.sh/install | bash && \
    export PATH="${HOME}/.bun/bin:${PATH}" && \
    bun install --force && \
    bun ./src/index.ts