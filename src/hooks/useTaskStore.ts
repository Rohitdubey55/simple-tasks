import { useState, useCallback } from "react";
import { Task, Project, Priority } from "@/types/task";

const defaultProjects: Project[] = [
  { id: "inbox", name: "Inbox", color: "hsl(210, 60%, 55%)" },
  { id: "personal", name: "Personal", color: "hsl(142, 60%, 45%)" },
  { id: "work", name: "Work", color: "hsl(30, 80%, 55%)" },
];

const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Review pull requests on GitHub",
    completed: false,
    priority: 1,
    projectId: "work",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Set up Google Calendar integration",
    completed: false,
    priority: 2,
    projectId: "work",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Organize shared Drive folder",
    completed: false,
    priority: 3,
    projectId: "personal",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Update project README on GitHub",
    completed: true,
    priority: 4,
    projectId: "work",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Plan weekly sprint in Google Sheets",
    completed: false,
    priority: 2,
    projectId: "inbox",
    createdAt: new Date().toISOString(),
  },
];

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [projects] = useState<Project[]>(defaultProjects);
  const [activeView, setActiveView] = useState("inbox");

  const addTask = useCallback((title: string, priority: Priority = 4, projectId?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
      projectId: projectId || activeView === "today" ? "inbox" : activeView,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, [activeView]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (activeView === "today") return !t.completed;
    if (activeView === "inbox") return t.projectId === "inbox";
    return t.projectId === activeView;
  });

  return {
    tasks: filteredTasks,
    projects,
    activeView,
    setActiveView,
    addTask,
    toggleTask,
    deleteTask,
  };
}
