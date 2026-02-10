export type Priority = 1 | 2 | 3 | 4;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  projectId: string;
  dueDate?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
}
