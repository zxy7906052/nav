// src/api/http.ts
import { D1Database } from "@cloudflare/workers-types";

// 定义环境变量接口
interface Env {
    DB: D1Database;
}

// 数据类型定义
export interface Group {
    id?: number;
    name: string;
    order: number;
    created_at?: string;
    updated_at?: string;
}

export interface Site {
    id?: number;
    group_id: number;
    name: string;
    url: string;
    icon: string;
    description: string;
    notes: string;
    order: number;
    created_at?: string;
    updated_at?: string;
}

// API 类
export class NavigationAPI {
    private db: D1Database;

    constructor(env: Env) {
        this.db = env.DB;
    }

    // 初始化数据库表
    async initDB(): Promise<void> {
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        order_num INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT,
        description TEXT,
        notes TEXT,
        order_num INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
      );
    `);
    }

    // 分组相关 API
    async getGroups(): Promise<Group[]> {
        const { results } = await this.db
            .prepare(
                "SELECT id, name, order_num as order, created_at, updated_at FROM groups ORDER BY order_num"
            )
            .all<Group>();
        return results;
    }

    async getGroup(id: number): Promise<Group | null> {
        const result = await this.db
            .prepare(
                "SELECT id, name, order_num as order, created_at, updated_at FROM groups WHERE id = ?"
            )
            .bind(id)
            .first<Group>();
        return result;
    }

    async createGroup(group: Group): Promise<Group> {
        const { results } = await this.db
            .prepare(
                "INSERT INTO groups (name, order_num) VALUES (?, ?) RETURNING id, name, order_num as order, created_at, updated_at"
            )
            .bind(group.name, group.order)
            .all<Group>();
        return results[0];
    }

    async updateGroup(id: number, group: Partial<Group>): Promise<Group | null> {
        let query = "UPDATE groups SET updated_at = CURRENT_TIMESTAMP";
        const params: (string | number)[] = [];

        if (group.name !== undefined) {
            query += ", name = ?";
            params.push(group.name);
        }

        if (group.order !== undefined) {
            query += ", order_num = ?";
            params.push(group.order);
        }

        query += " WHERE id = ? RETURNING id, name, order_num as order, created_at, updated_at";
        params.push(id);

        const { results } = await this.db
            .prepare(query)
            .bind(...params)
            .all<Group>();
        return results.length > 0 ? results[0] : null;
    }

    async deleteGroup(id: number): Promise<boolean> {
        const result = await this.db.prepare("DELETE FROM groups WHERE id = ?").bind(id).run();
        return result.success;
    }

    // 网站相关 API
    async getSites(groupId?: number): Promise<Site[]> {
        let query =
            "SELECT id, group_id, name, url, icon, description, notes, order_num as order, created_at, updated_at FROM sites";
        const params: (string | number)[] = [];

        if (groupId !== undefined) {
            query += " WHERE group_id = ?";
            params.push(groupId);
        }

        query += " ORDER BY order_num";

        const { results } = await this.db
            .prepare(query)
            .bind(...params)
            .all<Site>();
        return results;
    }

    async getSite(id: number): Promise<Site | null> {
        const result = await this.db
            .prepare(
                "SELECT id, group_id, name, url, icon, description, notes, order_num as order, created_at, updated_at FROM sites WHERE id = ?"
            )
            .bind(id)
            .first<Site>();
        return result;
    }

    async createSite(site: Site): Promise<Site> {
        const { results } = await this.db
            .prepare(
                `
      INSERT INTO sites (group_id, name, url, icon, description, notes, order_num) 
      VALUES (?, ?, ?, ?, ?, ?, ?) 
      RETURNING id, group_id, name, url, icon, description, notes, order_num as order, created_at, updated_at
    `
            )
            .bind(
                site.group_id,
                site.name,
                site.url,
                site.icon || "",
                site.description || "",
                site.notes || "",
                site.order
            )
            .all<Site>();

        return results[0];
    }

    async updateSite(id: number, site: Partial<Site>): Promise<Site | null> {
        let query = "UPDATE sites SET updated_at = CURRENT_TIMESTAMP";
        const params: (string | number)[] = [];

        if (site.group_id !== undefined) {
            query += ", group_id = ?";
            params.push(site.group_id);
        }

        if (site.name !== undefined) {
            query += ", name = ?";
            params.push(site.name);
        }

        if (site.url !== undefined) {
            query += ", url = ?";
            params.push(site.url);
        }

        if (site.icon !== undefined) {
            query += ", icon = ?";
            params.push(site.icon);
        }

        if (site.description !== undefined) {
            query += ", description = ?";
            params.push(site.description);
        }

        if (site.notes !== undefined) {
            query += ", notes = ?";
            params.push(site.notes);
        }

        if (site.order !== undefined) {
            query += ", order_num = ?";
            params.push(site.order);
        }

        query +=
            " WHERE id = ? RETURNING id, group_id, name, url, icon, description, notes, order_num as order, created_at, updated_at";
        params.push(id);

        const { results } = await this.db
            .prepare(query)
            .bind(...params)
            .all<Site>();
        return results.length > 0 ? results[0] : null;
    }

    async deleteSite(id: number): Promise<boolean> {
        const result = await this.db.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
        return result.success;
    }

    // 批量更新排序
    async updateGroupOrder(groupOrders: { id: number; order: number }[]): Promise<boolean> {
        // 使用事务确保所有更新一起成功或失败
        return await this.db
            .batch(
                groupOrders.map(item =>
                    this.db
                        .prepare(
                            "UPDATE groups SET order_num = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                        )
                        .bind(item.order, item.id)
                )
            )
            .then(() => true)
            .catch(() => false);
    }

    async updateSiteOrder(siteOrders: { id: number; order: number }[]): Promise<boolean> {
        // 使用事务确保所有更新一起成功或失败
        return await this.db
            .batch(
                siteOrders.map(item =>
                    this.db
                        .prepare(
                            "UPDATE sites SET order_num = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                        )
                        .bind(item.order, item.id)
                )
            )
            .then(() => true)
            .catch(() => false);
    }
}

// 创建 API 辅助函数
export function createAPI(env: Env): NavigationAPI {
    return new NavigationAPI(env);
}
