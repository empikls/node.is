from node:8

# Create app directory
WORKDIR /usr/node/app

COPY package*.json index.js ./ 

RUN npm install

COPY . .

EXPOSE 9001
CMD [ "npm", "start" ]
