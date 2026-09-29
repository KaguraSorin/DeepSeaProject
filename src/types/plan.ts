export type StageTheme = 'indigo' | 'aurora' | 'cyan' | 'mint';
export type TaskType = 'study' | 'practice' | 'review' | 'rest';

export interface Task {
  id: string;
  /** ISO yyyy-MM-dd */
  date: string;
  title: string;
  durationMin: number;
  type: TaskType;
  resource?: string;
  done: boolean;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
}

export interface Stage {
  id: string;
  index: number;
  title: string;
  goal: string;
  theme: StageTheme;
  /** ISO yyyy-MM-dd */
  startDate: string;
  /** ISO yyyy-MM-dd */
  endDate: string;
  milestones: Milestone[];
  tasks: Task[];
}

export interface PlanInput {
  goal: string;
  currentLevel: string;
  dailyMinutes: number;
  /** ISO yyyy-MM-dd */
  deadline: string;
  preferences?: string;
}

export interface ReviewStep {
  cadence: string;
  description: string;
}

export interface LearningPlan {
  id: string;
  title: string;
  summary: string;
  accent: StageTheme;
  createdAt: string;
  updatedAt: string;
  input: PlanInput;
  stages: Stage[];
  reviewPlan: ReviewStep[];
  dailyTip: string;
  streak: number;
  lastCheckinDate?: string;
  source: 'mock' | 'ai';
}