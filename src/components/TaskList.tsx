import { Task } from "@/types/task";
import TaskItem from "./TaskItem";
import AddTaskInput from "./AddTaskInput";
import { Priority } from "@/types/task";

interface TaskListProps {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string, priority: Priority) => void;
}

const TaskList = ({ title, tasks, onToggle, onDelete, onAdd }: TaskListProps) => {
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-foreground mb-1">{title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-0">
        {activeTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="mt-2">
        <AddTaskInput onAdd={onAdd} />
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
            Completed ({completedTasks.length})
          </p>
          <div className="space-y-0 opacity-60">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
