FROM node:8


# Create app directory
WORKDIR /usr/node/app


RUN mkdir tests && npm install

COPY package*.json /usr/node/app/
COPY index.js /usr/node/app/
COPY ./test/test-pages.js /usr/node/app/tests/


EXPOSE 9001
CMD [ "npm", "start" ]
