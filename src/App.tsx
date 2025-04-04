import { useState, useEffect, useCallback, useMemo } from "react";
import { NavigationClient } from "./API/client";
import { MockNavigationClient } from "./API/mock";
import { Group, Site } from "./API/http";
import ThemeToggle from "./components/ThemeToggle";
import GroupCard from "./components/GroupCard";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
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
    None, // 不排序
    GroupSort, // 分组排序
    SiteSort, // 站点排序
}

// 为防止在拖拽过程中元素重新渲染，使用固定的droppableId
const GROUPS_DROPPABLE_ID = "groups-droppable";

// 最小化重渲染的排序处理函数
const reorderGroups = (list: GroupWithSites[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

function App() {
    const [groups, setGroups] = useState<GroupWithSites[]>([]);
    // 添加暂存状态，用于记录排序变化但不立即影响真实数据
    const [tempGroups, setTempGroups] = useState<GroupWithSites[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<SortMode>(SortMode.None);
    const [currentSortingGroupId, setCurrentSortingGroupId] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    // 添加状态标记是否有未保存的排序变更
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        fetchData();
        // 确保初始化时重置排序状态
        setSortMode(SortMode.None);
        setCurrentSortingGroupId(null);
        setIsDragging(false);
        setHasUnsavedChanges(false);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const groupsData = await api.getGroups();

            // 获取每个分组的站点
            const groupsWithSites = await Promise.all(
                groupsData.map(async group => {
                    const sites = await api.getSites(group.id);
                    return {
                        ...group,
                        sites,
                    };
                })
            );

            setGroups(groupsWithSites);
            setTempGroups(groupsWithSites); // 同步初始化临时状态
            setHasUnsavedChanges(false);
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
                order_num: index,
            }));

            await api.updateSiteOrder(siteOrders);
            await fetchData(); // 重新加载数据
            // 退出排序模式
            setSortMode(SortMode.None);
            setCurrentSortingGroupId(null);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error("更新站点排序失败:", error);
            setError("更新站点排序失败: " + (error as Error).message);
        }
    };

    // 保存分组排序
    const handleSaveGroupOrder = async () => {
        try {
            // 使用临时状态中的顺序进行保存
            const groupOrders = tempGroups.map((group, index) => ({
                id: group.id!,
                order_num: index,
            }));

            await api.updateGroupOrder(groupOrders);
            await fetchData(); // 重新加载数据
            // 退出排序模式
            setSortMode(SortMode.None);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error("更新分组排序失败:", error);
            setError("更新分组排序失败: " + (error as Error).message);
        }
    };

    // 使用useCallback包装事件处理函数以减少不必要的重新渲染
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    // 处理拖拽结束
    const handleDragEnd = (result: DropResult) => {
        console.log("handleDragEnd", result);
        setIsDragging(false);

        const { destination, source } = result;

        // 如果没有目标位置或没有移动，直接返回
        if (
            !destination ||
            (destination.droppableId === source.droppableId && destination.index === source.index)
        ) {
            return;
        }

        // 处理分组排序 - 只更新暂存状态，不更新真实数据
        if (sortMode === SortMode.GroupSort && destination.droppableId === GROUPS_DROPPABLE_ID) {
            setTempGroups(prevGroups => reorderGroups(prevGroups, source.index, destination.index));
            setHasUnsavedChanges(true);
            return;
        }

        // 处理站点排序 - 同样只更新暂存状态
        if (sortMode === SortMode.SiteSort && currentSortingGroupId !== null) {
            // 确保是当前正在排序的分组
            const groupId = parseInt(destination.droppableId.replace("group-", ""));
            if (groupId !== currentSortingGroupId) return;

            // 查找分组索引
            setTempGroups(prevGroups => {
                const groupIndex = prevGroups.findIndex(g => g.id === groupId);
                if (groupIndex === -1) return prevGroups;

                // 创建新的数组以更新状态
                const newGroups = [...prevGroups];
                const sites = [...newGroups[groupIndex].sites];

                // 移动站点位置
                const [movedItem] = sites.splice(source.index, 1);
                sites.splice(destination.index, 0, movedItem);

                newGroups[groupIndex] = {
                    ...newGroups[groupIndex],
                    sites: sites,
                };

                return newGroups;
            });
            setHasUnsavedChanges(true);
        }
    };

    // 启动分组排序
    const startGroupSort = () => {
        // 启动排序时，将当前groups复制到临时状态
        setTempGroups([...groups]);
        setSortMode(SortMode.GroupSort);
        setCurrentSortingGroupId(null);
        setHasUnsavedChanges(false);
    };

    // 启动站点排序
    const startSiteSort = (groupId: number) => {
        // 启动站点排序时，也将当前groups复制到临时状态
        setTempGroups([...groups]);
        setSortMode(SortMode.SiteSort);
        setCurrentSortingGroupId(groupId);
        setHasUnsavedChanges(false);
    };

    // 取消排序
    const cancelSort = () => {
        setSortMode(SortMode.None);
        setCurrentSortingGroupId(null);
        setHasUnsavedChanges(false);
        // 不再需要重新获取数据，直接使用原始状态
        setTempGroups([...groups]);
    };

    // 使用useMemo缓存分组内容，避免无谓的重渲染
    const groupsContent = useMemo(() => {
        if (loading || error) return null;

        // 在排序模式下使用临时状态数据，否则使用实际数据
        const displayGroups = sortMode !== SortMode.None ? tempGroups : groups;

        if (sortMode === SortMode.GroupSort) {
            return (
                <Droppable droppableId={GROUPS_DROPPABLE_ID} direction='vertical' type='group'>
                    {provided => (
                        <div
                            className='w-full space-y-6 groups-container'
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {displayGroups.map((group, index) => (
                                <GroupCard
                                    key={`group-${group.id}`}
                                    group={group}
                                    index={index}
                                    sortMode={"GroupSort"}
                                    currentSortingGroupId={currentSortingGroupId}
                                    isDragging={isDragging}
                                    onUpdate={handleSiteUpdate}
                                    onDelete={handleSiteDelete}
                                    onSaveSiteOrder={handleSaveSiteOrder}
                                    onStartSiteSort={startSiteSort}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            );
        }

        return (
            <div className='space-y-10 w-full' style={{ minHeight: "100px" }}>
                {displayGroups.map(group => (
                    <GroupCard
                        key={`group-${group.id}`}
                        group={group}
                        sortMode={sortMode === SortMode.None ? "None" : "SiteSort"}
                        currentSortingGroupId={currentSortingGroupId}
                        isDragging={isDragging}
                        onUpdate={handleSiteUpdate}
                        onDelete={handleSiteDelete}
                        onSaveSiteOrder={handleSaveSiteOrder}
                        onStartSiteSort={startSiteSort}
                    />
                ))}
            </div>
        );
    }, [
        tempGroups,
        groups,
        sortMode,
        currentSortingGroupId,
        isDragging,
        loading,
        error,
        startSiteSort,
    ]);

    return (
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className='min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300'>
                <div className='container mx-auto w-5xl overflow-hidden relative px-4 sm:px-6 lg:px-8 py-10 sm:py-12'>
                    <div className='flex justify-between items-center mb-10'>
                        <h1 className='text-4xl font-bold text-slate-900 dark:text-white'>
                            导航站
                        </h1>
                        <div className='flex items-center gap-4 relative'>
                            {sortMode !== SortMode.None ? (
                                <>
                                    {sortMode === SortMode.GroupSort && (
                                        <button
                                            onClick={handleSaveGroupOrder}
                                            className='px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors'
                                            disabled={isDragging || !hasUnsavedChanges}
                                        >
                                            保存分组顺序
                                        </button>
                                    )}
                                    <button
                                        onClick={cancelSort}
                                        className='px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors'
                                        disabled={isDragging}
                                    >
                                        取消编辑
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={startGroupSort}
                                    className='px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors'
                                >
                                    编辑排序
                                </button>
                            )}
                            <ThemeToggle />
                        </div>
                    </div>

                    {loading && (
                        <div className='flex justify-center items-center h-64'>
                            <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500'></div>
                        </div>
                    )}

                    {error && (
                        <div
                            className='bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-8'
                            role='alert'
                        >
                            <strong className='font-bold'>错误!</strong>
                            <span className='block sm:inline ml-2'>{error}</span>
                        </div>
                    )}

                    {!loading && !error && groupsContent}

                    {/* GitHub角标 - 样式微调 */}
                    <div className='fixed bottom-4 right-4 z-10'>
                        <a
                            href='https://github.com/zqq-nuli/Navihive'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center bg-white dark:bg-slate-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            aria-label='View source on GitHub'
                        >
                            <img src='/svg/github.svg' className='w-6 h-6' alt='GitHub' />
                            {/* <span className="text-sm font-medium ml-2 hidden sm:inline">GitHub</span> */}
                        </a>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}

export default App;
