FROM node:18    
# for backend container image 

WORKDIR /app

# copy package.json ve package-lock.json files
COPY package*.json ./

# run npm install komutunu upload dependencies
RUN npm install  

# copy rest
COPY . .

EXPOSE 3000

# start
CMD ["npm", "start"]
