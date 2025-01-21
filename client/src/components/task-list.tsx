import { useProjects } from '@/hooks/use-projects';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@db/schema';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const { toggleTask } = useProjects();

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center space-x-2">
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) => {
              toggleTask({ taskId: task.id, completed: checked === true });
            }}
          />
          <label
            className={`text-sm ${
              task.completed ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {task.title}
          </label>
        </div>
      ))}
      {tasks.length === 0 && (
        <p className="text-sm text-muted-foreground">No tasks yet</p>
      )}
    </div>
  );
}
