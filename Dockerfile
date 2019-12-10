from node:8

# Create app directory
WORKDIR /usr/node/app



RUN npm install

COPY . .

EXPOSE 9001
CMD [ "npm", "start" ]
