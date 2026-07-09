export type RoleId = "field" | "project" | "group" | "supervisor" | "admin";
export type DeviceMode = "web" | "app";
export type ScenarioKind =
  | "guide"
  | "acceptance"
  | "inspection"
  | "brief"
  | "whiteboardOcr"
  | "supervisionOcr"
  | "history"
  | "permission"
  | "fallback";

export interface Role {
  id: RoleId;
  prdId: string;
  name: string;
  shortName: string;
  demand: string;
  abilities: string[];
  context: string;
}

export interface Scenario {
  id: string;
  title: string;
  shortTitle: string;
  kind: ScenarioKind;
  primaryRole: RoleId;
  allowedRoles: RoleId[];
  preferredMode: DeviceMode;
  trigger: string;
  value: string;
  story: string;
  acceptance: string[];
  imageKey: "dashboard" | "structure" | "modal" | "appHome" | "appForm" | "responsibility" | "ocrMarked";
}

export const roles: Role[] = [
  {
    id: "field",
    prdId: "Role-001",
    name: "现场作业人员",
    shortName: "现场",
    demand: "快速查询操作步骤、发起工序报验、提交检查记录、上传照片/工程检查。",
    abilities: ["指南问答", "表单直达", "拍照识别", "草稿确认", "任务状态查看"],
    context: "融罗高速二分部 / K10+887 路基工程"
  },
  {
    id: "project",
    prdId: "Role-002",
    name: "项目管理人员",
    shortName: "项目",
    demand: "查看项目简报、核对填报结果、追踪流程状态、处理异常。",
    abilities: ["项目统计", "明细钻取", "工程检查结果复核", "异常处理"],
    context: "广西路桥集团 / 龙融高速一分部"
  },
  {
    id: "group",
    prdId: "Role-003",
    name: "集团/直属单位管理人员",
    shortName: "集团",
    demand: "获取多项目统计、趋势分析、导出报表、复盘管理情况。",
    abilities: ["四级简报", "跨项目汇总", "导出", "历史快照"],
    context: "广西路桥集团 / 全部授权项目"
  },
  {
    id: "supervisor",
    prdId: "Role-004",
    name: "项目管理/监管负责人",
    shortName: "监管",
    demand: "识别监管资料、核对结构与人员绑定、查看重点任务。",
    abilities: ["重点监管工程检查", "结构匹配", "人员匹配", "任务追溯"],
    context: "重点监管清单 / 隧道工程"
  },
  {
    id: "admin",
    prdId: "Role-005",
    name: "系统管理员",
    shortName: "管理员",
    demand: "维护配置、权限、审计、监控和 AI 服务运维。",
    abilities: ["字段模板", "GenUI 白名单", "配置发布/回滚", "审计查询", "监控告警"],
    context: "AI 配置中心 / 生产灰度版本"
  }
];

