# Use Bun official image
FROM jarredsumner/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

EXPOSE 3001 

CMD ["bun", "start"]



