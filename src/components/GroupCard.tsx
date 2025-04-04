import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Site, Group } from "../API/http";
import SiteCard from "./SiteCard";

// 扩展 Group 类型以包含站点信息
interface GroupWithSites extends Group {
    sites: Site[];
}

interface GroupCardProps {
    group: GroupWithSites;
    index?: number; // 用于Draggable的索引，仅在分组排序模式下需要
    sortMode: 'None' | 'GroupSort' | 'SiteSort';
    currentSortingGroupId: number | null;
    isDragging: boolean;
    onUpdate: (updatedSite: Site) => void;
    onDelete: (siteId: number) => void;
    onSaveSiteOrder: (groupId: number, sites: Site[]) => void;
    onStartSiteSort: (groupId: number) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
    group,
    index,
    sortMode,
    currentSortingGroupId,
    isDragging,
    onUpdate,
    onDelete,
    onSaveSiteOrder,
    onStartSiteSort,
}) => {
    // 如果是分组排序模式，渲染简单的分组卡片用于拖拽
    if (sortMode === 'GroupSort' && index !== undefined) {
        return (
            <Draggable draggableId={`group-${group.id}`} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`group-draggable-item bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-transparent dark:border-slate-700/50 p-6 transition w-full mb-4 ${
                            snapshot.isDragging ? 'opacity-75 shadow-xl border-sky-400' : 'hover:border-slate-300 dark:hover:border-slate-600'
                        } cursor-grab`}
                        style={{
                            ...provided.draggableProps.style,
                            marginBottom: snapshot.isDragging ? 0 : undefined,
                        }}
                    >
                        <div className="flex items-center">
                            <img src="/svg/up-down-arrows.svg" className="w-6 h-6 mr-3 text-slate-400" alt="上下拖拽箭头" />
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                                {group.name}
                            </h2>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    }

    // 判断是否为当前正在编辑的分组
    const isCurrentEditingGroup = sortMode === 'SiteSort' && currentSortingGroupId === group.id;

    // 渲染站点卡片区域
    const renderSites = () => {
        const sites = group.sites;

        // 如果当前不是正在编辑的分组且处于站点排序模式，不显示站点
        if (!isCurrentEditingGroup && sortMode === 'SiteSort') {
            return null;
        }

        // 在站点排序模式下使用Droppable，否则直接渲染
        if (!isCurrentEditingGroup) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {sites.map((site) => (
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
        }

        return (
            <Droppable 
                droppableId={`group-${group.id}`} 
                direction="horizontal"
            >
                {(provided) => (
                    <div 
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {sites.map((site, index) => (
                            <SiteCard
                                key={site.id}
                                site={site}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                isEditMode={true}
                                index={index}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        );
    };

    // 正常模式或站点排序模式下渲染完整的分组卡片
    return (
        <div
            className={`bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-transparent dark:border-slate-700/50 p-6 transition duration-300 ease-in-out ${
                sortMode === 'None' ? 'hover:shadow-xl hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-600' : 'hover:border-slate-300 dark:hover:border-slate-600'
            }`}
        >
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {group.name}
                </h2>
                <div className="flex items-center gap-2">
                    {isCurrentEditingGroup ? (
                        <button
                            onClick={() => onSaveSiteOrder(group.id!, group.sites)}
                            className="px-3 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                            disabled={isDragging}
                        >
                            保存顺序
                        </button>
                    ) : sortMode === 'None' && (
                        <button
                            onClick={() => onStartSiteSort(group.id!)}
                            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            排序
                        </button>
                    )}
                </div>
            </div>
            
            {/* 站点卡片区域 */}
            {renderSites()}
        </div>
    );
};

export default GroupCard; 