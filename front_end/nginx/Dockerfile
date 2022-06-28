FROM node:16.15.1 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN apt-get update && \
apt-get -y dist-upgrade && \
apt-get install -y tree && \
npm run build

# build without bootstrap for some reason

FROM nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]