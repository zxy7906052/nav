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

    // 切换主题状态
    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    // 应用主题到 DOM
    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <button
            onClick={toggleTheme}
            className='p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            aria-label={darkMode ? "切换到亮色模式" : "切换到暗色模式"}
        >
            {darkMode ? (
                // 太阳图标
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                >
                    <path
                        fillRule='evenodd'
                        d='M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z'
                        clipRule='evenodd'
                    />
                </svg>
            ) : (
                // 月亮图标
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                >
                    <path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
                </svg>
            )}
        </button>
    );
}
