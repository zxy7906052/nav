import { Group, Site } from "./http";

export class NavigationClient {
    private baseUrl: string;

    constructor(baseUrl = "/api") {
        this.baseUrl = baseUrl;
    }

    private async request(endpoint: string, options = {}) {
        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API错误: ${response.status}`);
        }

        return response.json();
    }

    // 分组相关API
    async getGroups(): Promise<Group[]> {
        return this.request("groups");
    }

    async getGroup(id: number): Promise<Group | null> {
        return this.request(`groups/${id}`);
    }

    async createGroup(group: Group): Promise<Group> {
        return this.request("groups", {
            method: "POST",
            body: JSON.stringify(group),
        });
    }

    async updateGroup(id: number, group: Partial<Group>): Promise<Group | null> {
        return this.request(`groups/${id}`, {
            method: "PUT",
            body: JSON.stringify(group),
        });
    }

    async deleteGroup(id: number): Promise<boolean> {
        const response = await this.request(`groups/${id}`, {
            method: "DELETE",
        });
        return response.success;
    }

    // 网站相关API
    async getSites(groupId?: number): Promise<Site[]> {
        const endpoint = groupId ? `sites?groupId=${groupId}` : "sites";
        return this.request(endpoint);
    }

    async getSite(id: number): Promise<Site | null> {
        return this.request(`sites/${id}`);
    }

    async createSite(site: Site): Promise<Site> {
        return this.request("sites", {
            method: "POST",
            body: JSON.stringify(site),
        });
    }

    async updateSite(id: number, site: Partial<Site>): Promise<Site | null> {
        return this.request(`sites/${id}`, {
            method: "PUT",
            body: JSON.stringify(site),
        });
    }

    async deleteSite(id: number): Promise<boolean> {
        const response = await this.request(`sites/${id}`, {
            method: "DELETE",
        });
        return response.success;
    }

    // 批量更新排序
    async updateGroupOrder(groupOrders: { id: number; order: number }[]): Promise<boolean> {
        const response = await this.request("group-orders", {
            method: "PUT",
            body: JSON.stringify(groupOrders),
        });
        return response.success;
    }

    async updateSiteOrder(siteOrders: { id: number; order: number }[]): Promise<boolean> {
        const response = await this.request("site-orders", {
            method: "PUT",
            body: JSON.stringify(siteOrders),
        });
        return response.success;
    }
}
