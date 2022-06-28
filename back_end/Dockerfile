FROM node:16.15.1 AS build
WORKDIR /home/node/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN apt-get update && \
apt-get -y dist-upgrade

STOPSIGNAL SIGINT

CMD [ "npm", "run", "build"]
