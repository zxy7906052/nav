// src/api/http.ts
import { D1Database } from "@cloudflare/workers-types";

// 定义环境变量接口
interface Env {
    DB: D1Database;
    AUTH_ENABLED?: string; // 是否启用身份验证
    AUTH_USERNAME?: string; // 认证用户名
    AUTH_PASSWORD?: string; // 认证密码
    AUTH_SECRET?: string;   // JWT密钥
}

// 数据类型定义
export interface Group {
    id?: number;
    name: string;
    order_num: number;
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
    order_num: number;
    created_at?: string;
    updated_at?: string;
}

// 新增配置接口
export interface Config {
    key: string;
    value: string;
    created_at?: string;
    updated_at?: string;
}

// 新增用户登录接口
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    message?: string;
}

// API 类
export class NavigationAPI {
    private db: D1Database;
    private authEnabled: boolean;
    private username: string;
    private password: string;
    private secret: string;

    constructor(env: Env) {
        this.db = env.DB;
        this.authEnabled = env.AUTH_ENABLED === "true";
        this.username = env.AUTH_USERNAME || "";
        this.password = env.AUTH_PASSWORD || "";
        this.secret = env.AUTH_SECRET || "默认密钥，建议在生产环境中设置";
    }

    // 初始化数据库表
    // 修改initDB方法，将SQL语句分开执行
    async initDB(): Promise<void> {
        // 先创建groups表
        await this.db.exec(`CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, order_num INTEGER NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        
        // 再创建sites表
        await this.db.exec(`CREATE TABLE IF NOT EXISTS sites (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INTEGER NOT NULL, name TEXT NOT NULL, url TEXT NOT NULL, icon TEXT, description TEXT, notes TEXT, order_num INTEGER NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE);`);
        
        // 创建全局配置表
        await this.db.exec(`CREATE TABLE IF NOT EXISTS configs (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    }

    // 验证用户登录
    async login(loginRequest: LoginRequest): Promise<LoginResponse> {
        // 如果未启用身份验证，直接返回成功
        if (!this.authEnabled) {
            return {
                success: true,
                token: this.generateToken({ username: "guest" }),
                message: "身份验证未启用，默认登录成功"
            };
        }

        // 验证用户名和密码
        if (loginRequest.username === this.username && loginRequest.password === this.password) {
            // 生成JWT令牌
            const token = this.generateToken({ username: loginRequest.username });
            return {
                success: true,
                token,
                message: "登录成功"
            };
        }

        return {
            success: false,
            message: "用户名或密码错误"
        };
    }

    // 验证令牌有效性
    verifyToken(token: string): { valid: boolean; payload?: Record<string, unknown> } {
        if (!this.authEnabled) {
            return { valid: true };
        }

        try {
            // 简单的JWT验证实现
            const [header, payload, signature] = token.split('.');
            if (!header || !payload || !signature) {
                return { valid: false };
            }

            // 解码payload
            const decodedPayload = JSON.parse(atob(payload));
            
            // 检查令牌是否过期
            if (decodedPayload.exp && decodedPayload.exp < Date.now() / 1000) {
                return { valid: false };
            }

            // 这里简化了签名验证逻辑，实际生产环境应使用完整的JWT库
            return { valid: true, payload: decodedPayload };
        } catch {
            // 任何异常都视为验证失败
            return { valid: false };
        }
    }

    // 生成JWT令牌
    private generateToken(payload: Record<string, unknown>): string {
        // 简化的JWT生成，实际生产环境应使用完整的JWT库
        const header = { alg: 'HS256', typ: 'JWT' };
        const tokenPayload = {
            ...payload,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24小时过期
            iat: Math.floor(Date.now() / 1000)
        };

        const base64Header = btoa(JSON.stringify(header));
        const base64Payload = btoa(JSON.stringify(tokenPayload));
        
        // 简化的签名逻辑，实际生产环境应使用完整的散列算法
        const signature = btoa(this.secret + '.' + base64Header + '.' + base64Payload);
        
        return `${base64Header}.${base64Payload}.${signature}`;
    }

    // 检查认证是否启用
    isAuthEnabled(): boolean {
        return this.authEnabled;
    }

    // 分组相关 API
    async getGroups(): Promise<Group[]> {
        const { results } = await this.db
            .prepare(
                "SELECT id, name, order_num, created_at, updated_at FROM groups ORDER BY order_num"
            )
            .all<Group>();
        return results;
    }

    async getGroup(id: number): Promise<Group | null> {
        const result = await this.db
            .prepare(
                "SELECT id, name, order_num, created_at, updated_at FROM groups WHERE id = ?"
            )
            .bind(id)
            .first<Group>();
        return result;
    }

    async createGroup(group: Group): Promise<Group> {
        const { results } = await this.db
            .prepare(
                "INSERT INTO groups (name, order_num) VALUES (?, ?) RETURNING id, name, order_num, created_at, updated_at"
            )
            .bind(group.name, group.order_num)
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

        if (group.order_num !== undefined) {
            query += ", order_num = ?";
            params.push(group.order_num);
        }

        query += " WHERE id = ? RETURNING id, name, order_num, created_at, updated_at";
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
            "SELECT id, group_id, name, url, icon, description, notes, order_num, created_at, updated_at FROM sites";
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
                "SELECT id, group_id, name, url, icon, description, notes, order_num, created_at, updated_at FROM sites WHERE id = ?"
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
      RETURNING id, group_id, name, url, icon, description, notes, order_num, created_at, updated_at
    `
            )
            .bind(
                site.group_id,
                site.name,
                site.url,
                site.icon || "",
                site.description || "",
                site.notes || "",
                site.order_num
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

        if (site.order_num !== undefined) {
            query += ", order_num = ?";
            params.push(site.order_num);
        }

        query +=
            " WHERE id = ? RETURNING id, group_id, name, url, icon, description, notes, order_num, created_at, updated_at";
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

    // 配置相关API
    async getConfigs(): Promise<Record<string, string>> {
        const { results } = await this.db
            .prepare("SELECT key, value FROM configs")
            .all<Config>();
        
        // 将结果转换为键值对对象
        const configs: Record<string, string> = {};
        for (const config of results) {
            configs[config.key] = config.value;
        }
        
        return configs;
    }

    async getConfig(key: string): Promise<string | null> {
        const result = await this.db
            .prepare("SELECT value FROM configs WHERE key = ?")
            .bind(key)
            .first<{ value: string }>();
        
        return result ? result.value : null;
    }

    async setConfig(key: string, value: string): Promise<boolean> {
        try {
            // 使用UPSERT语法（SQLite支持）
            const result = await this.db
                .prepare(
                    `INSERT INTO configs (key, value, updated_at) 
                    VALUES (?, ?, CURRENT_TIMESTAMP) 
                    ON CONFLICT(key) 
                    DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`
                )
                .bind(key, value, value)
                .run();
            
            return result.success;
        } catch (error) {
            console.error("设置配置失败:", error);
            return false;
        }
    }

    async deleteConfig(key: string): Promise<boolean> {
        const result = await this.db
            .prepare("DELETE FROM configs WHERE key = ?")
            .bind(key)
            .run();
        
        return result.success;
    }

    // 批量更新排序
    async updateGroupOrder(groupOrders: { id: number; order_num: number }[]): Promise<boolean> {
        // 使用事务确保所有更新一起成功或失败
        return await this.db
            .batch(
                groupOrders.map(item =>
                    this.db
                        .prepare(
                            "UPDATE groups SET order_num = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                        )
                        .bind(item.order_num, item.id)
                )
            )
            .then(() => true)
            .catch(() => false);
    }

    async updateSiteOrder(siteOrders: { id: number; order_num: number }[]): Promise<boolean> {
        // 使用事务确保所有更新一起成功或失败
        return await this.db
            .batch(
                siteOrders.map(item =>
                    this.db
                        .prepare(
                            "UPDATE sites SET order_num = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                        )
                        .bind(item.order_num, item.id)
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
