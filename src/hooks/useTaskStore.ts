import { useState, useCallback, useEffect, useRef } from "react";
import { Task, Project, Priority } from "@/types/task";
import { toast } from "sonner";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxDhkXP6SAyM8mh3wij-LdLo1g0Jv5LXXHCwE9mczxiv2qDWBQtBSrTOTn25YGmbY1nbw/exec";

const defaultProjects: Project[] = [
  { id: "inbox", name: "Inbox", color: "hsl(210, 60%, 55%)" },
  { id: "personal", name: "Personal", color: "hsl(142, 60%, 45%)" },
  { id: "work", name: "Work", color: "hsl(30, 80%, 55%)" },
];

// JSONP-style GET: loads script tag to bypass CORS redirect
function fetchViaJsonp(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = `_cb_${Date.now()}`;
    const script = document.createElement("script");

    (window as any)[callbackName] = (data: any) => {
      resolve(data);
      delete (window as any)[callbackName];
      document.body.removeChild(script);
    };

    script.src = `${url}?callback=${callbackName}`;
    script.onerror = () => {
      reject(new Error("JSONP request failed"));
      delete (window as any)[callbackName];
      document.body.removeChild(script);
    };

    document.body.appendChild(script);
  });
}

// POST via no-cors (fire-and-forget, can't read response)
async function postToAppsScript(payload: object): Promise<void> {
  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects] = useState<Project[]>(defaultProjects);
  const [activeView, setActiveView] = useState("inbox");
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchViaJsonp(APPS_SCRIPT_URL);
      const parsed: Task[] = (Array.isArray(data) ? data : []).map((row: any) => ({
        id: String(row.id),
        title: String(row.title),
        completed: row.completed === true || row.completed === "TRUE",
        priority: (Number(row.priority) || 4) as Priority,
        projectId: String(row.projectId || "inbox"),
        dueDate: row.dueDate ? String(row.dueDate) : undefined,
        createdAt: String(row.createdAt || new Date().toISOString()),
      }));
      if (mountedRef.current) setTasks(parsed);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      if (mountedRef.current) toast.error("Failed to load tasks from Google Sheets");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (title: string, priority: Priority = 4, projectId?: string) => {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        completed: false,
        priority,
        projectId: projectId || (activeView === "today" ? "inbox" : activeView),
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      try {
        await postToAppsScript({ action: "add", task: newTask });
        toast.success("Task saved");
      } catch (err) {
        console.error("Failed to add task:", err);
        if (mountedRef.current) {
          toast.error("Failed to save task to Google Sheets");
          setTasks((prev) => prev.filter((t) => t.id !== newTask.id));
        }
      }
    },
    [activeView]
  );

  const toggleTask = useCallback(async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await postToAppsScript({ action: "toggle", id });
    } catch (err) {
      console.error("Failed to toggle task:", err);
      if (mountedRef.current) {
        toast.error("Failed to update task");
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        );
      }
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    let deleted: Task | undefined;
    setTasks((prev) => {
      deleted = prev.find((t) => t.id === id);
      return prev.filter((t) => t.id !== id);
    });
    try {
      await postToAppsScript({ action: "delete", id });
    } catch (err) {
      console.error("Failed to delete task:", err);
      if (mountedRef.current) {
        toast.error("Failed to delete task");
        if (deleted) setTasks((prev) => [...prev, deleted!]);
      }
    }
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (activeView === "today") return !t.completed;
    if (activeView === "inbox") return t.projectId === "inbox";
    return t.projectId === activeView;
  });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    projects,
    activeView,
    setActiveView,
    addTask,
    toggleTask,
    deleteTask,
    loading,
    refetch: fetchTasks,
  };
}
