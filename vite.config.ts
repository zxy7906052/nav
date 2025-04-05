import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";
import fs from "fs";

// 自定义插件，用于构建后编译functions目录
const compileFunctionsPlugin = () => {
    return {
        name: "compile-functions",
        closeBundle: async () => {
            console.log("正在编译Functions目录...");

            // 创建临时tsconfig文件
            const tsconfigContent = JSON.stringify(
                {
                    compilerOptions: {
                        target: "ES2020",
                        module: "ES2020",
                        moduleResolution: "node",
                        esModuleInterop: true,
                        strict: true,
                        outDir: "./dist",
                        skipLibCheck: true,
                    },
                    include: ["functions/**/*.ts"],
                },
                null,
                2
            );

            fs.writeFileSync("tsconfig.functions.json", tsconfigContent);

            try {
                // 编译functions目录下的TypeScript文件
                execSync("npx tsc --project tsconfig.functions.json", { stdio: "inherit" });
                console.log("Functions编译成功！");
            } catch (error) {
                console.error("Functions编译失败:", error);
                throw error;
            } finally {
                // 删除临时配置文件
                fs.unlinkSync("tsconfig.functions.json");
            }
        },
    };
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), compileFunctionsPlugin()],
});
