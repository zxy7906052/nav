// src/components/ThemeToggle.tsx
import { useState, useEffect } from "react";

export default function ThemeToggle() {
    // 检查用户首选主题或系统设置
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            // 先检查本地存储中的设置
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) {
                return savedTheme === "dark";
            }
            // 如果没有保存设置，则检查系统首选主题
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    });

    // 监听系统主题变化
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent) => {
            // 只有在用户没有手动设置主题时才跟随系统
            if (!localStorage.getItem("theme")) {
                setDarkMode(e.matches);
            }
        };

        // 初始化时检查系统主题
        if (!localStorage.getItem("theme")) {
            setDarkMode(mediaQuery.matches);
        }

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // 切换主题状态
    const toggleTheme = () => {
        setDarkMode(prev => {
            const newValue = !prev;
            // 更新 localStorage
            localStorage.setItem("theme", newValue ? "dark" : "light");
            return newValue;
        });
    };

    // 应用主题到 DOM
    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [darkMode]);

    return (
        <button
            onClick={toggleTheme}
            className='p-2 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200'
            aria-label={darkMode ? "切换到亮色模式" : "切换到暗色模式"}
        >
            {darkMode ? (
                // 太阳图标
                <img src='/svg/sun.svg' className='h-5 w-5' alt='切换到亮色模式' />
            ) : (
                // 月亮图标
                <img src='/svg/moon.svg' className='h-5 w-5' alt='切换到暗色模式' />
            )}
        </button>
    );
}
