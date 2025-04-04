import { Group, Site } from "./http";

// 模拟数据
const mockGroups: Group[] = [
    {
        id: 1,
        name: "常用工具",
        order_num: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
    },
    {
        id: 2,
        name: "开发资源",
        order_num: 2,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
    }
];

const mockSites: Site[] = [
    {
        id: 1,
        group_id: 1,
        name: "Google",
        url: "https://www.google.com",
        icon: "google.png",
        description: "搜索引擎",
        notes: "",
        order_num: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
    },
    {
        id: 2,
        group_id: 1,
        name: "GitHub",
        url: "https://github.com",
        icon: "github.png",
        description: "代码托管平台",
        notes: "",
        order_num: 2,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
    }
];

// 模拟API实现
export class MockNavigationClient {
    async getGroups(): Promise<Group[]> {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 200));
        return [...mockGroups];
    }

    async getGroup(id: number): Promise<Group | null> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockGroups.find(g => g.id === id) || null;
    }

    async createGroup(group: Group): Promise<Group> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const newGroup = {
            ...group,
            id: Math.max(0, ...mockGroups.map(g => g.id || 0)) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockGroups.push(newGroup);
        return newGroup;
    }

    async updateGroup(id: number, group: Partial<Group>): Promise<Group | null> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const index = mockGroups.findIndex(g => g.id === id);
        if (index === -1) return null;

        mockGroups[index] = {
            ...mockGroups[index],
            ...group,
            updated_at: new Date().toISOString(),
        };
        return mockGroups[index];
    }

    async deleteGroup(id: number): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const index = mockGroups.findIndex(g => g.id === id);
        if (index === -1) return false;

        mockGroups.splice(index, 1);
        return true;
    }

    async getSites(groupId?: number): Promise<Site[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        if (groupId) {
            return mockSites.filter(site => site.group_id === groupId);
        }
        return [...mockSites];
    }

    // 实现其他方法，与NavigationClient保持一致的接口...
    async getSite(id: number): Promise<Site | null> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockSites.find(s => s.id === id) || null;
    }

    async createSite(site: Site): Promise<Site> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const newSite = {
            ...site,
            id: Math.max(0, ...mockSites.map(s => s.id || 0)) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockSites.push(newSite);
        return newSite;
    }

    async updateSite(id: number, site: Partial<Site>): Promise<Site | null> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const index = mockSites.findIndex(s => s.id === id);
        if (index === -1) return null;

        mockSites[index] = {
            ...mockSites[index],
            ...site,
            updated_at: new Date().toISOString(),
        };
        return mockSites[index];
    }

    async deleteSite(id: number): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 200));
        const index = mockSites.findIndex(s => s.id === id);
        if (index === -1) return false;

        mockSites.splice(index, 1);
        return true;
    }

    async updateGroupOrder(groupOrders: { id: number; order_num: number }[]): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 200));
        for (const order of groupOrders) {
            const index = mockGroups.findIndex(g => g.id === order.id);
            if (index !== -1) {
                mockGroups[index].order_num = order.order_num;
            }
        }
        return true;
    }

    async updateSiteOrder(siteOrders: { id: number; order_num: number }[]): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 200));
        for (const order of siteOrders) {
            const index = mockSites.findIndex(s => s.id === order.id);
            if (index !== -1) {
                mockSites[index].order_num = order.order_num;
            }
        }
        return true;
    }
}
