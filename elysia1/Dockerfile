# Use Bun official image
FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock* tsconfig.json ./
COPY src ./src

RUN bun install

EXPOSE 3001 

CMD ["bun", "start"]



