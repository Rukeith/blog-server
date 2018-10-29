FROM node
LABEL SERVICE="server" \
      PROJECT="blog"
ENV PORT=443 \
    NODE_ENV="production" \
    USERNAME="rukeith" \
    PASSWORD="iampassword" \
    SALT="iamsalt" \
    HASH_PASSWORD="22e9092cea7d4425fa818ffd8c7309e5d1b7df456a74221d7ff9530897ada514f53b621a182d909cb7171d420fac990ef7ac4dc3a1a58cf672e03849c61d0e73" \
    JWT_SECRET="blog" \
    ISSUER="rukeith"
COPY . blog-server
WORKDIR blog-server
RUN yarn cache clean && yarn
CMD yarn start