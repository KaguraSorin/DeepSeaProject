import type { LearningPlan } from '@/types/plan';
import { TASK_TYPE_META } from '@/lib/theme/tokens';
import { formatCNFull } from '@/lib/utils/date';

/** 计划 → Markdown 文本 */
export function planToMarkdown(plan: LearningPlan): string {
  const lines: string[] = [];
  const totalTasks = plan.stages.reduce((n, s) => n + s.tasks.length, 0);
  const doneTasks = plan.stages.reduce((n, s) => n + s.tasks.filter((t) => t.done).length, 0);
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  lines.push(`# ${plan.title}`);
  lines.push('');
  lines.push(`> 由「汐」生成 · ${plan.source === 'ai' ? 'AI 生成' : '本地生成'} · 更新于 ${formatCNFull(plan.updatedAt.slice(0, 10))}`);
  lines.push('');
  lines.push(plan.summary);
  lines.push('');
  lines.push('## 目标信息');
  lines.push('');
  lines.push(`- 学习目标：${plan.input.goal}`);
  lines.push(`- 当前水平：${plan.input.currentLevel}`);
  lines.push(`- 每日时长：${plan.input.dailyMinutes} 分钟`);
  lines.push(`- 截止日期：${plan.input.deadline}`);
  if (plan.input.preferences) lines.push(`- 偏好说明：${plan.input.preferences}`);
  lines.push('');
  lines.push(`## 总体进度：${doneTasks}/${totalTasks}（${pct}%）`);
  lines.push('');
  lines.push(`连续打卡：${plan.streak} 天`);
  lines.push('');
  lines.push('---');
  lines.push('');

  plan.stages.forEach((stage) => {
    const sTotal = stage.tasks.length;
    const sDone = stage.tasks.filter((t) => t.done).length;
    lines.push(`## 阶段 ${stage.index + 1} · ${stage.title}`);
    lines.push('');
    lines.push(`- 目标：${stage.goal}`);
    lines.push(`- 周期：${stage.startDate} ~ ${stage.endDate}`);
    lines.push(`- 进度：${sDone}/${sTotal}`);
    lines.push('');
    if (stage.milestones.length) {
      lines.push('### 里程碑');
      lines.push('');
      stage.milestones.forEach((m) => {
        lines.push(`- [ ] ${m.title}${m.description ? ` —— ${m.description}` : ''}`);
      });
      lines.push('');
    }
    lines.push('### 任务');
    lines.push('');
    lines.push('| 日期 | 任务 | 类型 | 时长 | 状态 |');
    lines.push('| --- | --- | --- | --- | --- |');
    stage.tasks.forEach((t) => {
      lines.push(
        `| ${t.date} | ${t.title} | ${TASK_TYPE_META[t.type].label} | ${t.durationMin}min | ${t.done ? '已完成' : '待完成'} |`,
      );
    });
    lines.push('');
  });

  if (plan.reviewPlan.length) {
    lines.push('## 复习节奏');
    lines.push('');
    plan.reviewPlan.forEach((r) => lines.push(`- **${r.cadence}**：${r.description}`));
    lines.push('');
  }

  if (plan.dailyTip) {
    lines.push('## 汐的今日寄语');
    lines.push('');
    lines.push(`> ${plan.dailyTip}`);
    lines.push('');
  }

  return lines.join('\n');
}

/** 触发浏览器下载文本文件 */
export function downloadText(filename: string, content: string, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function safeFileName(name: string): string {
  return (name || 'plan').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 60);
}