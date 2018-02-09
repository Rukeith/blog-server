FROM node
ENV NODE_ENV=test
ADD ./ /blog-server
CMD yarn test