FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json package-lock.json* ./

RUN npm ci && npm cache clean --force

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "exporter.js" ]
