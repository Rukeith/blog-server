FROM node
LABEL CI-TEST="jenkins" \
      PROJECT="blog"
COPY . blog-server
WORKDIR blog-server
RUN yarn cache clean && yarn
CMD yarn test