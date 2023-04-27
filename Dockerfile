FROM node:18-alpine

ENV GENERATE_SOURCEMAP false
WORKDIR /usr/app

# install dependencies

COPY ./package.json ./
RUN npm install

COPY ./ ./

# Default command
# we list out all the commands that we want to run when the container is first created
CMD [ "npm", "start" ]