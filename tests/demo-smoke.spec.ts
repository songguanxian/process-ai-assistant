import { expect, test } from "@playwright/test";

const baseUrl = process.env.DEMO_URL ?? "http://127.0.0.1:5174";

test("Web 端 AI 侧边栏可进入固定确认页", async ({ page }) => {
  await page.goto(baseUrl);

  await expect(page.getByRole("button", { name: "收起侧边栏" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "收起 AI 助手" })).toBeVisible();
  await expect(page.getByRole("button", { name: "收起 AI 助手" })).toHaveText("");
  await page.getByRole("button", { name: "收起 AI 助手" }).click();
  const expandAiButton = page.getByRole("button", { name: "展开 AI 助手" });
  await expect(expandAiButton).toBeVisible();
  await expect(expandAiButton).toHaveAttribute("data-icon", "ai");
  await expandAiButton.click();
  await expect(page.locator(".assistant-title")).toContainText("工序助手");
  await expect(page.getByText("您好，我是工序AI助手")).toBeVisible();
  await expect(page.getByText("工序报验、检查验收、智能问数、工程检查和历史追溯")).toBeVisible();
  await expect(page.getByText("等待您确认后再进入原系统流程")).toBeVisible();
  await expect(page.getByRole("button", { name: "操作指南" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "拍照识别" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "数据简报" })).toHaveCount(0);
  await expect(page.getByText("融罗高速二分部", { exact: true })).toHaveCount(0);
  await expect(page.getByText("融罗高速二分部 / K10+887 路基工程")).toHaveCount(0);
  await expect(page.getByText("工序报验操作指南")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "拍照或图片上传" })).toBeVisible();
  await page.getByRole("button", { name: "操作指南" }).click();
  await expect(page.getByText("操作指南能帮您做什么")).toBeVisible();
  await expect(page.getByText("可给出表单入口、材料要求和常见漏填项提醒")).toBeVisible();
  await page.getByRole("button", { name: "AI简报" }).click();
  await expect(page.getByText("AI简报能帮您做什么")).toBeVisible();
  await expect(page.getByText("支持生成今日概况、风险摘要和待办清单")).toBeVisible();
  await page.getByRole("button", { name: "工序报验" }).click();
  await expect(page.getByText("工序报验能帮您做什么")).toBeVisible();
  await expect(page.getByText("正式提交前会展示固定确认页")).toBeVisible();
  await page.getByRole("button", { name: "工程检查" }).click();
  await expect(page.getByText("操作指南能帮您做什么")).toBeVisible();
  await expect(page.getByText("AI简报能帮您做什么")).toBeVisible();
  await expect(page.getByText("工序报验能帮您做什么")).toBeVisible();
  await expect(page.getByText("工程检查能帮您做什么")).toBeVisible();
  await expect(page.getByText("会标出低置信度和多候选字段")).toBeVisible();
  await expect(page.locator(".quick-intro-card")).toHaveCount(4);
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.locator(".bubble.user")).toHaveText("工序报验步骤");
  await expect(page.getByText("工程检查能帮您做什么")).toHaveCount(0);
  await expect(page.locator(".quick-intro-card")).toHaveCount(0);
  await expect(page.getByText("工序报验操作指南")).toBeVisible();
  await expect(page.getByText("来源：工序报验操作手册 v2026.02")).toBeVisible();
  await page.getByRole("button", { name: "角色介绍" }).click();
  await expect(page.getByText("人员角色介绍")).toBeVisible();
  await page.getByRole("button", { name: "关闭" }).click();

  await page.getByRole("button", { name: "进入表单" }).click();
  await expect(page.locator(".app-workspace")).toBeVisible();
  await expect(page.locator(".phone-header strong")).toHaveText("工序报验");
  const mobileForm = page.locator(".mobile-acceptance-form");
  await expect(page.getByRole("button", { name: "草稿箱" })).toBeVisible();
  await expect(mobileForm.getByText("项目名称:")).toBeVisible();
  await expect(mobileForm.getByText("测试一分部")).toBeVisible();
  await expect(mobileForm.getByText("1.验收工序")).toBeVisible();
  await expect(mobileForm.getByText("单位工程:")).toBeVisible();
  await expect(mobileForm.getByText("请选择单位工程")).toBeVisible();
  await expect(mobileForm.getByText("*验收部位", { exact: true })).toBeVisible();
  await expect(mobileForm.getByText("请选择验收部位")).toBeVisible();
  await expect(mobileForm.getByText("待人工填选")).toBeVisible();
  await expect(mobileForm.getByText("请选择验收工序")).toBeVisible();
  await expect(mobileForm.getByText("待人工填写工程进度")).toBeVisible();
  await expect(mobileForm.getByRole("button", { name: "重新选择" })).toBeVisible();
  await expect(mobileForm.getByText("验收依据:")).toBeVisible();
  await expect(mobileForm.getByText("请输入自检描述")).toBeVisible();
  await expect(mobileForm.getByText("模板安装完成并自检合格")).toHaveCount(0);
  await expect(mobileForm.getByText("劳务供应商:")).toBeVisible();
  await expect(mobileForm.getByRole("button", { name: "上传现场影像" })).toBeVisible();
  await expect(mobileForm.getByRole("button", { name: "重新获取" })).toBeVisible();
  await expect(mobileForm.getByText("请选择计划验收时间")).toBeVisible();
  await expect(mobileForm.getByText("验收人:")).toBeVisible();
  await expect(mobileForm.getByText("宋冠先")).toHaveCount(0);
  await expect(mobileForm.getByRole("button", { name: "复制上次数据" })).toBeVisible();
  await expect(mobileForm.getByRole("button", { name: "本地保存" })).toBeVisible();
  await expect(mobileForm.getByRole("button", { name: "提交" })).toBeVisible();
  await expect(mobileForm.locator(".mobile-form-actions")).toHaveCSS("position", "absolute");
  await expect(page.getByText("固定确认页")).toHaveCount(0);
  await expect(page.getByText("所有正式写入动作均需用户确认")).toHaveCount(0);

  await page.getByRole("button", { name: "返回智能填报" }).click();
  await expect(page.locator(".phone-header strong")).toHaveText("AI助手");
  await expect(page.getByText("您好，我是工序AI助手")).toBeVisible();
  await expect(page.locator(".bubble.user")).toHaveText("工序报验步骤");
  await expect(page.getByText("工序报验操作指南")).toBeVisible();
  await expect(page.locator(".mobile-ai-page .assistant-input")).toBeVisible();
  await expect(page.locator(".mobile-acceptance-form")).toHaveCount(0);
});

