import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../../api/api";
import "./KanbanBoard.css";

/* ---------------- DROPPABLE COLUMN ---------------- */
function ColumnDropArea({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`column-body ${isOver ? "column-over" : ""}`}
    >
      {children}
    </div>
  );
}

const isTaskAssignedToCurrentUser = (task, currentUser) => {
  if (!task || !currentUser) return false;

  const currentUserId = currentUser.id ? String(currentUser.id) : (localStorage.getItem("user_id") || "");
  const currentFirstName = (currentUser.first_name || "").toLowerCase().trim();
  const currentLastName = (currentUser.last_name || "").toLowerCase().trim();
  const currentFullName = `${currentFirstName} ${currentLastName}`.trim();
  const currentUsername = (currentUser.username || "").toLowerCase().trim();
  const currentEmail = (currentUser.email || "").toLowerCase().trim();
  const currentName = (currentUser.name || "").toLowerCase().trim();

  const assignedList = Array.isArray(task.assigned_to)
    ? task.assigned_to
    : task.assigned_to
    ? [task.assigned_to]
    : [];

  const matchesUser = (u) => {
    if (!u) return false;
    if (typeof u === "number" || typeof u === "string") {
      const uStr = String(u).trim().toLowerCase();
      if (currentUserId && uStr === String(currentUserId).toLowerCase()) return true;
      if (currentUsername && uStr === currentUsername) return true;
      if (currentFirstName && uStr === currentFirstName) return true;
      if (currentFullName && uStr === currentFullName) return true;
      if (currentName && uStr === currentName) return true;
      return false;
    }
    if (typeof u === "object") {
      if (u.id && currentUserId && String(u.id) === String(currentUserId)) return true;
      if (u.email && currentEmail && u.email.toLowerCase().trim() === currentEmail) return true;
      if (u.username && currentUsername && u.username.toLowerCase().trim() === currentUsername) return true;
      const uFirst = (u.first_name || "").toLowerCase().trim();
      const uLast = (u.last_name || "").toLowerCase().trim();
      const uFull = `${uFirst} ${uLast}`.trim();
      const uName = (u.name || "").toLowerCase().trim();

      if (currentFirstName && uFirst && uFirst === currentFirstName) return true;
      if (currentFullName && uFull && uFull === currentFullName) return true;
      if (currentName && (uName === currentName || uFull === currentName || uFirst === currentName)) return true;
      if (currentFirstName && uName && uName === currentFirstName) return true;
      return false;
    }
    return false;
  };

  if (assignedList.some(matchesUser)) return true;

  if (typeof task.assigned === "string" && task.assigned) {
    const assignedLower = task.assigned.toLowerCase().trim();
    if (currentFirstName && (assignedLower === currentFirstName || assignedLower.includes(currentFirstName))) return true;
    if (currentFullName && (assignedLower === currentFullName || assignedLower.includes(currentFullName))) return true;
    if (currentUsername && (assignedLower === currentUsername || assignedLower.includes(currentUsername))) return true;
    if (currentName && (assignedLower === currentName || assignedLower.includes(currentName))) return true;
  }

  return false;
};

/* ---------------- SORTABLE CARD ---------------- */
function SortableCard({ id, card }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${card?.isAssignedToCurrentUser ? "my-task" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="card-content">
        <h4>{card.title}</h4>
        <p><b>Assigned:</b> {card.assigned || "Unassigned"} </p>
        <p><b>Priority:</b> {card.priority}</p>
        <p>
          <b>Due Date:</b>{" "}
          {card.due_date
            ? new Date(card.due_date).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              )
            : "-"}
        </p>
      </div>
    </div>
  );
}

/* ---------------- MAIN KANBAN ---------------- */
export default function KanbanDndKit({ tasks }) {
  const [state, setState] = useState({
    columns: { todo: [], inprogress: [], pending: [], done: [] },
    cards: {},
    columnOrder: ["todo", "inprogress", "pending", "done"],
  });

  /* ---------- BUILD STATE FROM BACKEND ---------- */
  useEffect(() => {
    const cards = {};
    const cols = { todo: [], inprogress: [], pending: [], done: [] };
    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      currentUser = {};
    }

    tasks.forEach((task) => {
      const id = task.id.toString();

      cards[id] = {
        title: task.task_name,
        assigned: task.assigned_to?.map(
          u => u.first_name || u.username
        ).join(", ") || "Unassigned",
        priority: task.priority,
        due_date: task.due_date,
        isAssignedToCurrentUser: isTaskAssignedToCurrentUser(task, currentUser),
      };

      if (task.status === "In Progress") cols.inprogress.push(id);
      else if (task.status === "Pending") cols.pending.push(id);
      else if (task.status === "Completed") cols.done.push(id);
      else cols.todo.push(id);
    });

    setState({
      cards,
      columns: cols,
      columnOrder: ["todo", "inprogress", "pending", "done"],
    });
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor));

  const findColumnByCardId = (id) =>
    Object.keys(state.columns).find((col) =>
      state.columns[col].includes(id)
    );

  /* ---------- DRAG END ---------- */
  const onDragEnd = async ({ active, over }) => {
    if (!over) return;

    const taskId = active.id;
    const sourceCol = findColumnByCardId(taskId);
    const destCol = state.columns[over.id]
      ? over.id
      : findColumnByCardId(over.id);

    if (!sourceCol || sourceCol === destCol) return;

    const statusMap = {
      todo: "To Do",
      inprogress: "In Progress",
      pending: "Pending",
      done: "Completed",
    };

    try {
      await api.patch(`/admin_app/kanban/tasks/${taskId}/status/`, {
        status: statusMap[destCol],
      });

      window.dispatchEvent(
        new Event("task-status-updated")
      );
      setState((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [sourceCol]: prev.columns[sourceCol].filter((id) => id !== taskId),
          [destCol]: [...prev.columns[destCol], taskId],
        },
      }));
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <div className="kanban-grid">
        {state.columnOrder.map((colId) => (
          <div key={colId} className="kanban-column">
            <div className="column-header">
              <h3>{colId.toUpperCase()}</h3>
            </div>

            <ColumnDropArea id={colId}>
              <SortableContext
                items={state.columns[colId]}
                strategy={rectSortingStrategy}
              >
                {state.columns[colId].map((cardId) => (
                  <SortableCard
                    key={cardId}
                    id={cardId}
                    card={state.cards[cardId]}
                  />
                ))}
              </SortableContext>

              {state.columns[colId].length === 0 && (
                <div className="kanban-card empty-card">No tasks</div>
              )}
            </ColumnDropArea>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
