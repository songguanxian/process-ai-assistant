# 工序管控系统 AI 助手 Demo

这是一个面向工序管控系统的 AI 助手交互 Demo，用于演示 AI 助手如何嵌入既有 Web 端和 App 端业务页面，在不改变原系统核心流程的前提下，提供操作指南问答、工序报验辅助、工程检查辅助、AI 数据简报、历史追溯和人机回路确认能力。

项目基于《工序AI助手_PRD_正式版》开发，当前 Demo 重点呈现“AI 作为业务助手嵌入原系统”的交互方式：Web 端通过右侧抽屉呼出 AI 助手，App 端通过移动端 AI 页面进入对话式办理；所有提交、整改、验收等写入动作均先生成可核对内容，等待用户确认后再进入原系统流程。

## 核心能力

- Web 端嵌入：保留原工序管控系统首页作为主画布，AI 助手从右侧抽屉弹出，可展开、收起和继续对话。
- App 端嵌入：模拟移动端智能填报入口，支持对话式发起工序报验和工程检查。
- 场景演示：覆盖操作指南问答、自然语言发起工序报验、检查记录、AI 简报、图片识别、历史追溯、权限兜底和人在回路等演示流程。
- 角色切换：支持现场作业人员、项目管理人员、集团/直属单位管理人员、监管负责人、系统管理员等角色视角。
- 工序报验：根据自然语言生成候选卡片，支持手动修改、人工填报、确认提交，并联动 App 原系统工序报验表单。
- 工程检查：根据检查语义生成候选卡片，支持补充问题、整改期限、现场影像，并联动 App 原系统工程检查页面。
- AI 简报：生成带文字分析、关键指标、柱状图、折线图、饼图的工序简报。
- 可追溯确认：展示来源、置信度、候选项、人工确认与审计记录，体现 PRD 中的人机协同边界。

## 技术栈

- React 18
- TypeScript
- Vite
- lucide-react
- Playwright

当前项目是一个前端可运行 Demo，AI、RAG、业务接口、OCR/图片识别和后台写入均以可交互的模拟数据和界面状态呈现，便于产品评审、需求澄清和方案演示。

## 快速开始

请先确认本机已安装 Node.js 18 或更高版本。

```bash
npm install
npm run dev
```

启动后访问：

```text
http://localhost:5174/
```

如果端口被占用，Vite 会自动切换到新的可用端口，请以终端输出为准。

## 常用命令

```bash
# 启动开发环境
npm run dev

# 构建生产版本
npm run build

# 本地预览构建产物
npm run preview

# 执行端到端测试
npm run test:e2e
```

## 演示入口

默认访问首页即可进入 Web 端演示。也可以通过 URL 参数直接进入指定设备和场景：

```text
http://localhost:5174/?mode=web&scenario=Scene-001
http://localhost:5174/?mode=app&scenario=Scene-002
http://localhost:5174/?mode=app&scenario=Scene-003
http://localhost:5174/?mode=web&scenario=Scene-004
```

常用场景包括：

| 场景 | 说明 |
| --- | --- |
| Scene-001 | 操作指南问答 |
| Scene-002 | 自然语言发起工序报验 |
| Scene-003 | 工程检查辅助填报 |
| Scene-004 | AI 数据简报 |
| Scene-005 | 白板/图片识别进入业务候选 |
| Scene-006 | 监管资料工程检查 |
| Scene-007 | 历史追溯 |
| Scene-008 | 权限兜底 |
| Scene-009 | 人在回路 |

## 项目结构

```text
.
├── extracted-docx-images/      # PRD 和原系统截图素材
├── spec/                       # PRD 文档 Markdown 与 docx 版本
├── src/
│   ├── App.tsx                 # Demo 主交互和页面状态
│   ├── demoData.ts             # 角色、场景、权限、快捷指令数据
│   ├── main.tsx                # React 入口
│   └── styles.css              # Demo 样式
├── tests/
│   └── demo-smoke.spec.ts      # Playwright 演示流程测试
├── design-qa.md                # 设计和视觉 QA 记录
├── package.json
├── playwright.config.mjs
├── tsconfig.json
└── vite.config.ts
```

## PRD 文档

PRD 位于：

- `spec/工序AI助手_PRD_正式版.md`
- `spec/工序AI助手_PRD_正式版.docx`


## 测试与验证

本项目包含 Playwright 端到端测试，用于验证 Web/App 双端关键演示路径。

```bash
npm run build
npm run test:e2e
```

已覆盖的关键行为包括：

- Web 端 AI 抽屉展开/收起
- 开场白与快捷入口
- 工序报验候选卡片
- 工程检查候选卡片
- 补充信息确认卡片
- App 端原系统表单跳转
- AI 简报文字与图表
- 历史追溯和人在回路提示

## 设计说明

Demo 遵循现有工序管控系统的视觉风格：

- Web 端保留深色左侧导航、顶部栏、首页统计卡片和图表区域。
- AI 助手作为右侧抽屉出现，不占用原系统主流程。
- 场景演示、角色介绍和 AI 审计入口收纳在原系统左侧栏底部，按需弹窗展示。
- App 端保留蓝色顶部栏、底部导航和原系统表单结构，AI 只负责生成候选和预填内容。

## 注意事项

- 本项目是 Demo，不包含真实后端服务、真实模型调用和真实业务写库。
- `node_modules/`、`dist/`、`test-results/`、Vite 日志、Office 临时文件等不会提交到 Git。
- `extracted-docx-images/` 中的截图是 Demo 运行依赖资产，请保留。