test("App 端白板工程检查场景进入对应业务候选卡", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=app&scenario=Scene-005`);

  await expect(page.locator(".bubble.user")).toHaveCount(0);
  await expect(page.getByLabel("白板图片加载示意")).toHaveCount(0);
  await expect(page.getByText("已识别为工序报验白板")).toHaveCount(0);
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.locator(".bubble.user")).toHaveText("识别白板信息");
  await expect(page.getByLabel("白板图片加载示意")).toBeVisible();
  await expect(page.getByText("图片已加载 · 正在识别业务类型")).toBeVisible();
  await expect(page.getByText("白板照片识别结果")).toHaveCount(0);
  await expect(page.getByText("已识别为工序报验白板")).toBeVisible();
  await expect(page.getByText("请确认验收部位")).toBeVisible();
  await expect(page.getByText("3 个候选")).toBeVisible();

  await page.getByRole("button", { name: "工程检查白板" }).click();
  await expect(page.getByText("已识别为工程检查白板")).toBeVisible();
  await expect(page.getByText("请确认检查部位")).toBeVisible();
});

test("重点监管资料工程检查卡片使用统一三按钮动作", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=web&scenario=Scene-006`);
  await page.getByRole("button", { name: "发送" }).click();
  let ocrCard = page.locator(".result-card").filter({ hasText: "重点监管资料工程检查" });
  await expect(ocrCard).toBeVisible();
  await expect(ocrCard.getByRole("button", { name: "查看确认页" })).toHaveCount(0);
  await expect(ocrCard.getByRole("button", { name: "人工绑定" })).toHaveCount(0);
  await expect(ocrCard.getByRole("button", { name: "手动修改" })).toBeVisible();
  await expect(ocrCard.getByRole("button", { name: "人工填报" })).toBeVisible();
  await expect(ocrCard.getByRole("button", { name: "确认提交" })).toBeVisible();

  await page.goto(`${baseUrl}/?mode=app&scenario=Scene-006`);
  await expect(page.locator(".bubble.user")).toHaveCount(0);
  await page.getByRole("button", { name: "发送" }).click();
  ocrCard = page.locator(".result-card").filter({ hasText: "重点监管资料工程检查" });
  await expect(ocrCard).toBeVisible();
  await expect(ocrCard.getByRole("button", { name: "查看确认页" })).toHaveCount(0);
  await expect(ocrCard.getByRole("button", { name: "人工绑定" })).toHaveCount(0);
  await expect(ocrCard.getByRole("button", { name: "手动修改" })).toBeVisible();
  await expect(ocrCard.getByRole("button", { name: "人工填报" })).toBeVisible();
  await expect(ocrCard.getByRole("button", { name: "确认提交" })).toBeVisible();
});

