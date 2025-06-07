const express = require('express');
const bodyParser = require('body-parser');
const submitHandler = require('./auto-ticket/api/submit-ticket');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('✅ 自动化平台运行中，请访问 /submit 执行工单提交');
});

app.get('/submit', submitHandler);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
