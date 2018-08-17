FROM node
LABEL CI-TEST="jenkins"
COPY . .
RUN yarn
CMD yarn test