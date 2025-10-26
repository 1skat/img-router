# Use Bun official image
FROM oven/bun:latest

WORKDIR /app

# Install jemalloc
RUN apt-get update && apt-get install -y libjemalloc2

COPY package.json bun.lock* tsconfig.json .env  ./  

COPY src ./src

RUN bun install

ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so

EXPOSE 3001 

CMD ["bun", "start"]



