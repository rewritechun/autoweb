// server.js
import express from 'express';
import handler from './auto-ticket/api/submit-ticket.js';

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('✅ 服务已部署，访问 /submit 开始填报'));
app.get('/submit', handler);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
