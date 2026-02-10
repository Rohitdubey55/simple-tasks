import { Inbox, CalendarDays, Hash, Plus, CheckCircle2 } from "lucide-react";
import { Project } from "@/types/task";

interface AppSidebarProps {
  projects: Project[];
  activeView: string;
  onViewChange: (view: string) => void;
  taskCounts: Record<string, number>;
}

const AppSidebar = ({ projects, activeView, onViewChange, taskCounts }: AppSidebarProps) => {
  return (
    <aside className="w-[280px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 pb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-foreground tracking-tight">Taskflow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <SidebarItem
          icon={<Inbox className="w-4 h-4" />}
          label="Inbox"
          active={activeView === "inbox"}
          count={taskCounts["inbox"] || 0}
          onClick={() => onViewChange("inbox")}
        />
        <SidebarItem
          icon={<CalendarDays className="w-4 h-4" />}
          label="Today"
          active={activeView === "today"}
          count={taskCounts["today"] || 0}
          onClick={() => onViewChange("today")}
        />

        <div className="pt-5 pb-1.5 px-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Projects
            </span>
            <button className="p-0.5 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {projects
          .filter((p) => p.id !== "inbox")
          .map((project) => (
            <SidebarItem
              key={project.id}
              icon={
                <Hash className="w-4 h-4" style={{ color: project.color }} />
              }
              label={project.name}
              active={activeView === project.id}
              count={taskCounts[project.id] || 0}
              onClick={() => onViewChange(project.id)}
            />
          ))}
      </nav>
    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}

const SidebarItem = ({ icon, label, active, count, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent/60"
    }`}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
    {count > 0 && (
      <span className="text-xs text-muted-foreground">{count}</span>
    )}
  </button>
);

export default AppSidebar;
