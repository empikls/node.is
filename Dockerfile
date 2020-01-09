FROM node:8


# Create app directory
WORKDIR /usr/node/app


RUN mkdir tests && npm install --save express 

COPY package*.json ./
COPY index.js ./
COPY ./test/test-pages.js ./tests/


EXPOSE 9001
CMD [ "node", "index.js" ]
