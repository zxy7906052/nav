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
    const [iconError, setIconError] = useState(!site.icon);

    // 如果没有图标，使用首字母作为图标
    const fallbackIcon = site.name.charAt(0).toUpperCase();

    // 处理设置按钮点击
    const handleSettingsClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止卡片点击事件
        e.preventDefault(); // 防止默认行为
        setShowSettings(true);
    };

    // 处理关闭设置
    const handleCloseSettings = () => {
        setShowSettings(false);
    };

    // 处理卡片点击
    const handleCardClick = () => {
        if (site.url) {
            window.open(site.url, "_blank");
        }
    };

    // 处理图标加载错误
    const handleIconError = () => {
        setIconError(true);
    };

    return (
        <>
            <div
                className='relative group flex flex-col min-h-[8rem] p-4 rounded-xl transition-all duration-300 ease-in-out 
                           bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl 
                           border border-slate-200 dark:border-slate-700/60 
                           hover:border-slate-300 dark:hover:border-slate-600 
                           hover:-translate-y-1 cursor-pointer'
                onClick={handleCardClick}
            >
                {/* 图标和名称 */}
                <div className='flex items-center mb-2'>
                    {!iconError && site.icon ? (
                        <img
                            src={site.icon}
                            alt={site.name}
                            className='w-8 h-8 mr-3 rounded-md object-cover'
                            onError={handleIconError}
                        />
                    ) : (
                        <div
                            className='flex items-center justify-center w-8 h-8 mr-3 rounded-md 
                                      bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400 
                                      font-medium border border-sky-200 dark:border-sky-800'
                            aria-label={`${site.name} 的首字母图标`}
                        >
                            {fallbackIcon}
                        </div>
                    )}
                    <h3 className='font-semibold text-slate-900 dark:text-white truncate'>
                        {site.name}
                    </h3>
                </div>

                {/* 描述 */}
                <p className='text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-grow mb-2'>
                    {site.description || '暂无描述'}
                </p>

                {/* 设置按钮 - 悬停时显示 */}
                <button
                    className='absolute top-2 right-2 p-1.5 rounded-md 
                              bg-slate-100 dark:bg-slate-700 
                              text-slate-500 dark:text-slate-400
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-300
                              z-10'
                    onClick={handleSettingsClick}
                    aria-label="网站设置"
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
                    onClose={handleCloseSettings}
                />
            )}
        </>
    );
}
