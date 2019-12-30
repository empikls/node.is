FROM node:8


# Create app directory
WORKDIR /usr/node/app

COPY package*.json /usr/node/app/
COPY index.js /usr/node/app/

RUN npm install

EXPOSE 9001
CMD [ "npm", "start" ]
