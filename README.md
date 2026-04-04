# 简单显化日记 (Manifestation Diary)

这是一个基于 Vue 3 + TypeScript 构建的个人深度觉察与日常记录系统。它不仅仅是一个日记本，更是一个将宏大目标拆解为每日微小行动的个人管理控制台。

## ✨ 核心功能 (Features)

*   📸 **意图板 (Intention Board)**：带有真实物理悬垂感（麻绳与小木夹）的宝丽来照片墙，用于视觉化显化目标。
*   🎯 **状态控制台 (Dashboard)**：
    *   **生命之轮**：交互式 SVG 雷达图，实时评估健康、事业、财务等 8 个生活维度的满意度。
    *   **年度庆祝**：置顶 12 个月后的宏观画面，时刻保持长期视角的聚焦。
*   📝 **极简日记 (Daily Micro-journaling)**：支持自动保存与字数统计的沉浸式输入框，专注于“今天为目标做的一件微小的事”。
*   🧰 **深度觉察工具 (底层数据库已就绪)**：包含奥德赛计划 (Odyssey Plan)、恐惧设定 (Fear Setting) 和所罗门对话 (Solomon's Paradox) 的数据结构。

## 🛠 技术栈 (Tech Stack)

*   **前端框架**: Vue 3 (Composition API)
*   **开发语言**: TypeScript
*   **构建工具**: Vite
*   **后端/数据库**: Supabase (PostgreSQL + REST API)
*   **样式**: 原生 CSS 变量驱动 (无外部 UI 库，极致轻量)

## 🚀 本地运行指南 (Local Setup)

### 1. 安装依赖
请确保你的电脑上已经安装了 [Node.js](https://nodejs.org/)。然后在项目根目录下运行：

```bash
npm install
