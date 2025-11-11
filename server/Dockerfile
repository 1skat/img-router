# Use Bun official image
FROM oven/bun:debian

WORKDIR /app

# Install jemalloc (better memeory managment for libvips)
RUN apt-get update && apt-get install -y libjemalloc2 && \
    rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock* tsconfig.json ./  

COPY src ./src

RUN bun install

EXPOSE 3001 

CMD ["sh", "-c", "ARCH=$(uname -m); export LD_PRELOAD=/usr/lib/$ARCH-linux-gnu/libjemalloc.so.2; bun start"]




