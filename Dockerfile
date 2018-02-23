FROM node
LABEL CI-TEST="jenkins"
ENV NODE_ENV=test \
    MONGODB_URI=mongodb://blog-database:27017/rukeith-blog
ADD ./ /blog-server
WORKDIR /blog-server
RUN yarn
CMD yarn test