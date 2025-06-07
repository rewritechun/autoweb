import express from 'express';
import handler from './api/submit-ticket.js';

const app = express();
const port = process.env.PORT || 10000;

app.get('/submit-ticket', handler);

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