test("自然语言工序报验卡片与 App 字段一致", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=web&scenario=Scene-002`);

  await expect(page.getByText("请确认验收部位")).toHaveCount(0);
  await expect(page.locator(".bubble.user")).toHaveCount(0);
  await expect(page.locator("input[aria-label='演示输入']")).toHaveValue("发起测试一分部拉秀3号大桥模板安装工序报验");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(page.locator(".bubble.user")).toHaveText("发起测试一分部拉秀3号大桥模板安装工序报验");
  const acceptanceCard = page.locator(".result-card").filter({ hasText: "请确认验收部位" });
  await expect(acceptanceCard).toBeVisible();
  await expect(acceptanceCard.getByText("App 表单字段")).toHaveCount(0);
  await expect(acceptanceCard.getByText("3 个候选")).toBeVisible();
  await expect(acceptanceCard.locator(".candidate-card")).toHaveCount(1);
  await expect(acceptanceCard.locator(".candidate-summary")).toHaveCount(2);
  await expect(acceptanceCard.getByRole("button", { name: "展开全部候选" })).toBeVisible();
  const firstCandidate = acceptanceCard.locator(".candidate-card").first();
  await expect(firstCandidate.getByText("候选 1")).toBeVisible();
  await expect(firstCandidate.getByText("匹配 96%")).toBeVisible();
  await expect(firstCandidate.getByText("项目名称")).toBeVisible();
  await expect(firstCandidate.getByText("测试一分部", { exact: true })).toBeVisible();
  await expect(firstCandidate.getByText("验收部位")).toBeVisible();
  await expect(firstCandidate.getByText("ZK13+276拉秀3号大桥左幅/1#基础及下部构造/1#墩盖梁")).toBeVisible();
  await expect(firstCandidate.getByText("验收工序")).toBeVisible();
  await expect(firstCandidate.getByText("模板安装", { exact: true })).toBeVisible();
  await expect(page.getByText("施工单位")).toHaveCount(0);
  await expect(page.getByText("桩号")).toHaveCount(0);
  await expect(acceptanceCard.getByRole("button", { name: "复核字段" })).toHaveCount(0);
  await expect(acceptanceCard.getByRole("button", { name: "转人工" })).toHaveCount(0);
  await expect(acceptanceCard.getByRole("button", { name: "手动修改" })).toHaveCount(1);
  await expect(acceptanceCard.getByRole("button", { name: "人工填报" })).toHaveCount(1);
  await expect(acceptanceCard.getByRole("button", { name: "确认提交" })).toHaveCount(1);
  await acceptanceCard.getByRole("button", { name: "展开全部候选" }).click();
  await expect(acceptanceCard.locator(".candidate-card")).toHaveCount(3);
  await expect(acceptanceCard.locator(".candidate-summary")).toHaveCount(0);
  await expect(acceptanceCard.getByRole("button", { name: "收起候选2和3" })).toBeVisible();
  await expect(acceptanceCard.getByRole("button", { name: "手动修改" })).toHaveCount(3);
  await expect(acceptanceCard.getByRole("button", { name: "人工填报" })).toHaveCount(3);
  await expect(acceptanceCard.getByRole("button", { name: "确认提交" })).toHaveCount(3);

  await firstCandidate.getByRole("button", { name: "手动修改" }).click();
  await firstCandidate.getByLabel("项目名称").fill("测试二分部");
  await firstCandidate.getByLabel("验收部位").fill("ZK13+276拉秀3号大桥左幅/2#基础及下部构造");
  await firstCandidate.getByLabel("验收工序").fill("钢筋安装");
  await expect(firstCandidate.getByLabel("项目名称")).toHaveValue("测试二分部");
  await expect(firstCandidate.getByLabel("验收部位")).toHaveValue("ZK13+276拉秀3号大桥左幅/2#基础及下部构造");
  await expect(firstCandidate.getByLabel("验收工序")).toHaveValue("钢筋安装");

  await firstCandidate.getByRole("button", { name: "确认提交" }).click();
  await expect(page.getByText("请你提供工程进度、自检描述、计划验收时间、验收人")).toBeVisible();
  await expect(page.locator("input[aria-label='演示输入']")).toHaveValue(
    "工程进度15%，自检描述：模板安装完成并自检合格，计划验收时间：2026-07-16 09:30，验收人：宋冠先。"
  );
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("工程进度15%，自检描述：模板安装完成并自检合格，计划验收时间：2026-07-16 09:30，验收人：宋冠先。")).toBeVisible();
  const supplementCard = page.locator(".supplement-card");
  await expect(supplementCard).toBeVisible();
  await expect(supplementCard.getByText("工程进度", { exact: true })).toBeVisible();
  await expect(supplementCard.getByText("15%")).toBeVisible();
  await expect(supplementCard.getByText("自检描述", { exact: true })).toBeVisible();
  await expect(supplementCard.getByText("模板安装完成并自检合格")).toBeVisible();
  await expect(supplementCard.getByText("计划验收时间", { exact: true })).toBeVisible();
  await expect(supplementCard.getByText("2026-07-16 09:30")).toBeVisible();
  await expect(supplementCard.getByText("验收人", { exact: true })).toBeVisible();
  await expect(supplementCard.getByText("宋冠先")).toBeVisible();
  await expect(supplementCard.getByText("现场影像", { exact: true })).toHaveCount(0);
  await expect(supplementCard.getByRole("button", { name: "手动修改" })).toBeVisible();
  await expect(supplementCard.getByRole("button", { name: "人工填报" })).toBeVisible();
  await expect(supplementCard.getByRole("button", { name: "确认提交" })).toBeVisible();
  await supplementCard.getByRole("button", { name: "确认提交" }).click();
  await expect(page.locator(".phone-header strong")).toHaveText("工序报验");
  await expect(page.getByText("草稿箱")).toBeVisible();
  const submittedForm = page.locator(".mobile-acceptance-form");
  await expect(submittedForm.getByText("1.验收工序")).toBeVisible();
  await expect(submittedForm.getByText("项目名称")).toBeVisible();
  await expect(submittedForm.getByText("测试一分部")).toBeVisible();
  await expect(submittedForm.getByText("单位工程")).toBeVisible();
  await expect(submittedForm.getByText("ZK13+276拉秀3号大桥左幅/1#基础", { exact: true })).toBeVisible();
  await expect(submittedForm.getByText("*验收部位", { exact: true })).toBeVisible();
  await expect(submittedForm.getByText("验收工序:")).toBeVisible();
  await expect(submittedForm.getByText("工程进度")).toBeVisible();
  await expect(submittedForm.getByText("模板安装完成并自检合格")).toBeVisible();
  await expect(submittedForm.getByAltText("已上传现场影像")).toBeVisible();
  await expect(submittedForm.getByText("计划验收时间")).toBeVisible();
  await expect(submittedForm.getByText("2026-07-16 09:30")).toBeVisible();
  await expect(submittedForm.getByText("验收人")).toBeVisible();
  await expect(submittedForm.getByText("宋冠先")).toBeVisible();
  await expect(submittedForm.getByRole("button", { name: "提交" })).toBeVisible();
});

test("工序报验人工填报进入空白 App 表单", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=app&scenario=Scene-002`);

  await expect(page.getByText("请确认验收部位")).toHaveCount(0);
  await page.getByRole("button", { name: "发送" }).click();

  const acceptanceCard = page.locator(".acceptance-card");
  await expect(acceptanceCard).toBeVisible();
  await acceptanceCard.locator(".candidate-card").first().getByRole("button", { name: "人工填报" }).click();

  await expect(page.locator(".phone-header strong")).toHaveText("工序报验");
  await expect(page.getByText("请选择单位工程")).toBeVisible();
  await expect(page.getByText("请选择验收部位")).toBeVisible();
  await expect(page.getByText("待人工填选")).toBeVisible();
  await expect(page.getByText("请选择验收工序")).toBeVisible();
  await expect(page.getByText("待人工填写工程进度")).toBeVisible();
  await expect(page.getByText("请输入自检描述")).toBeVisible();
  await expect(page.getByText("请选择计划验收时间")).toBeVisible();
  await expect(page.getByText("模板安装完成并自检合格")).toHaveCount(0);
  await expect(page.getByAltText("已上传现场影像")).toHaveCount(0);
  await expect(page.getByText("宋冠先")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "提交" })).toBeVisible();
});

