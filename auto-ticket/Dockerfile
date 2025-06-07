FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /app

COPY . .

RUN yarn install

CMD ["node", "api/submit-ticket.js"]
