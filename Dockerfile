FROM mhart/alpine-node:8

WORKDIR /app
COPY . .

RUN npm install --production
ENV NODE_ENV production
CMD ["node", "server.js"]

