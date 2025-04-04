// src/components/SiteCard.tsx
import { useState, memo } from "react";
import { Site } from "../API/http";
import SiteSettingsModal from "./SiteSettingsModal";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SiteCardProps {
    site: Site;
    onUpdate: (updatedSite: Site) => void;
    onDelete: (siteId: number) => void;
    isEditMode?: boolean;
    index?: number;
}

// 使用memo包装组件以减少不必要的重渲染
const SiteCard = memo(function SiteCard({
    site,
    onUpdate,
    onDelete,
    isEditMode = false,
    index = 0,
}: SiteCardProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [iconError, setIconError] = useState(!site.icon);

    // 使用dnd-kit的useSortable hook
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: `site-${site.id || index}`,
        disabled: !isEditMode
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 9999 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as const
    };

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
        if (!isEditMode && site.url) {
            window.open(site.url, "_blank");
        }
    };

    // 处理图标加载错误
    const handleIconError = () => {
        setIconError(true);
    };

    // 卡片内容
    const cardContent = (
        <div
            className={`relative group flex flex-col min-h-[8rem] p-4 rounded-xl transition duration-300 ease-in-out 
                       bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl 
                       border border-slate-200 dark:border-slate-700/60 
                       hover:border-slate-300 dark:hover:border-slate-600 
                       ${!isEditMode ? "hover:-translate-y-1 cursor-pointer" : "cursor-grab"} 
                       ${isEditMode ? "m-1" : ""} 
                       ${isDragging ? "ring-2 ring-sky-500" : ""}`}
            onClick={isEditMode ? undefined : handleCardClick}
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
                {site.description || "暂无描述"}
            </p>

            {/* 编辑模式提示 */}
            {isEditMode && (
                <div
                    className='absolute top-2 right-2 p-1.5 rounded-md 
                              bg-sky-100 dark:bg-sky-900 
                              text-sky-600 dark:text-sky-400
                              text-xs flex items-center'
                >
                    <img src='/svg/drag-sort.svg' className='w-3.5 h-3.5 mr-1' alt='拖拽排序' />
                    拖拽排序
                </div>
            )}

            {/* 设置按钮 - 悬停时显示 */}
            {!isEditMode && (
                <button
                    className='absolute top-2 right-2 p-1.5 rounded-md 
                              bg-slate-100 dark:bg-slate-700 
                              text-slate-500 dark:text-slate-400
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-300
                              z-10'
                    onClick={handleSettingsClick}
                    aria-label='网站设置'
                >
                    <img src='/svg/settings-gear.svg' className='h-4 w-4' alt='设置' />
                </button>
            )}
        </div>
    );

    if (isEditMode) {
        return (
            <>
                <div
                    ref={setNodeRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                >
                    {cardContent}
                </div>

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

    return (
        <>
            {cardContent}

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
});

export default SiteCard;
