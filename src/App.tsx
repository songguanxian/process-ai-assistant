import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Database,
  Download,
  FileSearch,
  FileText,
  History,
  Home,
  ImageIcon,
  ListChecks,
  Menu,
  Mic,
  Monitor,
  PanelRightClose,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Upload,
  UserCheck,
  Users,
  Wrench,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  acceptanceLabels,
  permissionMatrix,
  quickCommands,
  roles,
  scenarios
} from "./demoData";
import type { DeviceMode, RoleId, Scenario, ScenarioKind } from "./demoData";

import webDashboard from "../extracted-docx-images/工序助手工序助手web端-1.png";
import responsibilityCard from "../extracted-docx-images/14.png";
import ocrMarked from "../extracted-docx-images/15.png";

type DetailPanel = "confirm" | "ocr" | "drill" | "audit" | null;
type DemoModal = "scenarios" | "role" | null;
type TaskStatus = "识别中" | "等待确认" | "已提交" | "人工处理中" | "已完成";
type QuickIntroId = "guide" | "brief" | "acceptance" | "ocr";
type SupplementStage = "idle" | "prompted" | "completed";
type AppFormMode = "prefilled" | "manual";
type AppFormType = "acceptance" | "inspection";

const kindIcons: Record<ScenarioKind, LucideIcon> = {
  guide: FileSearch,
  acceptance: ClipboardCheck,
  inspection: ClipboardList,
  brief: BarChart3,
  whiteboardOcr: Camera,
  supervisionOcr: FileText,
  history: History,
  permission: ShieldAlert,
  fallback: UserCheck
};

const actionPlan = [
  "解析当前业务上下文",
  "识别意图与槽位",
  "调用白名单业务工具",
  "生成受控 GenUI 卡片",
  "等待用户确认或人工兜底"
];

const quickIntroContent: Record<
  QuickIntroId,
  {
    label: string;
    title: string;
    body: string;
    bullets: string[];
  }
> = {
  guide: {
    label: "操作指南",
    title: "操作指南能帮您做什么",
    body: "我会结合当前页面、用户角色和工序制度，快速说明业务入口、办理顺序和需要补齐的关键字段。",
    bullets: ["适合查询工序报验、检查验收、整改闭环等操作步骤。", "可给出表单入口、材料要求和常见漏填项提醒。"]
  },
  brief: {
    label: "AI简报",
    title: "AI简报能帮您做什么",
    body: "我可以把项目、工区、责任单位和时间范围内的检查、报验、整改数据整理成可汇报口径。",
    bullets: ["支持生成今日概况、风险摘要和待办清单。", "可继续追问到标段、单位工程或责任人维度。"]
  },
  acceptance: {
    label: "工序报验",
    title: "工序报验能帮您做什么",
    body: "我可以辅助生成工序报验草稿，预填项目名称、验收部位、验收工序等核心字段。",
    bullets: ["正式提交前会展示固定确认页，由您复核后再写入原系统。", "适合现场人员快速发起报验或补全草稿。"]
  },
  ocr: {
    label: "工程检查",
    title: "工程检查能帮您做什么",
    body: "我可以根据拍照或上传资料识别工程检查场景，提取白板、检查单、监管资料中的关键字段并形成可确认草稿。",
    bullets: ["会标出低置信度和多候选字段，等待人工确认。", "确认后可进入对应表单或归档到历史追溯。"]
  }
};

const initialAudit = [
  "trace-20260707-001 创建会话，绑定 Web/App 统一上下文",
  "Spring AI 网关完成登录态、项目权限和工具白名单校验"
];

const acceptanceSupplementMessage = "工程进度15%，自检描述：模板安装完成并自检合格，计划验收时间：2026-07-16 09:30，验收人：宋冠先。";
const inspectionSupplementMessage = "存在问题：左幅边坡防护钢筋外露；整改截止日：2026-07-15；已上传现场影像3张。";

function readInitialState() {
  const params = new URLSearchParams(window.location.search);
  const scenario = scenarios.find((item) => item.id === params.get("scenario")) ?? scenarios[0];
  const roleParam = params.get("role") as RoleId | null;
  const role = roleParam && roles.some((item) => item.id === roleParam) ? roleParam : scenario.primaryRole;
  const mode = params.get("mode") === "app" ? "app" : params.get("mode") === "web" ? "web" : scenario.preferredMode;
  return { scenario, role, mode };
}

function App() {
  const initialState = useMemo(readInitialState, []);
  const [activeScenarioId, setActiveScenarioId] = useState(initialState.scenario.id);
  const [activeRoleId, setActiveRoleId] = useState<RoleId>(initialState.role);
  const [mode, setMode] = useState<DeviceMode>(initialState.mode);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [detailPanel, setDetailPanel] = useState<DetailPanel>(null);
  const [demoModal, setDemoModal] = useState<DemoModal>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("等待确认");
  const [auditEvents, setAuditEvents] = useState(initialAudit);
  const [manualReason, setManualReason] = useState("现场复核后确认验收部位与验收工序");
  const [conversationStarted, setConversationStarted] = useState(false);
  const [appFormOpen, setAppFormOpen] = useState(false);
  const [appFormMode, setAppFormMode] = useState<AppFormMode>("prefilled");
  const [appFormType, setAppFormType] = useState<AppFormType>("acceptance");

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0],
    [activeScenarioId]
  );
  const activeRole = roles.find((role) => role.id === activeRoleId) ?? roles[0];
  const canRun = activeScenario.allowedRoles.includes(activeRoleId);
  const switchMode = (nextMode: DeviceMode) => {
    setMode(nextMode);
    setConversationStarted(false);
    setAppFormOpen(false);
    setAppFormMode("prefilled");
    setAppFormType("acceptance");
  };

  const selectScenario = (scenario: Scenario) => {
    setActiveScenarioId(scenario.id);
    setActiveRoleId(scenario.primaryRole);
    setMode(scenario.preferredMode);
    setDrawerOpen(true);
    setDetailPanel(null);
    setConversationStarted(false);
    setAppFormOpen(false);
    setAppFormMode("prefilled");
    setAppFormType("acceptance");
    setTaskStatus("等待确认");
    setAuditEvents([
      `trace-20260707-${scenario.id.slice(-3)} 选择场景：${scenario.title}`,
      `切换为 ${roles.find((role) => role.id === scenario.primaryRole)?.name}，载入 ${scenario.id} 演示上下文`
    ]);
  };

  const pushAudit = (event: string) => {
    setAuditEvents((events) => [`${new Date().toLocaleTimeString("zh-CN", { hour12: false })} ${event}`, ...events].slice(0, 8));
  };

  const openPanel = (panel: DetailPanel, event: string) => {
    setDetailPanel(panel);
    pushAudit(event);
  };

  const openAcceptanceForm = (formMode: AppFormMode, preserveCurrentConversation = false) => {
    if (!preserveCurrentConversation) {
      const acceptanceScenario = scenarios.find((scenario) => scenario.id === "Scene-002") ?? activeScenario;
      setActiveScenarioId(acceptanceScenario.id);
      setActiveRoleId(acceptanceScenario.primaryRole);
    }
    setMode("app");
    setDrawerOpen(false);
    setDetailPanel(null);
    setDemoModal(null);
    setTaskStatus("等待确认");
    setAppFormType("acceptance");
    setAppFormMode(formMode);
    setAppFormOpen(true);
    pushAudit(formMode === "manual" ? "人工填报进入 App 工序报验空白表单" : "进入 App 工序报验表单");
  };
  const enterAcceptanceForm = () => openAcceptanceForm("prefilled");
  const enterManualAcceptanceForm = () => openAcceptanceForm("manual");
  const enterBlankAcceptanceFormFromCurrent = () => openAcceptanceForm("manual", true);
  const openInspectionForm = (formMode: AppFormMode) => {
    const inspectionScenario = scenarios.find((scenario) => scenario.id === "Scene-003") ?? activeScenario;
    setActiveScenarioId(inspectionScenario.id);
    setActiveRoleId(inspectionScenario.primaryRole);
    setMode("app");
    setDrawerOpen(false);
    setDetailPanel(null);
    setDemoModal(null);
    setTaskStatus("等待确认");
    setAppFormType("inspection");
    setAppFormMode(formMode);
    setAppFormOpen(true);
    pushAudit(formMode === "manual" ? "人工填报进入 App 工程检查空白表单" : "进入 App 工程检查表单");
  };
  const enterInspectionForm = () => openInspectionForm("prefilled");
  const enterManualInspectionForm = () => openInspectionForm("manual");
  const closeAppForm = () => {
    setAppFormOpen(false);
    setAppFormMode("prefilled");
    setAppFormType("acceptance");
    pushAudit("从 App 业务表单返回智能填报对话");
  };

  const submitConfirmation = () => {
    setTaskStatus("已提交");
    pushAudit("用户显式确认，业务写入请求交由既有表单服务处理");
  };

  const startManualFallback = () => {
    setTaskStatus("人工处理中");
    pushAudit("进入人工兜底路径，记录 AI 原值、用户修改值与处理原因");
  };

  return (
    <div className={mode === "web" ? "demo-app web-only-demo" : "demo-app app-only-demo"}>
      {mode === "web" ? (
        <WebStage
          scenario={activeScenario}
          roleId={activeRoleId}
          drawerOpen={drawerOpen}
          conversationStarted={conversationStarted}
          canRun={canRun}
          taskStatus={taskStatus}
          onToggleDrawer={() => setDrawerOpen((open) => !open)}
          onStartConversation={() => setConversationStarted(true)}
          onOpenDemoModal={setDemoModal}
          onOpenPanel={openPanel}
          onEnterForm={enterAcceptanceForm}
          onEnterBlankForm={enterBlankAcceptanceFormFromCurrent}
          onManualFill={enterManualAcceptanceForm}
          onEnterInspectionForm={enterInspectionForm}
          onManualInspectionFill={enterManualInspectionForm}
          onSubmit={submitConfirmation}
          onFallback={startManualFallback}
        />
      ) : (
        <main className="app-workspace">
          <AppStage
            scenario={activeScenario}
            roleId={activeRoleId}
            conversationStarted={conversationStarted}
            appFormOpen={appFormOpen}
            appFormMode={appFormMode}
            appFormType={appFormType}
            canRun={canRun}
            taskStatus={taskStatus}
            onStartConversation={() => setConversationStarted(true)}
            onOpenPanel={openPanel}
            onEnterForm={enterAcceptanceForm}
            onEnterBlankForm={enterBlankAcceptanceFormFromCurrent}
            onManualFill={enterManualAcceptanceForm}
            onEnterInspectionForm={enterInspectionForm}
            onManualInspectionFill={enterManualInspectionForm}
            onCloseForm={closeAppForm}
            onSubmit={submitConfirmation}
            onFallback={startManualFallback}
          />
          <div className="app-demo-controls">
            <button onClick={() => setDemoModal("scenarios")}>
              <ListChecks size={16} />
              场景演示
            </button>
            <button onClick={() => setDemoModal("role")}>
              <Users size={16} />
              角色介绍
            </button>
            <button onClick={() => switchMode("web")}>
              <Monitor size={16} />
              Web
            </button>
          </div>
        </main>
      )}

      {detailPanel && (
        <DetailDialog
          panel={detailPanel}
          scenario={activeScenario}
          taskStatus={taskStatus}
          manualReason={manualReason}
          auditEvents={auditEvents}
          onClose={() => setDetailPanel(null)}
          onSubmit={submitConfirmation}
          onFallback={startManualFallback}
          onManualReasonChange={setManualReason}
        />
      )}
      {demoModal && (
        <DemoInfoDialog
          type={demoModal}
          activeScenario={activeScenario}
          activeRole={activeRole}
          activeRoleId={activeRoleId}
          canRun={canRun}
          taskStatus={taskStatus}
          auditEvents={auditEvents}
          onClose={() => setDemoModal(null)}
          onSelectScenario={(scenario) => {
            selectScenario(scenario);
            setDemoModal(null);
          }}
          onSelectRole={(roleId) => {
            setActiveRoleId(roleId);
            pushAudit(`切换角色：${roles.find((role) => role.id === roleId)?.name}`);
          }}
          onOpenAudit={() => {
            setDemoModal(null);
            setDetailPanel("audit");
          }}
          onSwitchMode={switchMode}
        />
      )}
    </div>
  );
}

