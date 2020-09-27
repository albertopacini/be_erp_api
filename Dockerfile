FROM node:lts

# Create app directory
WORKDIR /usr/src/app
RUN npm install -g nodemon
COPY ./src/package*.json ./
RUN npm install

COPY ./src .
CMD [ "npm", "start" ]