test("检查记录草稿卡片与工序报验卡片保持一致", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=web&scenario=Scene-003`);

  await expect(page.getByText("请确认检查部位")).toHaveCount(0);
  await page.getByRole("button", { name: "发送" }).click();

  const inspectionCard = page.locator(".result-card").filter({ hasText: "请确认检查部位" });
  await expect(inspectionCard).toBeVisible();
  await expect(inspectionCard.getByText("3 个候选")).toBeVisible();
  await expect(inspectionCard.locator(".candidate-card")).toHaveCount(1);
  await expect(inspectionCard.locator(".candidate-summary")).toHaveCount(2);
  await expect(inspectionCard.getByRole("button", { name: "展开全部候选" })).toBeVisible();
  const firstCandidate = inspectionCard.locator(".candidate-card").first();
  await expect(firstCandidate.getByText("候选 1")).toBeVisible();
  await expect(firstCandidate.getByText("匹配 94%")).toBeVisible();
  await expect(firstCandidate.locator(".field-row").filter({ hasText: "检查类型" })).toContainText("工程质量检查");
  await expect(firstCandidate.locator(".field-row").filter({ hasText: "项目名称" })).toContainText("融罗高速二分部");
  await expect(firstCandidate.locator(".field-row").filter({ hasText: "工程名称" })).toContainText("K0+000~K16+500 路基工程");
  await expect(firstCandidate.locator(".field-row").filter({ hasText: "工程部位" })).toContainText("K12+300 左幅边坡防护");
  const firstResultRow = firstCandidate.locator(".field-row").filter({ hasText: "检查结果" });
  await expect(firstResultRow).toBeVisible();
  await expect(firstResultRow.getByRole("button", { name: "合规", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(firstResultRow.getByRole("button", { name: "不合规", exact: true })).toHaveAttribute("aria-pressed", "false");
  await inspectionCard.getByRole("button", { name: "展开全部候选" }).click();
  await expect(inspectionCard.locator(".candidate-card")).toHaveCount(3);
  await expect(inspectionCard.locator(".candidate-summary")).toHaveCount(0);
  await expect(inspectionCard.getByRole("button", { name: "收起候选2和3" })).toBeVisible();
  const secondCandidate = inspectionCard.locator(".candidate-card").nth(1);
  const thirdCandidate = inspectionCard.locator(".candidate-card").nth(2);
  await expect(secondCandidate.getByText("检查类型")).toBeVisible();
  await expect(secondCandidate.getByText("工程名称")).toBeVisible();
  await expect(secondCandidate.getByText("工程部位")).toBeVisible();
  await expect(secondCandidate.locator(".field-row").filter({ hasText: "检查结果" }).getByRole("button", { name: "不合规", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(thirdCandidate.getByText("检查类型")).toBeVisible();
  await expect(thirdCandidate.getByText("工程名称")).toBeVisible();
  await expect(thirdCandidate.getByText("工程部位")).toBeVisible();
  await expect(inspectionCard.getByText("检查对象")).toHaveCount(0);
  await expect(inspectionCard.getByText("问题描述")).toHaveCount(0);
  await expect(inspectionCard.getByText("责任人")).toHaveCount(0);
  await expect(inspectionCard.getByText("整改建议")).toHaveCount(0);
  await expect(inspectionCard.getByRole("button", { name: "补录字段" })).toHaveCount(0);
  await expect(inspectionCard.getByRole("button", { name: "半预填表单" })).toHaveCount(0);
  await expect(inspectionCard.getByRole("button", { name: "手动修改" })).toHaveCount(3);
  await expect(inspectionCard.getByRole("button", { name: "人工填报" })).toHaveCount(3);
  await expect(inspectionCard.getByRole("button", { name: "确认提交" })).toHaveCount(3);

  await firstCandidate.getByRole("button", { name: "手动修改" }).click();
  await firstCandidate.getByLabel("工程部位").fill("K12+300 左幅边坡防护钢筋外露点位");
  await expect(firstCandidate.getByLabel("工程部位")).toHaveValue("K12+300 左幅边坡防护钢筋外露点位");
  await firstResultRow.getByRole("button", { name: "不合规", exact: true }).click();
  await expect(firstResultRow.getByRole("button", { name: "不合规", exact: true })).toHaveAttribute("aria-pressed", "true");

  await firstCandidate.getByRole("button", { name: "确认提交" }).click();
  await expect(page.getByText("请描述存在问题、整改截止日，并上传现场影像")).toBeVisible();
  await expect(page.locator("input[aria-label='演示输入']")).toHaveValue(
    "存在问题：左幅边坡防护钢筋外露；整改截止日：2026-07-15；已上传现场影像3张。"
  );
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("存在问题：左幅边坡防护钢筋外露；整改截止日：2026-07-15；已上传现场影像3张。")).toBeVisible();
  const inspectionSupplementCard = page.locator(".inspection-supplement-card");
  await expect(inspectionSupplementCard).toBeVisible();
  await expect(inspectionSupplementCard.getByText("存在问题", { exact: true })).toBeVisible();
  await expect(inspectionSupplementCard.getByText("左幅边坡防护钢筋外露")).toBeVisible();
  await expect(inspectionSupplementCard.getByText("整改截止日", { exact: true })).toBeVisible();
  await expect(inspectionSupplementCard.getByText("2026-07-15")).toBeVisible();
  await expect(inspectionSupplementCard.getByText("现场影像", { exact: true })).toBeVisible();
  await expect(inspectionSupplementCard.getByLabel("已上传现场影像3张")).toBeVisible();
  await expect(inspectionSupplementCard.getByRole("button", { name: "手动修改" })).toBeVisible();
  await expect(inspectionSupplementCard.getByRole("button", { name: "人工填报" })).toBeVisible();
  await expect(inspectionSupplementCard.getByRole("button", { name: "确认提交" })).toBeVisible();
});

test("工程检查人工填报进入 App 空白检查页面", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=app&scenario=Scene-003`);

  await page.getByRole("button", { name: "发送" }).click();
  const inspectionCard = page.locator(".result-card").filter({ hasText: "请确认检查部位" });
  await expect(inspectionCard).toBeVisible();
  await inspectionCard.locator(".candidate-card").first().getByRole("button", { name: "人工填报" }).click();

  await expect(page.locator(".phone-header strong")).toHaveText("工程检查");
  await expect(page.getByRole("button", { name: "草稿箱" })).toHaveCount(0);
  await expect(page.getByText("检查类型:")).toBeVisible();
  await expect(page.getByText("请选择检查类型")).toBeVisible();
  await expect(page.getByText("项目名称:")).toBeVisible();
  await expect(page.getByText("测试一分部")).toBeVisible();
  await expect(page.getByText("请选择工程名称")).toBeVisible();
  await expect(page.getByText("工程部位补充")).toBeVisible();
  await expect(page.locator(".inspection-result-form-row").getByRole("button", { name: "异常" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("请输入存在问题描述")).toBeVisible();
  await expect(page.getByText("请输入整改要求")).toBeVisible();
  await expect(page.getByText("请选择整改期限")).toBeVisible();
  await expect(page.getByAltText("已上传工程检查现场影像")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "提交保存" })).toBeVisible();
});

