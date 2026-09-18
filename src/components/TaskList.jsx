import { useState } from 'react';
import TaskItem from './TaskItem';

export default function TaskList({
  tasks,
  manualOrder,
  tagColor,
  onToggle,
  onUpdate,
  onDelete,
  onFocusPomodoro,
  onReorder,
  emptyMessage,
}) {
  const [dragId, setDragId] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  if (tasks.length === 0) {
    return (
      <div className="empty-state glass">
        <div className="big">✨</div>
        {emptyMessage || 'Nothing here. Enjoy the quiet.'}
      </div>
    );
  }
//For the hanlde todo for testing Deployment
  function handleDrop(targetId) {
    if (manualOrder && dragId !== null && dragId !== targetId) {
      onReorder(dragId, targetId);
    }
    setDragId(null);
    setOverIndex(null);
  }

  return (
    <div className="task-list">
      {tasks.map((task, i) => (
        <TaskItem
          key={task.id}
          task={task}
          tagColor={tagColor}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onFocusPomodoro={onFocusPomodoro}
          dragProps={
            manualOrder
              ? {
                  draggable: true,
                  isDragging: dragId === task.id,
                  isDropTarget: overIndex === i && dragId !== task.id,
                  onDragStart: () => setDragId(task.id),
                  onDragOver: (e) => {
                    e.preventDefault();
                    setOverIndex(i);
                  },
                  onDrop: () => handleDrop(task.id),
                  onDragEnd: () => {
                    setDragId(null);
                    setOverIndex(null);
                  },
                }
              : null
          }
        />
      ))}
    </div>
  );
}
