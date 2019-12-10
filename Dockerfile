from node:8

# Create app directory
WORKDIR /usr/node/app

COPY package*.json
COPY index.js

RUN npm install



EXPOSE 9001
CMD [ "npm", "start" ]
