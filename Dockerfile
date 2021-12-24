FROM node:alpine

WORKDIR /usr/app

COPY ./package.json ./
RUN npm install

COPY ./prisma ./
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]
