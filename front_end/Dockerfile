FROM node:16.15.1 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN apt-get update && \
apt-get -y dist-upgrade && \
npm run build

CMD ["npm", "run", "start-prod"]