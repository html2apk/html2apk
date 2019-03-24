FROM node:10

# Install app dependencies
COPY package*.json ./

# RUN npm install
RUN npm ci --only=production
RUN apt-get update
RUN apt-get install openjdk-8-jdk-headless -y

# Bundle app source
COPY . .

EXPOSE 8080
CMD ["node","index.js"]