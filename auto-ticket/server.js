import express from 'express';
import submitTicket from './api/submit-ticket.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ 服务已启动！');
});

app.post('/submit-ticket', submitTicket);

app.listen(port, () => {
  console.log(`🚀 服务运行中：http://localhost:${port}`);
});
