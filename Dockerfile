FROM node:10

# Install app dependencies
COPY package*.json ./

# RUN npm install
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD ["node","server/index.js"]