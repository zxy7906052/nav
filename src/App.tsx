import { useState, useEffect } from "react";
import { NavigationClient } from "./API/client";
import { MockNavigationClient } from "./API/mock";
import { Group, Site } from "./API/http";
import SiteCard from "./components/SiteCard";
import ThemeToggle from "./components/ThemeToggle";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import "./App.css";

// 根据环境选择使用真实API还是模拟API
const isDevEnvironment = import.meta.env.DEV;
const useRealApi = import.meta.env.VITE_USE_REAL_API === "true";

const api =
    isDevEnvironment && !useRealApi
        ? new MockNavigationClient()
        : new NavigationClient(isDevEnvironment ? "http://localhost:8788/api" : "/api");

// 扩展 Group 类型以包含站点信息
interface GroupWithSites extends Group {
    sites: Site[];
}

// 排序模式枚举
enum SortMode {
    None,        // 不排序
    GroupSort,   // 分组排序
    SiteSort     // 站点排序
}

// 为防止在拖拽过程中元素重新渲染，使用固定的droppableId
const GROUPS_DROPPABLE_ID = "groups-droppable";

function App() {
    const [groups, setGroups] = useState<GroupWithSites[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<SortMode>(SortMode.None);
    const [currentSortingGroupId, setCurrentSortingGroupId] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        fetchData();
        // 确保初始化时重置排序状态
        setSortMode(SortMode.None);
        setCurrentSortingGroupId(null);
        setIsDragging(false);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const groupsData = await api.getGroups();
            
            // 获取每个分组的站点
            const groupsWithSites = await Promise.all(
                groupsData.map(async (group) => {
                    const sites = await api.getSites(group.id);
                    return {
                        ...group,
                        sites
                    };
                })
            );
            
            setGroups(groupsWithSites);
        } catch (error) {
            console.error("加载数据失败:", error);
            setError("加载数据失败: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleSiteUpdate = async (updatedSite: Site) => {
        try {
            if (updatedSite.id) {
                await api.updateSite(updatedSite.id, updatedSite);
                await fetchData(); // 重新加载数据
            }
        } catch (error) {
            console.error("更新站点失败:", error);
            setError("更新站点失败: " + (error as Error).message);
        }
    };

    const handleSiteDelete = async (siteId: number) => {
        try {
            await api.deleteSite(siteId);
            await fetchData(); // 重新加载数据
        } catch (error) {
            console.error("删除站点失败:", error);
            setError("删除站点失败: " + (error as Error).message);
        }
    };

    // 保存站点排序
    const handleSaveSiteOrder = async (groupId: number, sites: Site[]) => {
        try {
            const siteOrders = sites.map((site, index) => ({
                id: site.id!,
                order_num: index
            }));
            
            await api.updateSiteOrder(siteOrders);
            await fetchData(); // 重新加载数据
            // 退出排序模式
            setSortMode(SortMode.None);
            setCurrentSortingGroupId(null);
        } catch (error) {
            console.error("更新站点排序失败:", error);
            setError("更新站点排序失败: " + (error as Error).message);
        }
    };

    // 保存分组排序
    const handleSaveGroupOrder = async () => {
        try {
            const groupOrders = groups.map((group, index) => ({
                id: group.id!,
                order_num: index
            }));
            
            await api.updateGroupOrder(groupOrders);
            await fetchData(); // 重新加载数据
            // 退出排序模式
            setSortMode(SortMode.None);
        } catch (error) {
            console.error("更新分组排序失败:", error);
            setError("更新分组排序失败: " + (error as Error).message);
        }
    };

    // 处理开始拖拽
    const handleDragStart = () => {
        setIsDragging(true);
    };

    // 处理拖拽结束
    const handleDragEnd = (result: DropResult) => {
        setIsDragging(false);
        const { destination, source } = result;
        
        // 如果没有目标位置或没有移动，直接返回
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        // 处理分组排序
        if (sortMode === SortMode.GroupSort && destination.droppableId === GROUPS_DROPPABLE_ID) {
            const newGroups = Array.from(groups);
            const [movedGroup] = newGroups.splice(source.index, 1);
            newGroups.splice(destination.index, 0, movedGroup);
            setGroups(newGroups);
            return;
        }

        // 处理站点排序
        if (sortMode === SortMode.SiteSort && currentSortingGroupId !== null) {
            // 确保是当前正在排序的分组
            const groupId = parseInt(destination.droppableId.replace('group-', ''));
            if (groupId !== currentSortingGroupId) return;
            
            // 查找分组索引
            const groupIndex = groups.findIndex(g => g.id === groupId);
            if (groupIndex === -1) return;
            
            // 创建新的数组以更新状态
            const newGroups = [...groups];
            const sites = [...newGroups[groupIndex].sites];
            
            // 移动站点位置
            const [movedItem] = sites.splice(source.index, 1);
            sites.splice(destination.index, 0, movedItem);
            
            newGroups[groupIndex].sites = sites;
            setGroups(newGroups);
        }
    };

    // 启动分组排序
    const startGroupSort = () => {
        setSortMode(SortMode.GroupSort);
        setCurrentSortingGroupId(null);
    };

    // 启动站点排序
    const startSiteSort = (groupId: number) => {
        setSortMode(SortMode.SiteSort);
        setCurrentSortingGroupId(groupId);
    };

    // 取消排序
    const cancelSort = () => {
        setSortMode(SortMode.None);
        setCurrentSortingGroupId(null);
        fetchData(); // 重新加载数据，恢复原始顺序
    };

    // 渲染分组卡片 - 提取为单独函数以避免在拖拽过程中重新渲染
    const renderGroup = (group: GroupWithSites, index: number) => (
        <Draggable key={`group-${group.id}`} draggableId={`group-${group.id}`} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-transparent dark:border-slate-700/50 p-6 transition duration-300 ease-in-out hover:border-slate-300 dark:hover:border-slate-600 cursor-grab"
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

    // 渲染站点卡片区域 - 提取为单独函数以避免在拖拽过程中重新渲染
    const renderSites = (group: GroupWithSites) => {
        const isCurrentEditingGroup = sortMode === SortMode.SiteSort && currentSortingGroupId === group.id;
        
        // 只有当前正在编辑的分组显示其卡片，或者在非编辑模式下
        if (!isCurrentEditingGroup && sortMode === SortMode.SiteSort) {
            return null;
        }

        return (
            <Droppable 
                droppableId={`group-${group.id}`} 
                direction="horizontal"
                isDropDisabled={!isCurrentEditingGroup}
                isCombineEnabled={false}
            >
                {(provided) => (
                    <div 
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {group.sites.map((site, index) => (
                            <SiteCard
                                key={site.id}
                                site={site}
                                onUpdate={handleSiteUpdate}
                                onDelete={handleSiteDelete}
                                isEditMode={isCurrentEditingGroup}
                                index={index}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        );
    };

    return (
        <DragDropContext 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                    <div className="flex justify-between items-center mb-10">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">导航站</h1>
                        <div className="flex items-center gap-4">
                            {sortMode !== SortMode.None ? (
                                <>
                                    {sortMode === SortMode.GroupSort && (
                                        <button
                                            onClick={handleSaveGroupOrder}
                                            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                                            disabled={isDragging}
                                        >
                                            保存分组顺序
                                        </button>
                                    )}
                                    <button
                                        onClick={cancelSort}
                                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                        disabled={isDragging}
                                    >
                                        取消编辑
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={startGroupSort}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    编辑排序
                                </button>
                            )}
                            <ThemeToggle />
                        </div>
                    </div>

                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-8" role="alert">
                            <strong className="font-bold">错误!</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {sortMode === SortMode.GroupSort ? (
                                // 分组排序模式
                                <Droppable 
                                    droppableId={GROUPS_DROPPABLE_ID}
                                    isCombineEnabled={false}
                                >
                                    {(provided) => (
                                        <div
                                            className="space-y-6"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {groups.map((group, index) => renderGroup(group, index))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            ) : (
                                // 普通模式或站点排序模式
                                <div className="space-y-10">
                                    {groups.map(group => (
                                        <div
                                            key={group.id}
                                            className={`bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-transparent dark:border-slate-700/50 p-6 transition duration-300 ease-in-out ${
                                                sortMode === SortMode.None ? 'hover:shadow-xl hover:scale-[1.01]' : ''
                                            } hover:border-slate-300 dark:hover:border-slate-600`}
                                        >
                                            <div className="flex justify-between items-center mb-5">
                                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                                                    {group.name}
                                                </h2>
                                                <div className="flex items-center gap-2">
                                                    {sortMode === SortMode.SiteSort && currentSortingGroupId === group.id ? (
                                                        <button
                                                            onClick={() => handleSaveSiteOrder(group.id!, group.sites)}
                                                            className="px-3 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                                                            disabled={isDragging}
                                                        >
                                                            保存顺序
                                                        </button>
                                                    ) : sortMode === SortMode.None && (
                                                        <button
                                                            onClick={() => startSiteSort(group.id!)}
                                                            className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                                        >
                                                            排序
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* 站点卡片区域 */}
                                            {renderSites(group)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* GitHub角标 - 样式微调 */}
                    <div className="fixed bottom-4 right-4 z-10">
                        <a
                            href="https://github.com/zqq-nuli/Navihive"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center bg-white dark:bg-slate-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            aria-label="View source on GitHub"
                        >
                            <img src="/svg/github.svg" className="w-6 h-6" alt="GitHub" />
                            {/* <span className="text-sm font-medium ml-2 hidden sm:inline">GitHub</span> */}
                        </a>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}

export default App;
