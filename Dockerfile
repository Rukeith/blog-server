FROM node
LABEL CI-TEST="jenkins" \
      PLATFORM="blog"
COPY . blog-server
WORKDIR blog-server
RUN yarn cache clean && yarn
CMD yarn start