test("工程检查确认提交进入 App 预填检查页面", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=app&scenario=Scene-003`);

  await page.getByRole("button", { name: "发送" }).click();
  const inspectionCard = page.locator(".result-card").filter({ hasText: "请确认检查部位" });
  await inspectionCard.locator(".candidate-card").first().getByRole("button", { name: "确认提交" }).click();
  await expect(page.getByText("请描述存在问题、整改截止日，并上传现场影像")).toBeVisible();
  await page.getByRole("button", { name: "发送" }).click();

  const inspectionSupplementCard = page.locator(".inspection-supplement-card");
  await expect(inspectionSupplementCard).toBeVisible();
  await inspectionSupplementCard.getByRole("button", { name: "确认提交" }).click();

  await expect(page.locator(".phone-header strong")).toHaveText("工程检查");
  const inspectionForm = page.locator(".mobile-inspection-form");
  await expect(inspectionForm.getByText("工程质量检查")).toBeVisible();
  await expect(inspectionForm.getByText("测试一分部")).toBeVisible();
  await expect(inspectionForm.getByText("K0+000~K16+500 路基工程")).toBeVisible();
  await expect(inspectionForm.getByText("K12+300 左幅边坡防护")).toBeVisible();
  await expect(inspectionForm.locator(".inspection-result-form-row").getByRole("button", { name: "异常" })).toHaveAttribute("aria-pressed", "true");
  await expect(inspectionForm.getByText("左幅边坡防护钢筋外露")).toBeVisible();
  await expect(inspectionForm.getByText("请按设计保护层厚度补强并复核钢筋外露点位")).toBeVisible();
  await expect(inspectionForm.getByText("2026-07-15")).toBeVisible();
  await expect(inspectionForm.getByAltText("已上传工程检查现场影像")).toBeVisible();
  await expect(inspectionForm.getByText("宋冠先")).toBeVisible();
  await expect(inspectionForm.getByRole("button", { name: "提交保存" })).toBeVisible();
});

test("AI 简报包含报告式文字说明", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=web&scenario=Scene-004`);

  await expect(page.getByText("整体使用概况")).toHaveCount(0);
  await page.getByRole("button", { name: "发送" }).click();

  const briefCard = page.locator(".brief-card");
  await expect(briefCard).toBeVisible();
  await expect(briefCard.getByText("广西路桥集团有限公司 2026 年 2 月工序管控模块使用简报")).toBeVisible();
  await expect(briefCard.getByText("一、整体使用概况")).toBeVisible();
  await expect(briefCard.getByText("二、各单位使用详情")).toBeVisible();
  await expect(briefCard.getByText("系统累计发起报验申请 15,838 次")).toBeVisible();
  await expect(briefCard.getByText("道桥分公司：报验和检查使用频次最高")).toBeVisible();
  await expect(briefCard.getByLabel("分公司报验量柱状图")).toBeVisible();
  await expect(briefCard.getByLabel("检查问题闭环率折线图")).toBeVisible();
  await expect(briefCard.getByLabel("工程类型占比饼图")).toBeVisible();
});

