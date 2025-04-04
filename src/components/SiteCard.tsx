// src/components/SiteCard.tsx
import { useState } from "react";
import { Site } from "../API/http";
import SiteSettingsModal from "./SiteSettingsModal";

interface SiteCardProps {
    site: Site;
    onUpdate: (updatedSite: Site) => void;
    onDelete: (siteId: number) => void;
}

export default function SiteCard({ site, onUpdate, onDelete }: SiteCardProps) {
    const [showSettings, setShowSettings] = useState(false);

    // 如果没有图标，使用首字母作为图标
    const fallbackIcon = site.name.charAt(0).toUpperCase();

    return (
        <>
            <div
                className='relative group flex flex-col h-32 p-4 rounded-lg transition-all 
                           bg-white dark:bg-gray-800 shadow-md hover:shadow-lg 
                           border border-gray-200 dark:border-gray-700 cursor-pointer'
                onClick={() => window.open(site.url, "_blank")}
            >
                {/* 图标和名称 */}
                <div className='flex items-center mb-2'>
                    {site.icon ? (
                        <img
                            src={site.icon}
                            alt={site.name}
                            className='w-8 h-8 mr-3 rounded-md'
                            onError={e => {
                                // 图标加载失败时，隐藏图片
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <div
                            className='flex items-center justify-center w-8 h-8 mr-3 rounded-md 
                                       bg-blue-500 dark:bg-blue-600 text-white'
                        >
                            {fallbackIcon}
                        </div>
                    )}
                    <h3 className='font-medium text-gray-900 dark:text-gray-100 truncate'>
                        {site.name}
                    </h3>
                </div>

                {/* 描述 */}
                <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow'>
                    {site.description || "无描述"}
                </p>

                {/* 设置按钮 - 悬停时显示 */}
                <button
                    className='absolute top-2 right-2 p-1.5 rounded-md 
                              bg-gray-100 dark:bg-gray-700 
                              text-gray-600 dark:text-gray-300
                              opacity-0 group-hover:opacity-100 transition-opacity
                              hover:bg-gray-200 dark:hover:bg-gray-600'
                    onClick={e => {
                        e.stopPropagation(); // 阻止卡片点击事件
                        setShowSettings(true);
                    }}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                        />
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                    </svg>
                </button>
            </div>

            {/* 网站设置弹窗 */}
            {showSettings && (
                <SiteSettingsModal
                    site={site}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </>
    );
}
