🪞 Mirror · 关系反思工具

当社交关系让你感到困惑时，用来帮你理清思绪的小工具。

在线体验 → mirror-swart.vercel.app

目录

它是什么
快速开始（本地运行）
配置 DeepSeek API
同步代码仓库


它是什么
你可以把一段对话粘贴进来，或者描述一个让你困惑的情境。
工具会给出三个小反思：
反思维度说明🎭 情绪识别它注意到的一种情绪🔍 思维定势你可能卡住的地方💬 假设性问题帮你看清自己的需求

它不评判对方，也不预测关系走向。
目标是帮你理解你自己想要什么。


快速开始（本地运行）
1. 克隆并安装
bashcd mirror
npm install
2. 启动开发服务器
bash# 默认端口 3005
npm run dev

# 如果需要 localhost:3000
npm run dev:3000
3. 生产构建
bashnpm run build && npm run start:3000

配置 DeepSeek API
本项目通过 Next.js API Route 代理调用 DeepSeek（兼容 OpenAI 接口格式）。
方式一：浏览器内配置（推荐）

打开应用首页或进入 /settings
填写你的 DeepSeek API Key 并保存
Key 仅存储在本机 localStorage，通过请求头 X-DeepSeek-Key 由服务端转发，不会上传到业务数据库

方式二：服务端环境变量（可选）
bash# 复制示例文件
cp .env.example .env.local
在 .env.local 中填写：
DEEPSEEK_API_KEY=你的密钥
# 可选：
# DEEPSEEK_BASE_URL=
# DEEPSEEK_MODEL=

⚠️ 请勿将 .env.local 提交到 Git


同步代码仓库
远程仓库：https://github.com/roye102520-a11y/mirror
bash# 拉取最新代码
git pull origin main

# 提交并推送
git add -A && git commit -m "your message" && git push origin main