test("历史追溯按施工员与质检审批口径展示", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=web&scenario=Scene-007`);

  await page.getByRole("button", { name: "发送" }).click();
  const historyCard = page.locator(".history-card");
  await expect(historyCard).toBeVisible();
  await expect(historyCard.getByText("审批节点")).toBeVisible();
  await expect(historyCard.getByText("等待质检工程师审批")).toBeVisible();
  await expect(historyCard.getByText("监理工程师初审")).toHaveCount(0);
  await expect(historyCard.getByText("09:12 施工员创建会话并绑定项目上下文")).toBeVisible();
  await expect(historyCard.getByText("09:13 生成工序报验草稿，等待施工员确认")).toBeVisible();
  await expect(historyCard.getByText("09:16 施工员修改桩号范围并提交")).toBeVisible();
  await expect(historyCard.getByText("09:12 创建会话并绑定项目上下文")).toHaveCount(0);
  await expect(historyCard.getByText("09:13 生成工序报验草稿，等待用户确认")).toHaveCount(0);
  await expect(historyCard.getByText("09:16 用户修改桩号范围并提交")).toHaveCount(0);
});

test("人机回路卡片使用统一三按钮动作", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=web&scenario=Scene-009`);

  await page.getByRole("button", { name: "发送" }).click();
  const fallbackCard = page.locator(".result-card").filter({ hasText: "意图不明确" });
  await expect(fallbackCard).toBeVisible();
  await expect(fallbackCard.getByText("需要人在回路")).toHaveCount(0);
  await expect(fallbackCard.getByText("请你重新输入明确的任务指示或者进行人工填报")).toBeVisible();
  await expect(fallbackCard.getByRole("button", { name: "修改字段" })).toHaveCount(0);
  await expect(fallbackCard.getByRole("button", { name: "转表单办理" })).toHaveCount(0);
  await expect(fallbackCard.getByRole("button", { name: "手动修改" })).toBeVisible();
  await expect(fallbackCard.getByRole("button", { name: "人工填报" })).toBeVisible();
  await expect(fallbackCard.getByRole("button", { name: "确认提交" })).toBeVisible();
});

