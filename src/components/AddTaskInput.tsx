import { useState } from "react";
import { Plus } from "lucide-react";
import { Priority } from "@/types/task";

interface AddTaskInputProps {
  onAdd: (title: string, priority: Priority) => void;
}

const AddTaskInput = ({ onAdd }: AddTaskInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>(4);

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title.trim(), priority);
      setTitle("");
      setPriority(4);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") {
      setIsOpen(false);
      setTitle("");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
      >
        <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </span>
        <span>Add task</span>
      </button>
    );
  }

  return (
    <div className="border border-border rounded-lg p-3 mx-1">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Task name"
        className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground mb-3"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {([1, 2, 3, 4] as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`w-6 h-6 rounded text-[10px] font-bold transition-colors ${
                priority === p
                  ? `bg-priority-${p} text-primary-foreground`
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              P{p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsOpen(false);
              setTitle("");
            }}
            className="px-3 py-1 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Add task
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskInput;
