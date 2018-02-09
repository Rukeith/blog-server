FROM node
ENV NODE_ENV=test \
    MONGODB_URI=mongodb://blog-server-mongo:27017/rukeith-blog
ADD ./ /blog-server
WORKDIR /blog-server
CMD yarn test