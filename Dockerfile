# Use Bun official image
FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY src ./src

EXPOSE 3001 

CMD ["bun", "start"]



