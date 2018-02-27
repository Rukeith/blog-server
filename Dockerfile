FROM node
LABEL CI-TEST="jenkins"
ADD ./ /blog-server
WORKDIR /blog-server
RUN yarn
CMD yarn test