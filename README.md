This is a small reflection tool for moments when social relationships feel confusing.

You can paste a short conversation or describe a situation that made you think.

The tool will not judge the other person, and it will not try to predict the future of the relationship.

Instead, it offers three small reflections:
an emotion it notices,
a possible point of fixation in your thinking,
and a hypothetical question to help you see your own needs more clearly.

The goal is not to give answers about others,
but to help you understand what you want.

## Local run（本地）

默认开发端口为 **3005**（避免与其它项目冲突）。若你需要 **http://localhost:3000**：

```bash
cd mirror
npm install
npm run dev:3000
```

生产构建后监听 3000：

```bash
npm run build && npm run start:3000
```

## DeepSeek API（localhost）

本项目通过 **Next.js API Route** 代理调用 [DeepSeek](https://platform.deepseek.com)（OpenAI 兼容接口）。

1. **浏览器内配置（常用）**  
   打开应用首页或 `/settings`，填写 **DeepSeek API Key** 并保存。Key 存在本机 `localStorage`（键名见设置页说明），请求头会带 `X-DeepSeek-Key`，由服务端转发至 DeepSeek，**不会**存到你自己的业务服务器数据库。

2. **仅服务端密钥（可选）**  
   复制 `.env.example` 为 `.env.local`，设置 `DEEPSEEK_API_KEY=`。未带请求头时，部分路由会使用该环境变量。请勿把 `.env.local` 提交到 Git。

可选环境变量：`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL`（见 `.env.example`）。

## 仓库与同步

远程仓库：<https://github.com/roye102520-a11y/mirror>

```bash
git pull origin main
# …修改后…
git add -A && git commit -m "your message" && git push origin main
```
