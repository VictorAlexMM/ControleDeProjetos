FROM node:latest

WORKDIR /controleDeTerceiros/controleweb
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD [ "npm","start" ]

EXPOSE 3001