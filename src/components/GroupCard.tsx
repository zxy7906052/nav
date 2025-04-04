import React, { useState } from "react";
import { Site } from "../API/http";
import SiteCard from "./SiteCard";
import { GroupWithSites } from "../types";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

// 更新组件属性接口
interface GroupCardProps {
    group: GroupWithSites;
    index?: number; // 用于Draggable的索引，仅在分组排序模式下需要
    sortMode: "None" | "GroupSort" | "SiteSort";
    currentSortingGroupId: number | null;
    onUpdate: (updatedSite: Site) => void;
    onDelete: (siteId: number) => void;
    onSaveSiteOrder: (groupId: number, sites: Site[]) => void;
    onStartSiteSort: (groupId: number) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
    group,
    sortMode,
    currentSortingGroupId,
    onUpdate,
    onDelete,
    onSaveSiteOrder,
    onStartSiteSort,
}) => {
    // 添加本地状态来管理站点排序
    const [sites, setSites] = useState<Site[]>(group.sites);

    // 配置传感器，支持鼠标、触摸和键盘操作
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px 的移动才激活拖拽，防止误触
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // 延迟250ms激活，防止误触
                tolerance: 5, // 容忍5px的移动
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 站点拖拽结束处理函数
    const handleSiteDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            // 查找拖拽的站点索引
            const oldIndex = sites.findIndex(site => `site-${site.id}` === active.id);
            const newIndex = sites.findIndex(site => `site-${site.id}` === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                // 更新本地站点顺序
                const newSites = arrayMove(sites, oldIndex, newIndex);
                setSites(newSites);
            }
        }
    };

    // 判断是否为当前正在编辑的分组
    const isCurrentEditingGroup = sortMode === "SiteSort" && currentSortingGroupId === group.id;

    // 渲染站点卡片区域
    const renderSites = () => {
        // 使用本地状态中的站点数据
        const sitesToRender = isCurrentEditingGroup ? sites : group.sites;

        // 如果当前不是正在编辑的分组且处于站点排序模式，不显示站点
        if (!isCurrentEditingGroup && sortMode === "SiteSort") {
            return null;
        }

        // 如果是编辑模式，使用DndContext包装
        if (isCurrentEditingGroup) {
            return (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSiteDragEnd}
                >
                    <SortableContext
                        items={sitesToRender.map(site => `site-${site.id}`)}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5'>
                            {sitesToRender.map((site, idx) => (
                                <SiteCard
                                    key={site.id || idx}
                                    site={site}
                                    onUpdate={onUpdate}
                                    onDelete={onDelete}
                                    isEditMode={true}
                                    index={idx}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            );
        }

        // 普通模式下的渲染
        return (
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5'>
                {sitesToRender.map(site => (
                    <SiteCard
                        key={site.id}
                        site={site}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        isEditMode={false}
                    />
                ))}
            </div>
        );
    };

    // 保存站点排序
    const handleSaveSiteOrder = () => {
        onSaveSiteOrder(group.id!, sites);
    };

    // 正常模式或站点排序模式下渲染完整的分组卡片
    return (
        <div
            className={`bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-transparent dark:border-slate-700/50 p-6 transition duration-300 ease-in-out ${
                sortMode === "None"
                    ? "hover:shadow-xl hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-600"
                    : "hover:border-slate-300 dark:hover:border-slate-600"
            }`}
        >
            <div className='flex justify-between items-center mb-5'>
                <h2 className='text-2xl font-semibold text-slate-900 dark:text-white'>
                    {group.name}
                </h2>
                <div className='flex items-center gap-2'>
                    {isCurrentEditingGroup ? (
                        <button
                            onClick={handleSaveSiteOrder}
                            className='px-3 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors'
                        >
                            保存顺序
                        </button>
                    ) : (
                        sortMode === "None" && (
                            <button
                                onClick={() => onStartSiteSort(group.id!)}
                                className='px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors'
                            >
                                排序
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* 站点卡片区域 */}
            {renderSites()}
        </div>
    );
};

export default GroupCard;
