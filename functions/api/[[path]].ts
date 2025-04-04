import { NavigationAPI } from "../../src/API/http";
import { D1Database } from "@cloudflare/workers-types";

interface Env {
    DB: D1Database;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace("/api/", "");
    const method = request.method;

    const api = new NavigationAPI(env);

    try {
        // 初始化数据库（如果需要）
        // await api.initDB();
        // 在路由匹配部分添加
        if (path === "init" && method === "GET") {
            await api.initDB();
            return new Response("数据库初始化成功", { status: 200 });
        }

        // 路由匹配
        if (path === "groups" && method === "GET") {
            const groups = await api.getGroups();
            return Response.json(groups);
        } else if (path.startsWith("groups/") && method === "GET") {
            const id = parseInt(path.split("/")[1]);
            const group = await api.getGroup(id);
            return Response.json(group);
        } else if (path === "groups" && method === "POST") {
            const data = await request.json();
            const result = await api.createGroup(data);
            return Response.json(result);
        } else if (path.startsWith("groups/") && method === "PUT") {
            const id = parseInt(path.split("/")[1]);
            const data = await request.json();
            const result = await api.updateGroup(id, data);
            return Response.json(result);
        } else if (path.startsWith("groups/") && method === "DELETE") {
            const id = parseInt(path.split("/")[1]);
            const result = await api.deleteGroup(id);
            return Response.json({ success: result });
        }
        // 站点相关API
        else if (path === "sites" && method === "GET") {
            const groupId = url.searchParams.get("groupId");
            const sites = await api.getSites(groupId ? parseInt(groupId) : undefined);
            return Response.json(sites);
        } else if (path.startsWith("sites/") && method === "GET") {
            const id = parseInt(path.split("/")[1]);
            const site = await api.getSite(id);
            return Response.json(site);
        } else if (path === "sites" && method === "POST") {
            const data = await request.json();
            const result = await api.createSite(data);
            return Response.json(result);
        } else if (path.startsWith("sites/") && method === "PUT") {
            const id = parseInt(path.split("/")[1]);
            const data = await request.json();
            const result = await api.updateSite(id, data);
            return Response.json(result);
        } else if (path.startsWith("sites/") && method === "DELETE") {
            const id = parseInt(path.split("/")[1]);
            const result = await api.deleteSite(id);
            return Response.json({ success: result });
        }
        // 批量更新排序
        else if (path === "group-orders" && method === "PUT") {
            const data = await request.json();
            const result = await api.updateGroupOrder(data);
            return Response.json({ success: result });
        } else if (path === "site-orders" && method === "PUT") {
            const data = await request.json();
            const result = await api.updateSiteOrder(data);
            return Response.json({ success: result });
        }

        // 默认返回404
        return new Response("Not Found", { status: 404 });
    } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
};
