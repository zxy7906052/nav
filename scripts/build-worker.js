// Worker 构建脚本
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("开始构建 Cloudflare Worker...");

// 创建临时 tsconfig 文件
const tsconfigContent = JSON.stringify(
    {
        compilerOptions: {
            target: "ES2020",
            module: "ES2020",
            moduleResolution: "node",
            esModuleInterop: true,
            strict: false,
            outDir: "./dist",
            skipLibCheck: true,
            // ES 模块相关配置
            verbatimModuleSyntax: true,
        },
        include: ["functions/**/*.ts"],
    },
    null,
    2
);

// 写入临时配置文件
const tsconfigPath = path.join(rootDir, "tsconfig.worker.json");
fs.writeFileSync(tsconfigPath, tsconfigContent);

try {
    // 编译 functions 目录
    console.log("编译 functions 目录...");
    execSync("npx tsc --project tsconfig.worker.json", {
        stdio: "inherit",
        cwd: rootDir,
    });

    // 确保文件使用 ES 模块格式
    console.log("检查 Worker 格式...");
    const workerPath = path.join(rootDir, "dist", "functions", "api", "[[path]].js");

    if (fs.existsSync(workerPath)) {
        let content = fs.readFileSync(workerPath, "utf8");

        // 检查是否已经是 ES 模块格式
        if (!content.includes("export default")) {
            console.error("警告: Worker 文件不是 ES 模块格式，请检查源文件");
        } else {
            console.log("Worker 文件格式检查通过");
        }
    } else {
        console.error("错误: 找不到编译后的 Worker 文件");
    }

    console.log("Worker 构建完成");
} catch (error) {
    console.error("Worker 构建失败:", error);
    process.exit(1);
} finally {
    // 清理临时文件
    if (fs.existsSync(tsconfigPath)) {
        fs.unlinkSync(tsconfigPath);
    }
}
