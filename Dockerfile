FROM node:alpine
LABEL SERVICE="server" \
  PROJECT="blog"
ENV NODE_ENV=development
WORKDIR /usr/app
COPY yarn.lock .
RUN yarn
COPY . /usr/app
ENTRYPOINT [ "yarn", "start" ]
