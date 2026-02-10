import { useState, useCallback, useEffect, useRef } from "react";
import { Task, Project, Priority } from "@/types/task";
import { toast } from "sonner";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzzwZutrkB7Ec0PXFkQ7LYlnmC8Yt5EMhtOVYLz6jvXze1zWwk607DE4SIhZv_G2uUOvQ/exec";

const defaultProjects: Project[] = [
  { id: "inbox", name: "Inbox", color: "hsl(210, 60%, 55%)" },
  { id: "personal", name: "Personal", color: "hsl(142, 60%, 45%)" },
  { id: "work", name: "Work", color: "hsl(30, 80%, 55%)" },
];

// All communication via JSONP to bypass CORS
function jsonpRequest(params: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = `_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Request timed out"));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      delete (window as any)[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    const query = new URLSearchParams({ ...params, callback: callbackName }).toString();
    script.src = `${APPS_SCRIPT_URL}?${query}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP request failed"));
    };

    document.body.appendChild(script);
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
    return () => { mountedRef.current = false; };
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await jsonpRequest({ action: "list" });
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

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

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
        await jsonpRequest({
          action: "add",
          id: newTask.id,
          title: newTask.title,
          completed: "false",
          priority: String(newTask.priority),
          projectId: newTask.projectId,
          dueDate: newTask.dueDate || "",
          createdAt: newTask.createdAt,
        });
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
      await jsonpRequest({ action: "toggle", id });
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
      await jsonpRequest({ action: "delete", id });
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
