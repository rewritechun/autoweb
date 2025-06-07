import express from 'express';
import handler from './api/submit-ticket.js'; // 不要再写成 ./auto-ticket/api/submit-ticket

const app = express();
const port = process.env.PORT || 10000;

app.get('/submit-ticket', handler);

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