test("App 端业务功能复用 Web 对话与输入框", async ({ page }) => {
  await page.goto(`${baseUrl}/?mode=app&scenario=Scene-002`);

  await expect(page.locator(".phone-header strong")).toHaveText("智能填报");
  await expect(page.getByText("AI 草稿已带入，正式提交前需人工确认")).toHaveCount(0);
  await expect(page.getByText("您好，我是工序AI助手")).toBeVisible();
  await expect(page.locator(".mobile-ai-page .assistant-quick-actions")).toBeVisible();
  await expect(page.locator(".mobile-ai-page .assistant-input")).toBeVisible();
  await expect(page.locator("input[aria-label='演示输入']")).toHaveValue("发起测试一分部拉秀3号大桥模板安装工序报验");
  await expect(page.locator(".bubble.user")).toHaveCount(0);
  await expect(page.getByText("请确认验收部位")).toHaveCount(0);
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.locator(".bubble.user")).toHaveText("发起测试一分部拉秀3号大桥模板安装工序报验");
  await expect(page.getByText("请确认验收部位")).toBeVisible();
  const appAcceptanceCard = page.locator(".result-card").filter({ hasText: "请确认验收部位" });
  await appAcceptanceCard.getByRole("button", { name: "确认提交" }).click();
  await expect(page.getByText("请你提供工程进度、自检描述、计划验收时间、验收人")).toBeVisible();
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("补充信息确认")).toBeVisible();
  await page.locator(".supplement-card").getByRole("button", { name: "确认提交" }).click();
  await expect(page.locator(".phone-header strong")).toHaveText("工序报验");
  await page.getByRole("button", { name: "返回智能填报" }).click();
  await expect(page.locator(".phone-header strong")).toHaveText("智能填报");
  await expect(page.locator(".bubble.user").last()).toHaveText("工程进度15%，自检描述：模板安装完成并自检合格，计划验收时间：2026-07-16 09:30，验收人：宋冠先。");
  await expect(page.getByText("补充信息确认")).toBeVisible();
  await expect(page.getByText("请你提供工程进度、自检描述、计划验收时间、验收人")).toBeVisible();
  await expect(page.getByText("施工单位")).toHaveCount(0);
  await expect(page.getByText("单位工程")).toHaveCount(0);
  await expect(page.getByText("桩号范围")).toHaveCount(0);
  await expect(page.locator("img.form-shot")).toHaveCount(0);
  await expect(page.locator(".mobile-reference")).toHaveCount(0);

  await page.goto(`${baseUrl}/?mode=app&scenario=Scene-003`);
  await expect(page.locator(".phone-header strong")).toHaveText("AI助手");
  await expect(page.locator(".mobile-ai-page .assistant-input")).toBeVisible();
  await expect(page.getByText("请确认检查部位")).toHaveCount(0);
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("请确认检查部位")).toBeVisible();

  await page.goto(`${baseUrl}/?mode=app&scenario=Scene-004`);
  await expect(page.locator(".phone-header strong")).toHaveText("AI助手");
  await expect(page.locator(".mobile-ai-page .assistant-input")).toBeVisible();
  await expect(page.getByText("集团 2026 年 2 月工序简报")).toHaveCount(0);
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("集团 2026 年 2 月工序简报")).toBeVisible();
});
