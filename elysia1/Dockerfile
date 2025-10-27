# Use Bun official image
FROM oven/bun:debian

WORKDIR /app

# Install jemalloc
RUN apt-get update && apt-get install -y libjemalloc2 && \
    rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock* tsconfig.json ./  

COPY src ./src

RUN bun install

ENV LD_PRELOAD=/usr/lib/aarch64-linux-gnu/libjemalloc.so.2

EXPOSE 3001 

CMD ["bun", "start"]