interface ScenarioRailProps {
  activeScenario: Scenario;
  activeRoleId: RoleId;
  onSelect: (scenario: Scenario) => void;
}

function ScenarioRail({ activeScenario, activeRoleId, onSelect }: ScenarioRailProps) {
  return (
    <aside className="scenario-rail">
      <div className="rail-heading">
        <span>场景演示</span>
        <small>PRD 4.2 / 14.2</small>
      </div>
      <div className="scenario-list">
        {scenarios.map((scenario) => {
          const Icon = kindIcons[scenario.kind];
          const active = scenario.id === activeScenario.id;
          const allowed = scenario.allowedRoles.includes(activeRoleId);
          return (
            <button key={scenario.id} className={active ? "scenario-item active" : "scenario-item"} onClick={() => onSelect(scenario)}>
              <span className={allowed ? "scenario-icon" : "scenario-icon muted"}>
                <Icon size={18} />
              </span>
              <span>
                <strong>{scenario.shortTitle}</strong>
                <small>{scenario.id}</small>
              </span>
              {!allowed && <ShieldAlert size={15} className="item-alert" />}
            </button>
          );
        })}
      </div>
      <div className="quick-box">
        <p>常用指令</p>
        {quickCommands.map((command) => (
          <span key={command}>{command}</span>
        ))}
      </div>
    </aside>
  );
}

interface StageProps {
  scenario: Scenario;
  roleId: RoleId;
  canRun: boolean;
  taskStatus: TaskStatus;
  onOpenPanel: (panel: DetailPanel, event: string) => void;
  onEnterForm: () => void;
  onEnterBlankForm: () => void;
  onManualFill: () => void;
  onEnterInspectionForm: () => void;
  onManualInspectionFill: () => void;
  onSubmit: () => void;
  onFallback: () => void;
}

interface WebStageProps extends StageProps {
  drawerOpen: boolean;
  conversationStarted: boolean;
  onToggleDrawer: () => void;
  onStartConversation: () => void;
  onOpenDemoModal: (modal: DemoModal) => void;
}

interface AppStageProps extends StageProps {
  conversationStarted: boolean;
  appFormOpen?: boolean;
  appFormMode?: AppFormMode;
  appFormType?: AppFormType;
  onStartConversation: () => void;
  onCloseForm?: () => void;
}

