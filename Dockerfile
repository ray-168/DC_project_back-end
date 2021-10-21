FROM node:14-alpine AS development

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Environment
# ENV NODE_ENV=development

RUN npm install

# Bundle app source
COPY . .

# Expose port of our app
EXPOSE 3000 3000


# Run Command for production app
CMD npm run dev
