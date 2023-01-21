FROM node:16.14-alpine

ARG GH_TOKEN

WORKDIR /app

COPY . /app

RUN apk add --update --no-cache openssh git make build-base curl py-pip bash

RUN yarn && chown node:node /app && rm -f /app/.npmrc

USER node

CMD ["sh", "yarn", "start"]
