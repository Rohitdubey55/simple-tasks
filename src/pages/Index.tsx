import AppSidebar from "@/components/AppSidebar";
import TaskList from "@/components/TaskList";
import { useTaskStore } from "@/hooks/useTaskStore";
import { useMemo } from "react";

const viewTitles: Record<string, string> = {
  inbox: "Inbox",
  today: "Today",
  personal: "Personal",
  work: "Work",
};

const Index = () => {
  const { tasks, projects, activeView, setActiveView, addTask, toggleTask, deleteTask } =
    useTaskStore();

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // We need all tasks, not filtered, so we compute from what we have
    // For simplicity, counts show filtered active tasks
    counts[activeView] = tasks.filter((t) => !t.completed).length;
    return counts;
  }, [tasks, activeView]);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        projects={projects}
        activeView={activeView}
        onViewChange={setActiveView}
        taskCounts={taskCounts}
      />
      <main className="flex-1 overflow-y-auto">
        <TaskList
          title={viewTitles[activeView] || activeView}
          tasks={tasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onAdd={addTask}
        />
      </main>
    </div>
  );
};

export default Index;
