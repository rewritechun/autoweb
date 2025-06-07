# 使用官方 Playwright 镜像（包含所有浏览器和依赖）
FROM mcr.microsoft.com/playwright:v1.44.1-jammy

# 设置工作目录
WORKDIR /app

# 拷贝 package.json 和源代码
COPY package.json yarn.lock* ./
COPY . .

# 安装依赖
RUN yarn install

# 设置默认启动命令
CMD ["node", "api/submit-ticket.js"]
