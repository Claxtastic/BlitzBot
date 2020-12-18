# get ffmpeg bins from image
FROM jrottenberg/ffmpeg:3.3-alpine

FROM node:14

COPY --from=jrottenberg/ffmpeg /usr/local /usr/local

WORKDIR /app

COPY package.json /app

COPY yarn.lock /app

RUN yarn install

COPY . /app

CMD yarn start
