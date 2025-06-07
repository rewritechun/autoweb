import express from 'express';
import handler from './api/submit-ticket.js';

const app = express();
const port = process.env.PORT || 3000;

app.get('/submit', handler);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
