FROM node:22
WORKDIR /app

## Copy package.json and install dependencies
COPY ./package*.json .
RUN npm install

## Copy the rest of the files and build the app
COPY . .
RUN npm run build

## Set environment variables
ENV SECRET_KEY=e69f73b9e19d4ec080edbf78d023b3bfec0ca7581deae06465cd5c4aa7c18165
ENV EMAIL_PASSWORD='wqws wvon rxew woef'
ENV REFRESH_TOKEN_SECRET=gTooK3x8JwJhqUg291k6b6hxqNblrbU6
ENV PORT=80

## Declare on which port the app will listen
EXPOSE 80

## Start the app
CMD ["./dist/backend/app.js"]