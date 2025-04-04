import { useState, useEffect } from "react";
import { NavigationClient } from "./API/client";
import { MockNavigationClient } from "./API/mock";
import { Group } from "./API/http";
import "./App.css";

// 根据环境选择使用真实API还是模拟API
const isDevEnvironment = import.meta.env.DEV;
const useRealApi = import.meta.env.VITE_USE_REAL_API === "true";

const api =
    isDevEnvironment && !useRealApi
        ? new MockNavigationClient()
        : new NavigationClient(isDevEnvironment ? "http://localhost:8788/api" : "/api");

function App() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 使用新的客户端API
            const groupsData = await api.getGroups();
            setGroups(groupsData);
        } catch (error) {
            console.error("加载数据失败:", error);
            setError("加载数据失败: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>导航站</h1>

            {loading && <p>加载中...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && (
                <div>
                    {groups.map(group => (
                        <div key={group.id}>
                            <h2>{group.name}</h2>
                            {/* 这里可以添加显示站点的代码 */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
