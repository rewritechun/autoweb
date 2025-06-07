FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "api/submit-ticket.js"]