export const scenarios: Scenario[] = [
  {
    id: "Scene-001",
    title: "操作指南问答",
    shortTitle: "指南问答",
    kind: "guide",
    primaryRole: "field",
    allowedRoles: ["field", "project", "group", "supervisor", "admin"],
    preferredMode: "web",
    trigger: "工序报验步骤",
    value: "快速获得与当前业务一致的操作步骤和候选入口。",
    story: "作为现场作业人员，我想输入“工序报验步骤”，以便快速看到对应操作指南和表单入口。",
    acceptance: ["AC-001", "AC-003", "AC-010"],
    imageKey: "dashboard"
  },
  {
    id: "Scene-002",
    title: "自然语言发起工序报验",
    shortTitle: "工序报验",
    kind: "acceptance",
    primaryRole: "field",
    allowedRoles: ["field", "project", "supervisor"],
    preferredMode: "app",
    trigger: "发起测试一分部拉秀3号大桥模板安装工序报验",
    value: "根据项目名称、验收部位、验收工序生成工序报验草稿。",
    story: "作为现场作业人员，我想输入“发起测试一分部拉秀3号大桥模板安装工序报验”，以便系统生成工序报验草稿并跳转表单。",
    acceptance: ["AC-001", "AC-004", "AC-005", "AC-010"],
    imageKey: "appForm"
  },
  {
    id: "Scene-003",
    title: "自然语言发起检查记录",
    shortTitle: "检查记录",
    kind: "inspection",
    primaryRole: "field",
    allowedRoles: ["field", "project", "supervisor"],
    preferredMode: "web",
    trigger: "语音：K12+300 左幅边坡防护钢筋外露，生成检查记录",
    value: "根据检查对象、问题描述、人员等信息生成检查记录草稿。",
    story: "作为现场作业人员，我想通过语音描述检查问题，以便系统生成检查记录草稿并引导我补齐缺失字段。",
    acceptance: ["AC-004", "AC-005", "AC-011"],
    imageKey: "modal"
  },
  {
    id: "Scene-004",
    title: "四级层级数据简报",
    shortTitle: "数据简报",
    kind: "brief",
    primaryRole: "group",
    allowedRoles: ["project", "group", "supervisor", "admin"],
    preferredMode: "web",
    trigger: "集团 2026 年 2 月工序简报",
    value: "通过自然语言生成报验/检查统计卡片、图表和明细。",
    story: "作为集团管理人员，我想输入“集团 2026 年 2 月工序简报”，以便系统按四级层级汇总报验/检查情况。",
    acceptance: ["AC-002", "AC-006", "AC-010"],
    imageKey: "dashboard"
  },
  {
    id: "Scene-005",
    title: "白板照片识别",
    shortTitle: "工程检查",
    kind: "whiteboardOcr",
    primaryRole: "field",
    allowedRoles: ["field", "project", "supervisor"],
    preferredMode: "app",
    trigger: "识别白板信息",
    value: "提取桩号、工程部位、施工节点等信息并自动填充表单。",
    story: "作为现场作业人员，我想拍摄白板照片，以便自动识别桩号、工程部位和施工节点并填入表单。",
    acceptance: ["AC-007", "AC-011"],
    imageKey: "appHome"
  },
  {
    id: "Scene-006",
    title: "重点监管资料工程检查",
    shortTitle: "监管检查",
    kind: "supervisionOcr",
    primaryRole: "supervisor",
    allowedRoles: ["project", "supervisor"],
    preferredMode: "web",
    trigger: "上传工程质量责任登记卡，识别人员、结构和附件",
    value: "从责任登记卡、附件等资料提取结构、人员、单位和附件信息。",
    story: "作为监管负责人，我想上传责任登记卡或当前文件，以便系统自动识别人员、结构和附件并生成确认结果。",
    acceptance: ["AC-007", "AC-010", "AC-011"],
    imageKey: "responsibility"
  },
  {
    id: "Scene-007",
    title: "历史会话与任务追溯",
    shortTitle: "历史追溯",
    kind: "history",
    primaryRole: "project",
    allowedRoles: ["field", "project", "group", "supervisor", "admin"],
    preferredMode: "web",
    trigger: "查看上次 K10+887 工序报验任务状态",
    value: "追溯提问、结果、来源、确认、提交和异常信息。",
    story: "作为项目管理人员，我想查询历史会话和任务节点，以便追踪流程状态和审计证据。",
    acceptance: ["AC-002", "AC-010"],
    imageKey: "structure"
  },
  {
    id: "Scene-008",
    title: "权限不足与异常兜底",
    shortTitle: "权限兜底",
    kind: "permission",
    primaryRole: "group",
    allowedRoles: ["group", "admin"],
    preferredMode: "web",
    trigger: "导出未授权项目的检查明细",
    value: "清晰提示无法办理原因，保留人工处理路径。",
    story: "作为用户，当我没有项目或导出权限时，我需要看到明确原因和申请路径，但系统不得暴露不可见数据存在性。",
    acceptance: ["AC-008", "AC-009", "AC-010"],
    imageKey: "dashboard"
  },
  {
    id: "Scene-009",
    title: "人在回路与人工兜底",
    shortTitle: "人在回路",
    kind: "fallback",
    primaryRole: "field",
    allowedRoles: ["field", "project", "supervisor"],
    preferredMode: "web",
    trigger: "帮我弄一下这个工序，照片里那段要验收",
    value: "低置信度或候选冲突时，用户可确认、修正、补录、人工绑定或转人工办理。",
    story: "作为现场作业人员，当 AI 无法识别、识别错误或置信度较低时，我想看到原因和可操作的人工处理入口。",
    acceptance: ["AC-004", "AC-009", "AC-011"],
    imageKey: "ocrMarked"
  }
];

export const acceptanceLabels: Record<string, string> = {
  "AC-001": "Web 侧边栏和 App 一级入口均可正常使用",
  "AC-002": "Web/App 共用会话、任务、历史和审计模型",
  "AC-003": "操作类问题返回答案、候选指南、来源和关联入口",
  "AC-004": "自然语言生成草稿，缺失信息可追问",
  "AC-005": "所有正式写入动作均需用户确认",
  "AC-006": "四级层级简报、钻取、导出、快照可用",
  "AC-007": "图片/PDF 创建工程检查任务，确认后填充表单",
  "AC-008": "越权查询、写入、跨项目数据均被拦截",
  "AC-009": "RAG、工程检查、模型、工具失败时有人工路径",
  "AC-010": "会话、任务、工具、确认、异常可审计",
  "AC-011": "低置信、多候选、识别错误可人工闭环"
};

export const permissionMatrix: Record<RoleId, string[]> = {
  field: ["打开 AI 助手", "操作指南问答", "发起工序报验", "发起检查记录", "项目简报", "工程检查填报", "人工修正/补录"],
  project: ["打开 AI 助手", "操作指南问答", "发起工序报验", "发起检查记录", "项目简报", "工程检查结果复核", "异常处理"],
  group: ["打开 AI 助手", "操作指南问答", "集团/直属单位简报", "跨项目汇总", "导出报表", "历史快照"],
  supervisor: ["打开 AI 助手", "操作指南问答", "发起工序报验", "发起检查记录", "项目简报", "重点监管工程检查", "人工绑定"],
  admin: ["打开 AI 助手", "操作指南问答", "配置发布/回滚", "审计查询", "复核样本池查看", "监控告警"]
};

export const quickCommands = [
  "工序报验步骤",
  "发起测试一分部模板安装工序报验",
  "集团 2026 年 2 月工序简报",
  "上传责任登记卡工程检查",
  "查看 AI 调用审计"
];
