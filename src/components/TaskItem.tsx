import { Trash2 } from "lucide-react";
import { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityClass: Record<number, string> = {
  1: "task-checkbox-p1",
  2: "task-checkbox-p2",
  3: "task-checkbox-p3",
  4: "task-checkbox-p4",
};

const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-task-hover transition-colors border-b border-border last:border-b-0">
      <button
        onClick={() => onToggle(task.id)}
        className={`task-checkbox ${priorityClass[task.priority]}`}
      >
        {task.completed && (
          <svg
            className="w-3 h-3 text-muted-foreground"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm leading-snug ${
          task.completed
            ? "line-through text-muted-foreground"
            : "text-foreground"
        }`}
      >
        {task.title}
      </span>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default TaskItem;
