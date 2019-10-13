FROM node:alpine
LABEL SERVICE="server" \
  PROJECT="blog"
WORKDIR /usr/app
COPY yarn.lock .
RUN yarn
COPY . /usr/app
ENTRYPOINT [ "yarn", "start" ]