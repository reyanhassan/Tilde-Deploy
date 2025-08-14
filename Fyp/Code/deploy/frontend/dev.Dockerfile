FROM node:22.13.0-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY . .

# Install dependencies
RUN npm ci

EXPOSE 3000

CMD npm run dev