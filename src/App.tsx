import { useState, useEffect } from "react";
import { NavigationClient } from "./API/client";
import { MockNavigationClient } from "./API/mock";
import { Group, Site } from "./API/http";
import SiteCard from "./components/SiteCard";
import ThemeToggle from "./components/ThemeToggle";
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

function App() {
    const [groups, setGroups] = useState<GroupWithSites[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
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

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">导航站</h1>
                    <ThemeToggle />
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
                    <div className="space-y-10">
                        {groups.map(group => (
                            <div
                                key={group.id}
                                className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-transparent dark:border-slate-700/50 p-6 transition duration-300 ease-in-out hover:shadow-xl hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-600"
                            >
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-5">
                                    {group.name}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                    {group.sites.map(site => (
                                        <SiteCard
                                            key={site.id}
                                            site={site}
                                            onUpdate={handleSiteUpdate}
                                            onDelete={handleSiteDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
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
                        <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {/* <span className="text-sm font-medium ml-2 hidden sm:inline">GitHub</span> */}
                    </a>
                </div>
            </div>
        </div>
    );
}

export default App;
