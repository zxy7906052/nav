import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GroupWithSites } from "../types";

interface SortableGroupItemProps {
    id: string;
    group: GroupWithSites;
}

export default function SortableGroupItem({ id, group }: SortableGroupItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 9999 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group-draggable-item duration-0 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-transparent dark:border-slate-700/50 p-6 transition w-full hover:border-slate-300 dark:hover:border-slate-600 ${
                isDragging ? "ring-2 ring-sky-500" : ""
            }`}
            {...attributes}
            {...listeners}
        >
            <div className='flex items-center duration-0 cursor-grab active:cursor-grabbing'>
                <h2 className='text-2xl user-select-none duration-0 font-semibold text-slate-900 dark:text-white'>
                    {group.name}
                </h2>
            </div>
        </div>
    );
}
