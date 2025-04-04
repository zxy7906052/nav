import { useState, useEffect } from "react";
import { NavigationClient } from "./API/client";
import { MockNavigationClient } from "./API/mock";
import { Site } from "./API/http";
import { GroupWithSites } from "./types";
import ThemeToggle from "./components/ThemeToggle";
import GroupCard from "./components/GroupCard";
import "./App.css";
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
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableGroupItem from "./components/SortableGroupItem";

// 根据环境选择使用真实API还是模拟API
const isDevEnvironment = import.meta.env.DEV;
const useRealApi = import.meta.env.VITE_USE_REAL_API === "true";

const api =
    isDevEnvironment && !useRealApi
        ? new MockNavigationClient()
        : new NavigationClient(isDevEnvironment ? "http://localhost:8788/api" : "/api");

// 排序模式枚举
enum SortMode {
    None, // 不排序
    GroupSort, // 分组排序
    SiteSort, // 站点排序
}

function App() {
    const [groups, setGroups] = useState<GroupWithSites[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<SortMode>(SortMode.None);
    const [currentSortingGroupId, setCurrentSortingGroupId] = useState<number | null>(null);

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

    useEffect(() => {
        fetchData();
        // 确保初始化时重置排序状态
        setSortMode(SortMode.None);
        setCurrentSortingGroupId(null);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const groupsData = await api.getGroups();

            // 获取每个分组的站点并确保id存在
            const groupsWithSites = await Promise.all(
                groupsData
                    .filter(group => group.id !== undefined) // 过滤掉没有id的分组
                    .map(async group => {
                        const sites = await api.getSites(group.id);
                        return {
                            ...group,
                            id: group.id as number, // 确保id不为undefined
                            sites,
                        } as GroupWithSites;
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

    // 更新站点
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

    // 删除站点
    const handleSiteDelete = async (siteId: number) => {
        try {
            await api.deleteSite(siteId);
            await fetchData(); // 重新加载数据
        } catch (error) {
            console.error("删除站点失败:", error);
            setError("删除站点失败: " + (error as Error).message);
        }
    };

    // 保存分组排序
    const handleSaveGroupOrder = async () => {
        try {
            console.log("保存分组顺序", groups);
            // 构造需要更新的分组顺序数据
            const groupOrders = groups.map((group, index) => ({
                id: group.id as number, // 断言id为number类型
                order_num: index,
            }));

            // 调用API更新分组顺序
            const result = await api.updateGroupOrder(groupOrders);

            if (result) {
                console.log("分组排序更新成功");
                // 重新获取最新数据
                await fetchData();
            } else {
                throw new Error("分组排序更新失败");
            }

            setSortMode(SortMode.None);
            setCurrentSortingGroupId(null);
        } catch (error) {
            console.error("更新分组排序失败:", error);
            setError("更新分组排序失败: " + (error as Error).message);
        }
    };

    // 保存站点排序
    const handleSaveSiteOrder = async (groupId: number, sites: Site[]) => {
        try {
            console.log("保存站点排序", groupId, sites);

            // 构造需要更新的站点顺序数据
            const siteOrders = sites.map((site, index) => ({
                id: site.id as number,
                order_num: index,
            }));

            // 调用API更新站点顺序
            const result = await api.updateSiteOrder(siteOrders);

            if (result) {
                console.log("站点排序更新成功");
                // 重新获取最新数据
                await fetchData();
            } else {
                throw new Error("站点排序更新失败");
            }

            setSortMode(SortMode.None);
            setCurrentSortingGroupId(null);
        } catch (error) {
            console.error("更新站点排序失败:", error);
            setError("更新站点排序失败: " + (error as Error).message);
        }
    };

    // 启动分组排序
    const startGroupSort = () => {
        console.log("开始分组排序");
        setSortMode(SortMode.GroupSort);
        setCurrentSortingGroupId(null);
    };

    // 启动站点排序
    const startSiteSort = (groupId: number) => {
        console.log("开始站点排序");
        setSortMode(SortMode.SiteSort);
        setCurrentSortingGroupId(groupId);
    };

    // 取消排序
    const cancelSort = () => {
        setSortMode(SortMode.None);
        setCurrentSortingGroupId(null);
    };

    // 处理拖拽结束事件
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = groups.findIndex(group => group.id.toString() === active.id);
            const newIndex = groups.findIndex(group => group.id.toString() === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                setGroups(arrayMove(groups, oldIndex, newIndex));
            }
        }
    };

    return (
        <div className='min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300'>
            <div className='container mx-auto w-5xl  relative px-4 sm:px-6 lg:px-8 py-10 sm:py-12'>
                <div className='flex justify-between items-center mb-10'>
                    <h1 className='text-4xl font-bold text-slate-900 dark:text-white'>导航站</h1>
                    <div className='flex items-center gap-4 relative'>
                        {sortMode !== SortMode.None ? (
                            <>
                                {sortMode === SortMode.GroupSort && (
                                    <button
                                        onClick={handleSaveGroupOrder}
                                        className='px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors'
                                    >
                                        保存分组顺序
                                    </button>
                                )}
                                <button
                                    onClick={cancelSort}
                                    className='px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors'
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

                {!loading && !error && (
                    <div className='space-y-10 w-full duration-0' style={{ minHeight: "100px" }}>
                        {sortMode === SortMode.GroupSort ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={groups.map(group => group.id.toString())}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className='space-y-4 duration-0'>
                                        {groups.map(group => (
                                            <SortableGroupItem
                                                key={group.id}
                                                id={group.id.toString()}
                                                group={group}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <>
                                {groups.map(group => (
                                    <GroupCard
                                        key={`group-${group.id}`}
                                        group={group}
                                        sortMode={sortMode === SortMode.None ? "None" : "SiteSort"}
                                        currentSortingGroupId={currentSortingGroupId}
                                        onUpdate={handleSiteUpdate}
                                        onDelete={handleSiteDelete}
                                        onSaveSiteOrder={handleSaveSiteOrder}
                                        onStartSiteSort={startSiteSort}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                )}

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
    );
}

export default App;
