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
import "./UserKanban.css";

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
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    const getPriorityClass = (priority) => {
        if (!priority) return "priority-low";
        return `priority-${priority.toLowerCase()}`;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="kanban-card"
            {...attributes}
            {...listeners}
        >
            <div className="card-content">
                <h4 className="card-title">{card.title}</h4>
                <div className="card-meta">
                    <div className="meta-item">
                        <span className="meta-val">{card.project || "Internal Task"}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-val">Due: {card.due_date || "No deadline"}</span>
                    </div>
                </div>
                <div className={`priority-badge ${getPriorityClass(card.priority)}`}>
                    {card.priority || "Low"}
                </div>
            </div>
        </div>
    );
}

/* ---------------- MAIN KANBAN ---------------- */
export default function UserKanbanDnd({ tasks }) {
    const [state, setState] = useState({
        columns: { "To Do": [], "In Progress": [], "Pending": [], "Completed": [] },
        cards: {},
        columnOrder: ["To Do", "In Progress", "Pending", "Completed"],
    });

    /* ---------- BUILD STATE FROM BACKEND ---------- */
    useEffect(() => {
        const cards = {};
        const cols = { "To Do": [], "In Progress": [], "Pending": [], "Completed": [] };

        tasks.forEach((task) => {
            const id = task.id.toString();

            cards[id] = {
                title: task.task_name,
                priority: task.priority,
                project: task.project_name,
                due_date: task.due_date ? task.due_date.slice(0, 10) : null
            };

            const status = task.status || "To Do";
            if (cols[status]) {
                cols[status].push(id);
            } else {
                cols["To Do"].push(id);
            }
        });

        setState({
            cards,
            columns: cols,
            columnOrder: ["To Do", "In Progress", "Pending", "Completed"],
        });
    }, [tasks]);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }));

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

        try {
            await api.patch(`/admin_app/kanban/tasks/${taskId}/status/`, {
                status: destCol,
            });

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
                            <h3>{colId}</h3>
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
                                <div className="empty-card">No tasks here</div>
                            )}
                        </ColumnDropArea>
                    </div>
                ))}
            </div>
        </DndContext>
    );
}