function WebStage({
  scenario,
  roleId,
  drawerOpen,
  conversationStarted,
  canRun,
  taskStatus,
  onToggleDrawer,
  onStartConversation,
  onOpenDemoModal,
  onOpenPanel,
  onEnterForm,
  onEnterBlankForm,
  onManualFill,
  onEnterInspectionForm,
  onManualInspectionFill,
  onSubmit,
  onFallback
}: WebStageProps) {
  const background = webDashboard;
  return (
    <div className="web-stage">
      <div className="web-browser">
        <div className="web-canvas">
          <img src={background} alt="既有工序管控系统 Web 截图" />
          <button
            className={drawerOpen ? "ai-top-toggle active" : "ai-top-toggle"}
            onClick={onToggleDrawer}
            title={drawerOpen ? "收起 AI 助手" : "展开 AI 助手"}
            aria-label={drawerOpen ? "收起 AI 助手" : "展开 AI 助手"}
            data-icon={drawerOpen ? "collapse" : "ai"}
          >
            {drawerOpen ? <PanelRightClose size={17} /> : <Bot size={18} />}
          </button>
          <div className="embedded-demo-triggers">
            <button onClick={() => onOpenDemoModal("scenarios")}>
              <ListChecks size={16} />
              场景演示
            </button>
            <button onClick={() => onOpenDemoModal("role")}>
              <Users size={16} />
              角色介绍
            </button>
            <button onClick={() => onOpenPanel("audit", "查看 AI 调用审计")}>
              <History size={16} />
              AI 审计
            </button>
          </div>
          <aside className={drawerOpen ? "assistant-drawer open" : "assistant-drawer"}>
            <AssistantPanel
              device="web"
              scenario={scenario}
              roleId={roleId}
              conversationStarted={conversationStarted}
              canRun={canRun}
              taskStatus={taskStatus}
              onStartConversation={onStartConversation}
              onOpenPanel={onOpenPanel}
              onEnterForm={onEnterForm}
              onEnterBlankForm={onEnterBlankForm}
              onManualFill={onManualFill}
              onEnterInspectionForm={onEnterInspectionForm}
              onManualInspectionFill={onManualInspectionFill}
              onSubmit={onSubmit}
              onFallback={onFallback}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function AppStage({
  scenario,
  roleId,
  conversationStarted,
  appFormOpen = false,
  appFormMode = "prefilled",
  appFormType = "acceptance",
  canRun,
  taskStatus,
  onStartConversation,
  onCloseForm,
  onOpenPanel,
  onEnterForm,
  onEnterBlankForm,
  onManualFill,
  onEnterInspectionForm,
  onManualInspectionFill,
  onSubmit,
  onFallback
}: AppStageProps) {
  const showForm = appFormOpen;
  return (
    <div className="mobile-stage">
      <div className="phone-shell">
        <div className="phone-status">
          <span>12:00</span>
          <span>5G 92%</span>
        </div>
        <div className="phone-header">
          <button
            className="icon-button light"
            title={showForm ? "返回智能填报" : "返回"}
            aria-label={showForm ? "返回智能填报" : "返回"}
            onClick={showForm ? onCloseForm : undefined}
          >
            <ChevronLeft size={19} />
          </button>
          <strong>{showForm ? (appFormType === "inspection" ? "工程检查" : "工序报验") : scenario.kind === "acceptance" ? "智能填报" : "AI助手"}</strong>
          {showForm && appFormType === "acceptance" ? (
            <button className="draft-box-button" title="草稿箱">
              <FileText size={17} />
              草稿箱
            </button>
          ) : showForm ? (
            <span aria-hidden="true" />
          ) : (
            <button className="icon-button light" title="新建">
              <Plus size={18} />
            </button>
          )}
        </div>
        {showForm &&
          (appFormType === "inspection" ? (
            <MobileInspectionForm mode={appFormMode} onSubmit={onSubmit} />
          ) : (
            <MobileAcceptanceForm mode={appFormMode} onSubmit={onSubmit} />
          ))}
        <div className={showForm ? "mobile-ai-cache" : "mobile-ai-live"} aria-hidden={showForm}>
            <MobileAssistant
              scenario={scenario}
              roleId={roleId}
              conversationStarted={conversationStarted}
              canRun={canRun}
              taskStatus={taskStatus}
              onStartConversation={onStartConversation}
              onOpenPanel={onOpenPanel}
              onEnterForm={onEnterForm}
              onEnterBlankForm={onEnterBlankForm}
              onManualFill={onManualFill}
              onEnterInspectionForm={onEnterInspectionForm}
              onManualInspectionFill={onManualInspectionFill}
              onSubmit={onSubmit}
              onFallback={onFallback}
            />
          {!showForm && (
              <nav className="mobile-tabs">
                <span>
                  <Home size={21} />
                  首页
                </span>
                <span>
                  <ClipboardList size={21} />
                  待办
                </span>
                <span className="active">
                  <Camera size={22} />
                  AI
                </span>
                <span>
                  <BarChart3 size={21} />
                  报表
                </span>
                <span>
                  <Users size={21} />
                  我的
                </span>
              </nav>
            )}
        </div>
      </div>
    </div>
  );
}

function MobileAcceptanceForm({ mode, onSubmit }: { mode: AppFormMode; onSubmit: () => void }) {
  const manual = mode === "manual";
  return (
    <div className="mobile-acceptance-form">
      <div className="mobile-form-scroll">
        <FormLine label="项目名称" value="测试一分部" required />
        <div className="acceptance-process-head">
          <strong>1.验收工序</strong>
          <span>⌃</span>
        </div>
        <FormLine label="单位工程" value={manual ? "请选择单位工程" : "ZK13+276拉秀3号大桥左幅/1#基础"} required muted={manual} />
        <div className="mobile-form-block">
          <span>
            <b>*</b>
            验收部位
          </span>
          <strong className={manual ? "muted-value" : undefined}>
            {manual ? "请选择验收部位" : "ZK13+276拉秀3号大桥左幅/1#基础及下部构造/1#墩盖梁"}
          </strong>
          <p>{manual ? "待人工填选" : "验收部位补充"}</p>
        </div>
        <FormLine label="验收工序" value={manual ? "请选择验收工序" : "模板安装"} required muted={manual} noArrow />
        <div className="progress-form-row">
          <span>
            <b>*</b>
            工程进度
            <i>?</i>
          </span>
          <strong className={manual ? "muted-value" : undefined}>{manual ? "" : "15"}</strong>
          <em>%</em>
          <p>{manual ? "待人工填写工程进度" : "完成整个工序施工"}</p>
        </div>
        <button className="unit-project-button">
          <Plus size={18} />
          重新选择
        </button>
        <FormLine label="验收依据" value="请选择验收依据" muted />
        <FormTextArea label="自检描述" placeholder={manual ? "请输入自检描述" : "模板安装完成并自检合格"} required muted={manual} />
        <FormLine label="劳务供应商" value="请选择劳务供应商" muted />
        <div className="mobile-form-section">
          <div className="form-section-label">
            <b>*</b>
            <span>现场影像:</span>
          </div>
          <div className="site-image-row">
            {!manual && (
              <div className="site-image-thumb">
                <img src={ocrMarked} alt="已上传现场影像" />
                <button aria-label="删除现场影像">×</button>
              </div>
            )}
            <button className="site-image-picker" aria-label="上传现场影像">
              <Camera size={26} />
            </button>
            <button className="refresh-location">重新获取</button>
          </div>
          {!manual && (
            <div className="location-line">
              <span className="location-dot" aria-hidden="true" />
              <strong>南宁市兴宁区甘泉路22号</strong>
            </div>
          )}
        </div>
        <div className="planned-time-row">
          <span>
          <b>*</b>
          计划验收时间:
        </span>
        <button aria-label="选择计划验收时间">
          <CalendarDays size={17} />
          {manual ? "请选择计划验收时间" : "2026-07-16 09:30"}
        </button>
        </div>
        <div className="person-picker-row">
          <span>
            <b>*</b>
          验收人:
        </span>
          <button aria-label="选择验收人">{manual ? "+" : "宋冠先"}</button>
        </div>
        <div className="person-picker-row">
          <span>抄送人:</span>
          <button aria-label="选择抄送人">+</button>
        </div>
        <div className="sms-toggle-row">
          <span>短信通知相对应的负责人</span>
          <div>
            <button>是</button>
            <button className="active">否</button>
          </div>
        </div>
      </div>
      <div className="mobile-form-actions">
        <button>复制上次数据</button>
        <button>本地保存</button>
        <button className="primary-button" onClick={onSubmit}>
          提交
        </button>
      </div>
    </div>
  );
}

function MobileInspectionForm({ mode, onSubmit }: { mode: AppFormMode; onSubmit: () => void }) {
  const manual = mode === "manual";
  return (
    <div className="mobile-acceptance-form mobile-inspection-form">
      <div className="mobile-form-scroll">
        <FormLine label="检查类型" value={manual ? "请选择检查类型" : "工程质量检查"} required muted={manual} />
        <FormLine label="项目名称" value="测试一分部" required />
        <FormLine label="工程名称" value={manual ? "请选择工程名称" : "K0+000~K16+500 路基工程"} required muted={manual} />
        <div className="inspection-part-row">
          <span>
            <b>*</b>
            工程部位:
          </span>
          <p className={manual ? "muted-value" : undefined}>{manual ? "工程部位补充" : "K12+300 左幅边坡防护"}</p>
        </div>
        <div className="inspection-result-form-row">
          <span>
            <b>*</b>
            检查结果:
          </span>
          <div>
            <button aria-pressed="false">
              合规
            </button>
            <button className="active" aria-pressed="true">
              异常
            </button>
          </div>
        </div>
        <InspectionTextBlock label="存在问题描述" value={manual ? "请输入存在问题描述" : "左幅边坡防护钢筋外露"} action="清空" muted={manual} />
        <InspectionTextBlock label="整改要求" value={manual ? "请输入整改要求" : "请按设计保护层厚度补强并复核钢筋外露点位"} action="清空" muted={manual} />
        <FormLine label="整改期限" value={manual ? "请选择整改期限" : "2026-07-15"} required muted={manual} />
        <div className="mobile-form-section inspection-image-section">
          <div className="form-section-label">
            <b>*</b>
            <span>现场影像:</span>
          </div>
          <div className="site-image-row">
            {!manual && (
              <div className="site-image-thumb">
                <img src={ocrMarked} alt="已上传工程检查现场影像" />
                <button aria-label="删除工程检查现场影像">×</button>
              </div>
            )}
            <button className="site-image-picker" aria-label="上传工程检查现场影像">
              <Camera size={26} />
            </button>
            <button className="refresh-location">重新获取</button>
          </div>
          <div className="location-line">
            <span className="location-dot" aria-hidden="true" />
            <strong>南宁市兴宁区甘泉路22号</strong>
          </div>
        </div>
        <div className="sms-toggle-row">
          <span>短信通知相对应的责任人:</span>
          <div>
            <button>是</button>
            <button>否</button>
          </div>
        </div>
        <div className="person-picker-row">
          <span>
            <b>*</b>
            整改责任人:
          </span>
          <button aria-label="选择整改责任人">{manual ? "+" : "宋冠先"}</button>
        </div>
        <div className="person-picker-row">
          <span>抄送人:</span>
          <button aria-label="选择工程检查抄送人">+</button>
        </div>
      </div>
      <div className="mobile-form-actions inspection-form-actions">
        <button className="primary-button" onClick={onSubmit}>
          提交保存
        </button>
        <button>全部清空</button>
        <button>更多</button>
      </div>
    </div>
  );
}

function InspectionTextBlock({
  label,
  value,
  action,
  muted
}: {
  label: string;
  value: string;
  action: string;
  muted?: boolean;
}) {
  return (
    <div className="inspection-text-block">
      <div>
        <span>{label}:</span>
        <button>{action}</button>
      </div>
      <p className={muted ? "muted-value" : undefined}>{value}</p>
    </div>
  );
}

function FormLine({
  label,
  value,
  required,
  muted,
  noArrow
}: {
  label: string;
  value: string;
  required?: boolean;
  muted?: boolean;
  noArrow?: boolean;
}) {
  return (
    <div className="mobile-form-line">
      <span>
        {required && <b>*</b>}
        {label}:
      </span>
      <strong className={muted ? "muted-value" : undefined}>{value}</strong>
      {noArrow ? <i /> : <ChevronRight size={17} />}
    </div>
  );
}

function FormTextArea({
  label,
  placeholder,
  required,
  muted
}: {
  label: string;
  placeholder: string;
  required?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="mobile-form-textarea">
      <span>
        {required && <b>*</b>}
        {label}:
      </span>
      <p className={muted ? "muted-value" : undefined}>{placeholder}</p>
    </div>
  );
}

interface AssistantPanelProps extends StageProps {
  device: DeviceMode;
  conversationStarted: boolean;
  onStartConversation: () => void;
}

function AssistantPanel({
  device,
  scenario,
  roleId,
  conversationStarted,
  canRun,
  taskStatus,
  onStartConversation,
  onOpenPanel,
  onEnterForm,
  onEnterBlankForm,
  onManualFill,
  onEnterInspectionForm,
  onManualInspectionFill,
  onSubmit,
  onFallback
}: AssistantPanelProps) {
  const role = roles.find((item) => item.id === roleId) ?? roles[0];
  const [quickIntroHistory, setQuickIntroHistory] = useState<Array<{ id: string; introId: QuickIntroId }>>([]);
  const [supplementStage, setSupplementStage] = useState<SupplementStage>("idle");
  const [inputText, setInputText] = useState(scenario.trigger);
  const [procedureFollowup, setProcedureFollowup] = useState<string | null>(null);
  const defaultInputValue =
    scenario.kind === "acceptance" && supplementStage === "prompted"
      ? acceptanceSupplementMessage
      : scenario.kind === "inspection" && supplementStage === "prompted"
        ? inspectionSupplementMessage
        : scenario.trigger;
  useEffect(() => {
    setInputText(defaultInputValue);
    setProcedureFollowup(null);
  }, [defaultInputValue, scenario.id]);
  const showQuickIntro = (introId: QuickIntroId) => {
    setQuickIntroHistory((history) => [...history, { id: `${introId}-${Date.now()}-${history.length}`, introId }]);
  };
  const requestAcceptanceSupplement = () => {
    setSupplementStage("prompted");
  };
  const requestInspectionSupplement = () => {
    setSupplementStage("prompted");
  };
  const handleSend = () => {
    const text = inputText.trim();
    setQuickIntroHistory([]);
    if (scenario.kind === "acceptance" && text === "盖梁浇筑") {
      setProcedureFollowup(text);
      setSupplementStage("idle");
      setInputText("");
      onStartConversation();
      return;
    }
    if ((scenario.kind === "acceptance" || scenario.kind === "inspection") && supplementStage === "prompted") {
      setSupplementStage("completed");
      onStartConversation();
      return;
    }
    if (scenario.kind !== "acceptance" && scenario.kind !== "inspection") {
      setSupplementStage("idle");
    }
    onStartConversation();
  };

  return (
    <div className="assistant-panel">
      <div className="assistant-header">
        <div className="assistant-identity">
          <span className="assistant-title">
            <span className="assistant-mark">
              <Bot size={17} />
            </span>
            <span>工序助手</span>
          </span>
        </div>
        <div className="assistant-tools">
          <button title="新建会话" onClick={() => onOpenPanel("audit", "新建会话并保留历史审计")}>
            <Plus size={16} />
          </button>
          <button title="历史会话" onClick={() => onOpenPanel("audit", "打开历史会话与任务追溯")}>
            <History size={16} />
          </button>
        </div>
      </div>

      <div className="conversation">
        <div className="opening-message">
          <span className="agent-avatar">
            <Bot size={18} />
          </span>
          <div className="opening-copy">
            <strong>您好，我是工序AI助手</strong>
            <p>
              我已接入当前项目、角色权限与工序业务上下文，可协助您开展工序报验、检查验收、智能问数、工程检查和历史追溯。
            </p>
            <p>
              涉及提交、整改、验收等写入动作时，我会先生成可核对内容，等待您确认后再进入原系统流程。
            </p>
          </div>
        </div>
        {conversationStarted && (
          <>
            <ScenarioUserMessage scenario={scenario} />
            <div className="agent-row">
              <div className="agent-avatar">
                <Bot size={18} />
              </div>
              <div className="agent-message">
                <p className="intent-line">
                  <span>{scenario.id}</span>
                  <strong>{scenario.title}</strong>
                  <em>{taskStatus}</em>
                </p>
                {canRun ? (
                  <ScenarioResult
                    scenario={scenario}
                    device={device}
                    taskStatus={taskStatus}
                    onOpenPanel={onOpenPanel}
                    onEnterForm={onEnterForm}
                    onEnterBlankForm={onEnterBlankForm}
                    onManualFill={onManualFill}
                    onEnterInspectionForm={onEnterInspectionForm}
                    onManualInspectionFill={onManualInspectionFill}
                    onSubmit={onSubmit}
                    onFallback={onFallback}
                    onRequestAcceptanceSupplement={requestAcceptanceSupplement}
                    onRequestInspectionSupplement={requestInspectionSupplement}
                  />
                ) : (
                  <PermissionCard scenario={scenario} roleName={role.name} />
                )}
              </div>
            </div>
          </>
        )}
        {scenario.kind === "acceptance" && procedureFollowup && (
          <>
            <div className="bubble user">{procedureFollowup}</div>
            <div className="agent-row">
              <div className="agent-avatar">
                <Bot size={18} />
              </div>
              <div className="agent-message">
                <p className="intent-line">
                  <span>{scenario.id}</span>
                  <strong>追问更新验收工序</strong>
                  <em>等待确认</em>
                </p>
                <AcceptanceCard
                  key={procedureFollowup}
                  taskStatus="等待确认"
                  onFallback={onFallback}
                  onManualFill={onManualFill}
                  onRequestSupplement={requestAcceptanceSupplement}
                  procedureOverride={procedureFollowup}
                />
              </div>
            </div>
          </>
        )}
        {scenario.kind === "acceptance" && supplementStage !== "idle" && (
          <div className="agent-row">
            <div className="agent-avatar">
              <Bot size={18} />
            </div>
            <div className="agent-message">
              <div className="followup-prompt">
                请你提供工程进度、自检描述、计划验收时间、验收人
              </div>
            </div>
          </div>
        )}
        {scenario.kind === "acceptance" && supplementStage === "completed" && (
          <>
            <div className="bubble user">{acceptanceSupplementMessage}</div>
            <div className="agent-row">
              <div className="agent-avatar">
                <Bot size={18} />
              </div>
              <div className="agent-message">
                <AcceptanceSupplementCard onSubmit={onEnterForm} onFallback={onManualFill} />
              </div>
            </div>
          </>
        )}
        {scenario.kind === "inspection" && supplementStage !== "idle" && (
          <div className="agent-row">
            <div className="agent-avatar">
              <Bot size={18} />
            </div>
            <div className="agent-message">
              <div className="followup-prompt">请描述存在问题、整改截止日，并上传现场影像</div>
            </div>
          </div>
        )}
        {scenario.kind === "inspection" && supplementStage === "completed" && (
          <>
            <div className="bubble user">{inspectionSupplementMessage}</div>
            <div className="agent-row">
              <div className="agent-avatar">
                <Bot size={18} />
              </div>
              <div className="agent-message">
                <InspectionSupplementCard onSubmit={onEnterInspectionForm} onFallback={onManualInspectionFill} />
              </div>
            </div>
          </>
        )}
        {quickIntroHistory.map((item) => {
          const intro = quickIntroContent[item.introId];
          return (
            <Fragment key={item.id}>
              <div className="bubble user quick-intro-trigger">{intro.label}</div>
              <div className="agent-row">
                <div className="agent-avatar">
                  <Bot size={18} />
                </div>
                <div className="agent-message">
                  <QuickIntroCard intro={intro} />
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className="assistant-quick-actions">
        <button onClick={() => showQuickIntro("guide")}>操作指南</button>
        <button onClick={() => showQuickIntro("brief")}>AI简报</button>
        <button onClick={() => showQuickIntro("acceptance")}>工序报验</button>
        <button onClick={() => showQuickIntro("ocr")}>工程检查</button>
      </div>

      <div className="assistant-input">
        <button title="语音转写" aria-label="语音转写">
          <Mic size={18} />
        </button>
        <input value={inputText} onChange={(event) => setInputText(event.target.value)} aria-label="演示输入" />
        <button title="拍照或图片上传" aria-label="拍照或图片上传" onClick={() => onOpenPanel("ocr", "创建拍照或图片上传识别任务")}>
          <Camera size={18} />
        </button>
        <button title="上传附件" aria-label="上传附件">
          <Upload size={18} />
        </button>
        <button className="send" title="发送" aria-label="发送" onClick={handleSend}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function MobileAssistant(props: AppStageProps) {
  return (
    <div className="mobile-ai-page">
      <AssistantPanel {...props} device="app" />
    </div>
  );
}

function ScenarioUserMessage({ scenario }: { scenario: Scenario }) {
  if (scenario.kind !== "whiteboardOcr") {
    return <div className="bubble user">{scenario.trigger}</div>;
  }

  return (
    <div className="user-message-stack">
      <div className="bubble user">{scenario.trigger}</div>
      <div className="upload-preview" aria-label="白板图片加载示意">
        <img src={ocrMarked} alt="白板照片加载示意" />
        <div>
          <strong>白板照片.jpg</strong>
          <span>图片已加载 · 正在识别业务类型</span>
          <i aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function QuickIntroCard({
  intro
}: {
  intro: (typeof quickIntroContent)[QuickIntroId];
}) {
  return (
    <div className="quick-intro-card">
      <h3>{intro.title}</h3>
      <p>{intro.body}</p>
      <ul>
        {intro.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ScenarioResult({
  scenario,
  device,
  taskStatus,
  onOpenPanel,
  onEnterForm,
  onEnterBlankForm,
  onManualFill,
  onEnterInspectionForm,
  onManualInspectionFill,
  onSubmit,
  onFallback,
  onRequestAcceptanceSupplement,
  onRequestInspectionSupplement
}: {
  scenario: Scenario;
  device: DeviceMode;
  taskStatus: TaskStatus;
  onOpenPanel: (panel: DetailPanel, event: string) => void;
  onEnterForm: () => void;
  onEnterBlankForm: () => void;
  onManualFill: () => void;
  onEnterInspectionForm: () => void;
  onManualInspectionFill: () => void;
  onSubmit: () => void;
  onFallback: () => void;
  onRequestAcceptanceSupplement?: () => void;
  onRequestInspectionSupplement?: () => void;
}) {
  switch (scenario.kind) {
    case "guide":
      return <GuideCard onOpenPanel={onOpenPanel} onEnterForm={onEnterBlankForm} />;
    case "acceptance":
      return (
        <AcceptanceCard
          taskStatus={taskStatus}
          onFallback={onFallback}
          onManualFill={onManualFill}
          onRequestSupplement={onRequestAcceptanceSupplement ?? onSubmit}
        />
      );
    case "inspection":
      return (
        <InspectionCard
          taskStatus={taskStatus}
          onSubmit={onSubmit}
          onFallback={onFallback}
          onManualFill={onManualInspectionFill}
          onRequestSupplement={onRequestInspectionSupplement ?? onSubmit}
        />
      );
    case "brief":
      return <BriefCard onOpenPanel={onOpenPanel} />;
    case "whiteboardOcr":
      return <WhiteboardBusinessCard taskStatus={taskStatus} onSubmit={onSubmit} onFallback={onFallback} />;
    case "supervisionOcr":
      return (
        <OcrCard
          title="重点监管资料工程检查"
          device={device}
          onOpenPanel={onOpenPanel}
          onSubmit={onSubmit}
          onFallback={onFallback}
        />
      );
    case "history":
      return <HistoryCard onOpenPanel={onOpenPanel} />;
    case "permission":
      return <PermissionCard scenario={scenario} roleName="当前角色" />;
    case "fallback":
      return <FallbackCard onOpenPanel={onOpenPanel} onFallback={onFallback} />;
    default:
      return null;
  }
}

function GuideCard({
  onOpenPanel,
  onEnterForm
}: {
  onOpenPanel: (panel: DetailPanel, event: string) => void;
  onEnterForm: () => void;
}) {
  return (
    <div className="result-card">
      <h3>工序报验操作指南</h3>
      <ol className="step-list">
        <li>进入工序报验模块，选择项目与单位工程。</li>
        <li>补齐桩号、工程部位、自检描述和现场影像。</li>
        <li>保存草稿后由当前登录用户确认提交。</li>
      </ol>
      <div className="source-row">
        <FileSearch size={16} />
        来源：工序报验操作手册 v2026.02 · Web/App 适用 · 置信度 92%
      </div>
      <div className="card-actions">
        <button onClick={() => onOpenPanel("audit", "查看 RAG 来源与指南版本")}>查看来源</button>
        <button className="primary-button" onClick={onEnterForm}>
          进入表单
        </button>
      </div>
    </div>
  );
}

type AcceptanceDraft = {
  projectName: string;
  acceptancePart: string;
  acceptanceProcedure: string;
};

type AcceptanceCandidate = AcceptanceDraft & {
  id: string;
  score: number;
};

type BusinessCardSource = "natural" | "whiteboard";

const acceptanceCandidates: AcceptanceCandidate[] = [
  {
    id: "candidate-1",
    score: 96,
    projectName: "测试一分部",
    acceptancePart: "ZK13+276拉秀3号大桥左幅/1#基础及下部构造/1#墩盖梁",
    acceptanceProcedure: "模板安装"
  },
  {
    id: "candidate-2",
    score: 91,
    projectName: "测试一分部",
    acceptancePart: "ZK13+276拉秀3号大桥左幅/1#基础及下部构造/1#承台",
    acceptanceProcedure: "钢筋安装"
  },
  {
    id: "candidate-3",
    score: 87,
    projectName: "测试一分部",
    acceptancePart: "ZK13+276拉秀3号大桥左幅/2#基础及下部构造/2#墩柱",
    acceptanceProcedure: "模板拆除"
  }
];

type WhiteboardBoardType = "acceptance" | "inspection";

function WhiteboardBusinessCard({
  taskStatus,
  onSubmit,
  onFallback
}: {
  taskStatus: TaskStatus;
  onSubmit: () => void;
  onFallback: () => void;
}) {
  const [boardType, setBoardType] = useState<WhiteboardBoardType>("acceptance");
  const isAcceptanceBoard = boardType === "acceptance";

  return (
    <div className="whiteboard-result">
      <div className="whiteboard-classifier">
        <div className="whiteboard-classifier-copy">
          <CheckCircle2 size={16} />
          <div>
            <strong>已识别为{isAcceptanceBoard ? "工序报验白板" : "工程检查白板"}</strong>
            <span>白板照片 WB-20260707-016 · 类型置信度 {isAcceptanceBoard ? "93%" : "90%"}</span>
          </div>
        </div>
        <div className="whiteboard-type-switch" role="group" aria-label="白板业务类型">
          <button
            className={isAcceptanceBoard ? "active" : undefined}
            onClick={() => setBoardType("acceptance")}
            aria-pressed={isAcceptanceBoard}
          >
            工序报验白板
          </button>
          <button
            className={!isAcceptanceBoard ? "active" : undefined}
            onClick={() => setBoardType("inspection")}
            aria-pressed={!isAcceptanceBoard}
          >
            工程检查白板
          </button>
        </div>
      </div>
      {isAcceptanceBoard ? (
        <AcceptanceCard
          source="whiteboard"
          taskStatus={taskStatus}
          onFallback={onFallback}
          onRequestSupplement={onSubmit}
        />
      ) : (
        <InspectionCard source="whiteboard" taskStatus={taskStatus} onSubmit={onSubmit} onFallback={onFallback} />
      )}
    </div>
  );
}

function AcceptanceCard({
  taskStatus,
  onFallback,
  onManualFill,
  onRequestSupplement,
  source = "natural",
  procedureOverride
}: {
  taskStatus: TaskStatus;
  onFallback: () => void;
  onManualFill?: () => void;
  onRequestSupplement: () => void;
  source?: BusinessCardSource;
  procedureOverride?: string;
}) {
  const initialCandidates = useMemo(
    () =>
      procedureOverride
        ? acceptanceCandidates.map((candidate) => ({
            ...candidate,
            acceptanceProcedure: procedureOverride
          }))
        : acceptanceCandidates,
    [procedureOverride]
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState(initialCandidates[0].id);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [candidates, setCandidates] = useState<AcceptanceCandidate[]>(initialCandidates);
  useEffect(() => {
    setSelectedCandidateId(initialCandidates[0].id);
    setEditingCandidateId(null);
    setShowAllCandidates(false);
    setCandidates(initialCandidates);
  }, [initialCandidates]);
  const updateCandidate = (candidateId: string, field: keyof AcceptanceDraft, value: string) => {
    setCandidates((current) =>
      current.map((candidate) => (candidate.id === candidateId ? { ...candidate, [field]: value } : candidate))
    );
  };

  return (
    <div className="result-card acceptance-card compact">
      <div className="acceptance-card-head">
        <h3>请确认验收部位</h3>
        <span>{taskStatus} · 3 个候选</span>
      </div>
      <p className="candidate-tip">
        {source === "whiteboard"
          ? "已按白板识别结果与 App 表单信息匹配最接近的验收工序，请选择后确认提交。"
          : "已按自然语言与 App 表单信息匹配最接近的验收工序，请选择后确认提交。"}
      </p>
      <div className="candidate-list">
        {candidates.map((candidate, index) => {
          const collapsed = !showAllCandidates && index > 0;
          const selected = candidate.id === selectedCandidateId;
          const isEditing = candidate.id === editingCandidateId;
          if (collapsed) {
            return (
              <button
                className="candidate-summary"
                key={candidate.id}
                onClick={() => {
                  setSelectedCandidateId(candidate.id);
                  setShowAllCandidates(true);
                }}
                aria-label={`展开候选${index + 1}`}
              >
                <strong>候选 {index + 1}</strong>
                <span>{candidate.acceptanceProcedure}</span>
                <em>匹配 {candidate.score}%</em>
              </button>
            );
          }
          return (
            <div className={selected ? "candidate-card selected" : "candidate-card"} key={candidate.id}>
              <button
                className="candidate-card-head"
                onClick={() => setSelectedCandidateId(candidate.id)}
                aria-label={`选择候选${index + 1}`}
              >
                <strong>候选 {index + 1}</strong>
                <span>匹配 {candidate.score}%</span>
              </button>
              <AcceptanceDraftFields
                draft={candidate}
                isEditing={isEditing}
                onChange={(field, value) => updateCandidate(candidate.id, field, value)}
              />
              <div className="candidate-actions">
                <button
                  onClick={() => {
                    setSelectedCandidateId(candidate.id);
                    setEditingCandidateId(candidate.id);
                  }}
                >
                  手动修改
                </button>
                <button onClick={onManualFill ?? onFallback}>人工填报</button>
                <button
                  className="primary-button"
                  onClick={() => {
                    setSelectedCandidateId(candidate.id);
                    onRequestSupplement();
                  }}
                >
                  确认提交
                </button>
              </div>
            </div>
          );
        })}
        <button className="candidate-expand-button" onClick={() => setShowAllCandidates((current) => !current)}>
          {showAllCandidates ? "收起候选2和3" : "展开全部候选"}
        </button>
      </div>
    </div>
  );
}

function AcceptanceDraftFields({
  draft,
  isEditing,
  onChange
}: {
  draft: AcceptanceDraft;
  isEditing: boolean;
  onChange: (field: keyof AcceptanceDraft, value: string) => void;
}) {
  const fields: Array<{
    label: string;
    key: keyof AcceptanceDraft;
    multiline?: boolean;
  }> = [
    { label: "项目名称", key: "projectName" },
    { label: "验收部位", key: "acceptancePart", multiline: true },
    { label: "验收工序", key: "acceptanceProcedure" }
  ];

  return (
    <div className={isEditing ? "field-grid no-source editable-fields" : "field-grid no-source"}>
      {fields.map((field) => (
        <div className="field-row" key={field.key}>
          <span>{field.label}</span>
          {isEditing ? (
            field.multiline ? (
              <textarea
                aria-label={field.label}
                value={draft[field.key]}
                rows={2}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            ) : (
              <input
                aria-label={field.label}
                value={draft[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            )
          ) : (
            <strong>{draft[field.key]}</strong>
          )}
        </div>
      ))}
    </div>
  );
}

type AcceptanceSupplement = {
  progress: string;
  selfCheck: string;
  plannedAcceptanceTime: string;
  acceptancePerson: string;
};

function AcceptanceSupplementCard({ onSubmit, onFallback }: { onSubmit: () => void; onFallback: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [supplement, setSupplement] = useState<AcceptanceSupplement>({
    progress: "15%",
    selfCheck: "模板安装完成并自检合格",
    plannedAcceptanceTime: "2026-07-16 09:30",
    acceptancePerson: "宋冠先"
  });
  const updateSupplement = (field: keyof AcceptanceSupplement, value: string) => {
    setSupplement((current) => ({ ...current, [field]: value }));
  };
  const fields: Array<{ label: string; key: keyof AcceptanceSupplement; multiline?: boolean }> = [
    { label: "工程进度", key: "progress" },
    { label: "自检描述", key: "selfCheck", multiline: true },
    { label: "计划验收时间", key: "plannedAcceptanceTime" },
    { label: "验收人", key: "acceptancePerson" }
  ];

  return (
    <div className="result-card supplement-card compact">
      <div className="acceptance-card-head">
        <h3>补充信息确认</h3>
        <span>待确认</span>
      </div>
      <p className="candidate-tip">已补齐工程进度、自检描述、计划验收时间和验收人，正式提交前仍需人工确认。</p>
      <div className={isEditing ? "field-grid no-source editable-fields" : "field-grid no-source"}>
        {fields.map((field) => (
          <div className="field-row" key={field.key}>
            <span>{field.label}</span>
            {isEditing ? (
              field.multiline ? (
                <textarea
                  aria-label={field.label}
                  value={supplement[field.key]}
                  rows={2}
                  onChange={(event) => updateSupplement(field.key, event.target.value)}
                />
              ) : (
                <input
                  aria-label={field.label}
                  value={supplement[field.key]}
                  onChange={(event) => updateSupplement(field.key, event.target.value)}
                />
              )
            ) : (
              <strong>{supplement[field.key]}</strong>
            )}
          </div>
        ))}
      </div>
      <div className="candidate-actions">
        <button onClick={() => setIsEditing(true)}>手动修改</button>
        <button onClick={onFallback}>人工填报</button>
        <button className="primary-button" onClick={onSubmit}>确认提交</button>
      </div>
    </div>
  );
}

type InspectionSupplement = {
  issueDescription: string;
  rectificationDeadline: string;
  siteImages: string;
};

function InspectionSupplementCard({ onSubmit, onFallback }: { onSubmit: () => void; onFallback: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [supplement, setSupplement] = useState<InspectionSupplement>({
    issueDescription: "左幅边坡防护钢筋外露",
    rectificationDeadline: "2026-07-15",
    siteImages: "已上传现场影像3张"
  });
  const updateSupplement = (field: keyof InspectionSupplement, value: string) => {
    setSupplement((current) => ({ ...current, [field]: value }));
  };
  const fields: Array<{ label: string; key: keyof InspectionSupplement; multiline?: boolean }> = [
    { label: "存在问题", key: "issueDescription", multiline: true },
    { label: "整改截止日", key: "rectificationDeadline" }
  ];

  return (
    <div className="result-card supplement-card inspection-supplement-card compact">
      <div className="acceptance-card-head">
        <h3>问题信息确认</h3>
        <span>待确认</span>
      </div>
      <p className="candidate-tip">已补齐存在问题、整改截止日和现场影像，正式提交前仍需人工确认。</p>
      <div className={isEditing ? "field-grid no-source editable-fields" : "field-grid no-source"}>
        {fields.map((field) => (
          <div className="field-row" key={field.key}>
            <span>{field.label}</span>
            {isEditing ? (
              field.multiline ? (
                <textarea
                  aria-label={field.label}
                  value={supplement[field.key]}
                  rows={2}
                  onChange={(event) => updateSupplement(field.key, event.target.value)}
                />
              ) : (
                <input
                  aria-label={field.label}
                  value={supplement[field.key]}
                  onChange={(event) => updateSupplement(field.key, event.target.value)}
                />
              )
            ) : (
              <strong>{supplement[field.key]}</strong>
            )}
          </div>
        ))}
        <div className="field-row image-field-row">
          <span>现场影像</span>
          {isEditing ? (
            <input
              aria-label="现场影像"
              value={supplement.siteImages}
              onChange={(event) => updateSupplement("siteImages", event.target.value)}
            />
          ) : (
            <div className="image-field-value">
              <strong>{supplement.siteImages}</strong>
              <div className="image-thumbs" aria-label={supplement.siteImages}>
                {[1, 2, 3].map((index) => (
                  <div className="image-thumb" key={index} role="img" aria-label={`现场影像占位${index}`}>
                    <ImageIcon size={16} />
                    <small>{index}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="candidate-actions">
        <button onClick={() => setIsEditing(true)}>手动修改</button>
        <button onClick={onFallback}>人工填报</button>
        <button className="primary-button" onClick={onSubmit}>确认提交</button>
      </div>
    </div>
  );
}

type InspectionDraft = {
  inspectionType: string;
  projectName: string;
  engineeringName: string;
  engineeringPart: string;
  inspectionResult: "合规" | "不合规";
};

type InspectionCandidate = InspectionDraft & {
  id: string;
  score: number;
};

const inspectionCandidates: InspectionCandidate[] = [
  {
    id: "inspection-1",
    score: 94,
    inspectionType: "工程质量检查",
    projectName: "融罗高速二分部",
    engineeringName: "K0+000~K16+500 路基工程",
    engineeringPart: "K12+300 左幅边坡防护",
    inspectionResult: "合规"
  },
  {
    id: "inspection-2",
    score: 89,
    inspectionType: "重点监管检查",
    projectName: "融罗高速二分部",
    engineeringName: "K0+000~K16+500 路基工程",
    engineeringPart: "K12+300 左幅边坡防护钢筋外露点位",
    inspectionResult: "不合规"
  },
  {
    id: "inspection-3",
    score: 84,
    inspectionType: "日常巡检",
    projectName: "融罗高速二分部",
    engineeringName: "K0+000~K16+500 路基工程",
    engineeringPart: "K12+280~K12+320 左幅边坡防护",
    inspectionResult: "合规"
  }
];

function InspectionCard({
  taskStatus,
  onSubmit,
  onFallback,
  onManualFill,
  onRequestSupplement,
  source = "natural"
}: {
  taskStatus: TaskStatus;
  onSubmit: () => void;
  onFallback: () => void;
  onManualFill?: () => void;
  onRequestSupplement?: () => void;
  source?: BusinessCardSource;
}) {
  const [selectedCandidateId, setSelectedCandidateId] = useState(inspectionCandidates[0].id);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [candidates, setCandidates] = useState<InspectionCandidate[]>(inspectionCandidates);
  const updateCandidate = (candidateId: string, field: keyof InspectionDraft, value: string) => {
    setCandidates((current) =>
      current.map((candidate) => (candidate.id === candidateId ? { ...candidate, [field]: value } : candidate))
    );
  };

  return (
    <div className="result-card acceptance-card compact">
      <div className="acceptance-card-head">
        <h3>请确认检查部位</h3>
        <span>{taskStatus} · 3 个候选</span>
      </div>
      <p className="candidate-tip">
        {source === "whiteboard"
          ? "已按白板识别结果和当前工程上下文生成检查记录候选草稿，请选择后确认提交。"
          : "已按语音转写和当前工程上下文生成检查记录候选草稿，请选择后确认提交。"}
      </p>
      <div className="candidate-list">
        {candidates.map((candidate, index) => {
          const collapsed = !showAllCandidates && index > 0;
          const selected = candidate.id === selectedCandidateId;
          const isEditing = candidate.id === editingCandidateId;
          if (collapsed) {
            return (
              <button
                className="candidate-summary"
                key={candidate.id}
                onClick={() => {
                  setSelectedCandidateId(candidate.id);
                  setShowAllCandidates(true);
                }}
                aria-label={`展开检查候选${index + 1}`}
              >
                <strong>候选 {index + 1}</strong>
                <span>{candidate.engineeringPart}</span>
                <em>匹配 {candidate.score}%</em>
              </button>
            );
          }
          return (
            <div className={selected ? "candidate-card selected" : "candidate-card"} key={candidate.id}>
              <button
                className="candidate-card-head"
                onClick={() => setSelectedCandidateId(candidate.id)}
                aria-label={`选择检查候选${index + 1}`}
              >
                <strong>候选 {index + 1}</strong>
                <span>匹配 {candidate.score}%</span>
              </button>
              <InspectionDraftFields
                draft={candidate}
                isEditing={isEditing}
                onChange={(field, value) => updateCandidate(candidate.id, field, value)}
              />
              <div className="candidate-actions">
                <button
                  onClick={() => {
                    setSelectedCandidateId(candidate.id);
                    setEditingCandidateId(candidate.id);
                  }}
                >
                  手动修改
                </button>
                <button onClick={onManualFill ?? onFallback}>人工填报</button>
                <button
                  className="primary-button"
                  onClick={() => {
                    setSelectedCandidateId(candidate.id);
                    (onRequestSupplement ?? onSubmit)();
                  }}
                >
                  确认提交
                </button>
              </div>
            </div>
          );
        })}
        <button className="candidate-expand-button" onClick={() => setShowAllCandidates((current) => !current)}>
          {showAllCandidates ? "收起候选2和3" : "展开全部候选"}
        </button>
      </div>
    </div>
  );
}

function InspectionDraftFields({
  draft,
  isEditing,
  onChange
}: {
  draft: InspectionDraft;
  isEditing: boolean;
  onChange: (field: keyof InspectionDraft, value: string) => void;
}) {
  const fields: Array<{
    label: string;
    key: keyof InspectionDraft;
    multiline?: boolean;
  }> = [
    { label: "检查类型", key: "inspectionType" },
    { label: "项目名称", key: "projectName" },
    { label: "工程名称", key: "engineeringName", multiline: true },
    { label: "工程部位", key: "engineeringPart", multiline: true }
  ];

  return (
    <div className={isEditing ? "field-grid no-source editable-fields" : "field-grid no-source"}>
      {fields.map((field) => (
        <div className="field-row" key={field.key}>
          <span>{field.label}</span>
          {isEditing ? (
            field.multiline ? (
              <textarea
                aria-label={field.label}
                value={draft[field.key]}
                rows={2}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            ) : (
              <input
                aria-label={field.label}
                value={draft[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            )
          ) : (
            <strong>{draft[field.key]}</strong>
          )}
        </div>
      ))}
      <div className="field-row inspection-result-row">
        <span>检查结果</span>
        <div className="result-toggle" role="group" aria-label="检查结果">
          {(["合规", "不合规"] as const).map((result) => (
            <button
              key={result}
              className={draft.inspectionResult === result ? "active" : undefined}
              aria-pressed={draft.inspectionResult === result}
              onClick={() => onChange("inspectionResult", result)}
            >
              {result}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BriefCard({ onOpenPanel }: { onOpenPanel: (panel: DetailPanel, event: string) => void }) {
  const metrics = [
    ["报验申请", "15,838", "+8.7%"],
    ["已验收工序", "90,506", "完成"],
    ["检查问题", "4,119", "待闭环"],
    ["不合格", "324", "6.75%"]
  ];
  return (
    <div className="result-card brief-card">
      <div className="brief-head">
        <h3>广西路桥集团有限公司 2026 年 2 月工序管控模块使用简报</h3>
        <span>统计时间：2026年03月01日 08:00</span>
      </div>
      <div className="brief-section">
        <strong>一、整体使用概况</strong>
        <p>
          2026 年 2 月期间，广西路桥集团工序管控系统应用保持稳定，集团、项目和现场作业人员围绕工序报验、检查记录、整改闭环持续使用。系统累计发起报验申请 15,838 次，已验收工序 90,506 项，检查问题 4,119 条，其中不合格记录 324 条。
        </p>
      </div>
      <div className="brief-section">
        <strong>二、各单位使用详情</strong>
        <ul>
          <li>
            道桥分公司：报验和检查使用频次最高，路基工程、桥梁工程问题集中在 K10+887 至 K12+300 区间，建议继续跟踪整改闭环。
          </li>
          <li>
            路面分公司：本月报验增长 8.7%，已验收工序覆盖率较上月提升，主要集中在基层、面层施工节点。
          </li>
          <li>
            市政分公司：检查问题数量较低，但不合格率仍需关注，建议对重复问题建立专项复盘清单。
          </li>
        </ul>
      </div>
      <div className="metric-grid">
        {metrics.map(([label, value, hint]) => (
          <div className="metric" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <span>{hint}</span>
          </div>
        ))}
      </div>
      <p className="brief-note">AI 已按集团、分公司、项目、工程类型四级口径生成摘要，可继续下钻到责任单位、工点和问题清单。</p>
      <div className="brief-charts">
        <div className="brief-chart-panel">
          <span>分公司报验量柱状图</span>
          <div className="mini-chart" aria-label="分公司报验量柱状图">
            {[62, 34, 78, 46, 88, 51].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="brief-chart-panel">
          <span>检查问题闭环率折线图</span>
          <svg className="line-chart" viewBox="0 0 260 96" role="img" aria-label="检查问题闭环率折线图">
            <polyline points="8,70 55,54 102,38 149,44 196,28 252,34" />
            {[["8", "70"], ["55", "54"], ["102", "38"], ["149", "44"], ["196", "28"], ["252", "34"]].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" />
            ))}
          </svg>
        </div>
        <div className="brief-chart-panel pie-chart-panel">
          <span>工程类型占比饼图</span>
          <div className="pie-chart-wrap">
            <div className="pie-chart" role="img" aria-label="工程类型占比饼图" />
            <div className="pie-legend">
              <span><i className="legend-blue" />路基 42%</span>
              <span><i className="legend-amber" />桥梁 33%</span>
              <span><i className="legend-teal" />路面 25%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card-actions">
        <button onClick={() => onOpenPanel("drill", "按四级层级钻取简报明细")}>下钻明细</button>
        <button onClick={() => onOpenPanel("audit", "创建异步导出任务并记录审计")}>
          <Download size={15} />
          导出
        </button>
      </div>
    </div>
  );
}

function OcrCard({
  title,
  onOpenPanel,
  onSubmit,
  onFallback
}: {
  title: string;
  device: DeviceMode;
  onOpenPanel: (panel: DetailPanel, event: string) => void;
  onSubmit: () => void;
  onFallback: () => void;
}) {
  return (
    <div className="result-card">
      <h3>{title}</h3>
      <FieldGrid
        rows={[
          ["桩号", "K39+377", "工程检查 92%"],
          ["工程名称", "隧道工程", "工程检查 96%"],
          ["部位", "洞身开挖及支护", "候选匹配"],
          ["责任人", "张云祺 / 况超 / 何旭欣", "人员库匹配"]
        ]}
      />
      <div className="source-row">
        <Database size={16} />
        工程检查批次 EC-20260707-016，需人工确认后填充表单。
      </div>
      <div className="card-actions">
        <button onClick={() => onOpenPanel("ocr", "手动修改工程检查识别结果")}>手动修改</button>
        <button onClick={onFallback}>人工填报</button>
        <button className="primary-button" onClick={onSubmit}>
          确认提交
        </button>
      </div>
    </div>
  );
}

function HistoryCard({ onOpenPanel }: { onOpenPanel: (panel: DetailPanel, event: string) => void }) {
  return (
    <div className="result-card history-card">
      <h3>K10+887 工序报验追溯</h3>
      <div className="approval-status">
        <div>
          <span>当前审批人</span>
          <strong>宋冠先</strong>
        </div>
        <div>
          <span>审批节点</span>
          <strong>等待质检工程师审批</strong>
        </div>
      </div>
      <ul className="timeline">
        <li>09:12 施工员创建会话并绑定项目上下文</li>
        <li>09:13 生成工序报验草稿，等待施工员确认</li>
        <li>09:16 施工员修改桩号范围并提交</li>
        <li>09:17 业务单号 BY-20260707-008 已进入审批</li>
      </ul>
      <div className="card-actions">
        <button onClick={() => onOpenPanel("audit", "查看流程节点")}>查看流程节点</button>
      </div>
    </div>
  );
}

function PermissionCard({ scenario, roleName }: { scenario: Scenario; roleName: string }) {
  return (
    <div className="result-card blocked">
      <h3>权限不足</h3>
      <p>{roleName} 当前不能办理“{scenario.shortTitle}”。系统已停止工具调用，不展示不可见项目或数据是否存在。</p>
      <div className="source-row danger">
        <ShieldAlert size={16} />
        可申请项目权限，或返回既有人工流程。
      </div>
      <div className="card-actions">
        <button>查看申请路径</button>
        <button>打开人工入口</button>
      </div>
    </div>
  );
}

function FallbackCard({
  onOpenPanel,
  onFallback
}: {
  onOpenPanel: (panel: DetailPanel, event: string) => void;
  onFallback: () => void;
}) {
  return (
    <div className="result-card warning">
      <h3>意图不明确</h3>
      <p>输入意图含糊且工程检查字段存在多候选，AI 不能自动写入业务结果。请你重新输入明确的任务指示或者进行人工填报。</p>
      <FieldGrid
        rows={[
          ["触发原因", "字段缺失 / 多候选 / 低置信", "规则拦截"],
          ["AI 原值", "K10+887 或 K10+887-K20+303.368", "用户输入"],
          ["候选结构", "路基工程 / 桥梁工程", "结构库"],
          ["人工状态", "待人工确认", "任务节点"]
        ]}
      />
      <div className="card-actions">
        <button onClick={() => onOpenPanel("confirm", "手动修改字段并记录修改原因")}>手动修改</button>
        <button onClick={onFallback}>人工填报</button>
        <button className="primary-button" onClick={() => onOpenPanel("confirm", "人机回路确认提交")}>
          确认提交
        </button>
      </div>
    </div>
  );
}

function FieldGrid({ rows, showSource = true }: { rows: Array<[string, string, string]>; showSource?: boolean }) {
  return (
    <div className={showSource ? "field-grid" : "field-grid no-source"}>
      {rows.map(([label, value, source]) => (
        <div className="field-row" key={`${label}-${value}`}>
          <span>{label}</span>
          <strong>{value}</strong>
          {showSource && <small>{source}</small>}
        </div>
      ))}
    </div>
  );
}

function Inspector({
  scenario,
  role,
  canRun,
  taskStatus,
  auditEvents,
  onOpenAudit
}: {
  scenario: Scenario;
  role: (typeof roles)[number];
  canRun: boolean;
  taskStatus: TaskStatus;
  auditEvents: string[];
  onOpenAudit: () => void;
}) {
  return (
    <aside className="inspector">
      <section>
        <div className="section-title">
          <Users size={17} />
          <span>{role.prdId}</span>
        </div>
        <h2>{role.name}</h2>
        <p>{role.demand}</p>
        <div className="ability-list">
          {role.abilities.map((ability) => (
            <span key={ability}>{ability}</span>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title">
          <ListChecks size={17} />
          <span>{scenario.id}</span>
        </div>
        <h2>{scenario.title}</h2>
        <p>{scenario.value}</p>
        <div className={canRun ? "access ok" : "access denied"}>
          {canRun ? <ShieldCheck size={17} /> : <ShieldAlert size={17} />}
          {canRun ? "当前角色具备演示权限" : "当前角色将触发权限拦截"}
        </div>
      </section>

      <section>
        <div className="section-title">
          <Activity size={17} />
          <span>任务节点</span>
        </div>
        <div className="node-list">
          {actionPlan.map((step, index) => (
            <div className={index < 3 ? "node done" : "node"} key={step}>
              <i>{index + 1}</i>
              <span>{step}</span>
            </div>
          ))}
          <div className="node current">
            <i>6</i>
            <span>{taskStatus}</span>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">
          <ClipboardCheck size={17} />
          <span>验收覆盖</span>
        </div>
        <div className="acceptance-list">
          {scenario.acceptance.map((item) => (
            <span key={item} title={acceptanceLabels[item]}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <section>
        <button className="wide-button" onClick={onOpenAudit}>
          <History size={17} />
          查看审计与历史
        </button>
        <div className="audit-mini">
          {auditEvents.slice(0, 3).map((event) => (
            <p key={event}>{event}</p>
          ))}
        </div>
      </section>
    </aside>
  );
}

function DemoInfoDialog({
  type,
  activeScenario,
  activeRole,
  activeRoleId,
  canRun,
  taskStatus,
  auditEvents,
  onClose,
  onSelectScenario,
  onSelectRole,
  onOpenAudit,
  onSwitchMode
}: {
  type: Exclude<DemoModal, null>;
  activeScenario: Scenario;
  activeRole: (typeof roles)[number];
  activeRoleId: RoleId;
  canRun: boolean;
  taskStatus: TaskStatus;
  auditEvents: string[];
  onClose: () => void;
  onSelectScenario: (scenario: Scenario) => void;
  onSelectRole: (roleId: RoleId) => void;
  onOpenAudit: () => void;
  onSwitchMode: (mode: DeviceMode) => void;
}) {
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog demo-info-dialog">
        <div className="dialog-title">
          <div>
            <strong>{type === "scenarios" ? "场景演示" : "人员角色介绍"}</strong>
            <span>{type === "scenarios" ? "PRD 4.2 / 14.2 场景可点击切换" : "PRD 4.1 / 10.2 角色与权限说明"}</span>
          </div>
          <button className="icon-button" onClick={onClose} title="关闭">
            <X size={18} />
          </button>
        </div>

        {type === "scenarios" ? (
          <div className="dialog-body demo-info-body">
            <div className="demo-modal-toolbar">
              <button onClick={() => onSwitchMode("web")}>
                <Monitor size={16} />
                Web 页面
              </button>
              <button onClick={() => onSwitchMode("app")}>
                <Smartphone size={16} />
                App 页面
              </button>
              <button onClick={onOpenAudit}>
                <History size={16} />
                审计历史
              </button>
            </div>
            <div className="scenario-modal-grid">
              {scenarios.map((scenario) => {
                const Icon = kindIcons[scenario.kind];
                const active = scenario.id === activeScenario.id;
                const allowed = scenario.allowedRoles.includes(activeRoleId);
                return (
                  <button
                    key={scenario.id}
                    className={active ? "scenario-modal-card active" : "scenario-modal-card"}
                    onClick={() => onSelectScenario(scenario)}
                  >
                    <span className={allowed ? "scenario-icon" : "scenario-icon muted"}>
                      <Icon size={18} />
                    </span>
                    <strong>{scenario.title}</strong>
                    <small>{scenario.id} · {scenario.trigger}</small>
                    {!allowed && <em>当前角色会触发权限拦截</em>}
                  </button>
                );
              })}
            </div>
            <div className="quick-command-row">
              {quickCommands.map((command) => (
                <span key={command}>{command}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="dialog-body demo-info-body role-info-layout">
            <div className="role-card-list">
              {roles.map((role) => (
                <button
                  key={role.id}
                  className={role.id === activeRoleId ? "role-card active" : "role-card"}
                  onClick={() => onSelectRole(role.id)}
                >
                  <strong>{role.name}</strong>
                  <span>{role.prdId}</span>
                  <small>{role.demand}</small>
                </button>
              ))}
            </div>
            <div className="role-detail-panel">
              <div className="section-title">
                <Users size={17} />
                <span>{activeRole.prdId}</span>
              </div>
              <h2>{activeRole.name}</h2>
              <p>{activeRole.demand}</p>
              <div className="ability-list">
                {activeRole.abilities.map((ability) => (
                  <span key={ability}>{ability}</span>
                ))}
              </div>

              <div className={canRun ? "access ok" : "access denied"}>
                {canRun ? <ShieldCheck size={17} /> : <ShieldAlert size={17} />}
                {canRun ? "当前角色具备该场景演示权限" : "当前角色将触发权限拦截"}
              </div>

              <div className="role-permissions">
                <strong>授权能力</strong>
                <div>
                  {permissionMatrix[activeRoleId].map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>

              <div className="role-status-grid">
                <div>
                  <small>当前场景</small>
                  <strong>{activeScenario.id} · {activeScenario.title}</strong>
                </div>
                <div>
                  <small>任务状态</small>
                  <strong>{taskStatus}</strong>
                </div>
                <div>
                  <small>验收覆盖</small>
                  <strong>{activeScenario.acceptance.join(" / ")}</strong>
                </div>
              </div>

              <div className="node-list compact">
                {actionPlan.map((step, index) => (
                  <div className={index < 3 ? "node done" : "node"} key={step}>
                    <i>{index + 1}</i>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <button className="wide-button" onClick={onOpenAudit}>
                <History size={17} />
                查看审计与历史
              </button>
              <div className="audit-mini">
                {auditEvents.slice(0, 2).map((event) => (
                  <p key={event}>{event}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailDialog({
  panel,
  scenario,
  taskStatus,
  manualReason,
  auditEvents,
  onClose,
  onSubmit,
  onFallback,
  onManualReasonChange
}: {
  panel: DetailPanel;
  scenario: Scenario;
  taskStatus: TaskStatus;
  manualReason: string;
  auditEvents: string[];
  onClose: () => void;
  onSubmit: () => void;
  onFallback: () => void;
  onManualReasonChange: (value: string) => void;
}) {
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <div className="dialog-title">
          <strong>{panelTitle(panel)}</strong>
          <button className="icon-button" onClick={onClose} title="关闭">
            <X size={18} />
          </button>
        </div>
        {panel === "confirm" && (
          <ConfirmationView
            scenario={scenario}
            taskStatus={taskStatus}
            manualReason={manualReason}
            onManualReasonChange={onManualReasonChange}
            onSubmit={onSubmit}
            onFallback={onFallback}
          />
        )}
        {panel === "ocr" && <OcrConfirmView scenario={scenario} onFallback={onFallback} />}
        {panel === "drill" && <DrilldownView />}
        {panel === "audit" && <AuditView auditEvents={auditEvents} scenario={scenario} />}
      </div>
    </div>
  );
}

function panelTitle(panel: DetailPanel) {
  if (panel === "confirm") return "固定确认页";
  if (panel === "ocr") return "工程检查确认页";
  if (panel === "drill") return "简报钻取";
  return "历史与审计";
}

function ConfirmationView({
  scenario,
  taskStatus,
  manualReason,
  onManualReasonChange,
  onSubmit,
  onFallback
}: {
  scenario: Scenario;
  taskStatus: TaskStatus;
  manualReason: string;
  onManualReasonChange: (value: string) => void;
  onSubmit: () => void;
  onFallback: () => void;
}) {
  return (
    <div className="dialog-body">
      <div className="confirm-summary">
        <div>
          <small>影响业务对象</small>
          <strong>{scenario.kind === "inspection" ? "检查记录草稿" : "工序报验"}</strong>
        </div>
        <div>
          <small>任务状态</small>
          <strong>{taskStatus}</strong>
        </div>
        <div>
          <small>流程流向</small>
          <strong>既有业务表单 / 当前登录用户确认</strong>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>字段</th>
            <th>AI 原值</th>
            <th>建议值</th>
            <th>来源</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>项目名称</td>
            <td>测试一分部</td>
            <td>测试一分部</td>
            <td>App 表单字段</td>
          </tr>
          <tr>
            <td>验收部位</td>
            <td>ZK13+276拉秀3号大桥左幅/1#基础及下部构造/1#墩盖梁</td>
            <td>ZK13+276拉秀3号大桥左幅/1#基础及下部构造/1#墩盖梁</td>
            <td>App 表单字段</td>
          </tr>
          <tr>
            <td>验收工序</td>
            <td>模板安装</td>
            <td>模板安装</td>
            <td>App 表单字段</td>
          </tr>
        </tbody>
      </table>
      <label className="reason-field">
        <span>人工修改原因</span>
        <input value={manualReason} onChange={(event) => onManualReasonChange(event.target.value)} />
      </label>
      <div className="dialog-actions">
        <button onClick={onFallback}>转人工办理</button>
        <button className="ghost-button">保存草稿</button>
        <button className="primary-button" onClick={onSubmit}>确认提交</button>
      </div>
    </div>
  );
}

function OcrConfirmView({ scenario, onFallback }: { scenario: Scenario; onFallback: () => void }) {
  const image = scenario.kind === "supervisionOcr" ? responsibilityCard : ocrMarked;
  return (
    <div className="dialog-body split">
      <div className="ocr-preview">
        <img src={image} alt="工程检查原始材料" />
      </div>
      <div className="ocr-fields">
        <FieldGrid
          rows={[
            ["工程名称", "隧道工程", "工程检查 96%"],
            ["桩号", "K39+377", "工程检查 92%"],
            ["部位", "洞身开挖及支护", "结构候选"],
            ["人员", "6 名责任人", "人员库匹配"],
            ["附件", "责任登记卡 1 份", "自动挂接建议"]
          ]}
        />
        <div className="candidate-box">
          <strong>候选匹配</strong>
          <button>东峰隧道右洞进口 / 匹配 91%</button>
          <button>东峰隧道左洞进口 / 匹配 78%</button>
          <button>标记未匹配</button>
        </div>
        <div className="source-row danger">
          <AlertTriangle size={16} />
          多候选字段需人工选择，工程检查不自动新增基础库。
        </div>
        <div className="dialog-actions">
          <button onClick={onFallback}>人工绑定</button>
          <button className="primary-button">确认填充表单</button>
        </div>
      </div>
    </div>
  );
}

function DrilldownView() {
  const rows = [
    ["集团", "6 家直属单位", "15,838", "324", "导出中"],
    ["道桥分公司", "31 个项目", "8,420", "108", "可下钻"],
    ["融罗高速二分部", "K0+000~K16+500", "1,260", "18", "可下钻"],
    ["路基土石方", "K10+887", "46", "2", "查看明细"]
  ];
  return (
    <div className="dialog-body">
      <div className="confirm-summary">
        <div>
          <small>层级</small>
          <strong>集团 → 直属单位 → 项目 → 实体工程</strong>
        </div>
        <div>
          <small>时间</small>
          <strong>2026 年 2 月</strong>
        </div>
        <div>
          <small>导出任务</small>
          <strong>export-20260707-02 可下载</strong>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>层级</th>
            <th>对象</th>
            <th>报验数</th>
            <th>不合格</th>
            <th>动作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dialog-actions">
        <button>
          <ArrowUpRight size={16} />
          查看明细
        </button>
        <button className="primary-button">
          <Download size={16} />
          下载 Excel
        </button>
      </div>
    </div>
  );
}

function AuditView({ auditEvents, scenario }: { auditEvents: string[]; scenario: Scenario }) {
  return (
    <div className="dialog-body">
      <div className="audit-header">
        <Database size={19} />
        <div>
          <strong>{scenario.id} 审计证据</strong>
          <span>用户输入、意图、工具调用、确认动作、异常兜底和配置版本</span>
        </div>
      </div>
      <ul className="audit-list">
        {auditEvents.map((event) => (
          <li key={event}>{event}</li>
        ))}
        <li>GenUI schema v1.0 通过白名单校验</li>
        <li>Deep Agents 未直连 MySQL，业务事实来自 Spring 固定接口</li>
        <li>敏感日志已脱敏，trace_id 串联前端、网关、工具和业务结果</li>
      </ul>
      <div className="config-strip">
        <span>
          <Settings size={15} />
          Prompt v2026.07灰度
        </span>
        <span>
          <Wrench size={15} />
          工程检查模板 v3.2
        </span>
        <span>
          <RefreshCw size={15} />
          可回滚
        </span>
      </div>
    </div>
  );
}

export default App;
