// src/components/SiteSettingsModal.tsx
import { useState, useEffect, useRef } from "react";
import { Site, Group } from "../API/http";
import { createPortal } from "react-dom";

interface SiteSettingsModalProps {
    site: Site;
    onUpdate: (updatedSite: Site) => void;
    onDelete: (siteId: number) => void;
    onClose: () => void;
    groups?: Group[]; // 可选的分组列表
}

export default function SiteSettingsModal({
    site,
    onUpdate,
    onDelete,
    onClose,
    groups = [],
}: SiteSettingsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<Partial<Site>>({
        name: site.name,
        url: site.url,
        icon: site.icon,
        description: site.description,
        notes: site.notes,
        group_id: site.group_id,
    });

    // 用于预览图标
    const [iconPreview, setIconPreview] = useState<string | null>(site.icon || null);

    // 处理表单字段变化
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 处理图标上传或URL输入
    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, icon: value }));
        setIconPreview(value);
    };

    // 处理图标加载错误
    const handleIconError = () => {
        setIconPreview(null);
    };

    // 提交表单
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 更新网站信息
        onUpdate({
            ...site,
            ...formData,
        });

        onClose();
    };

    // 确认删除
    const confirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("确定要删除这个网站吗？此操作不可恢复。")) {
            onDelete(site.id!);
            onClose();
        }
    };

    // 阻止点击模态窗口背景时关闭
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // 点击模态窗口外部时关闭
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    // 处理ESC键关闭弹窗
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // 防止滚动穿透
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // 计算首字母图标
    const fallbackIcon = formData.name?.charAt(0).toUpperCase() || "A";

    // 使用 Portal 渲染到 body 最底部，避免受到其他元素的影响
    return createPortal(
        <div 
            className='fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm'
            onClick={handleBackdropClick}
            style={{ isolation: 'isolate' }}
        >
            <div
                ref={modalRef}
                className='w-full max-w-md p-6 mx-4 rounded-xl 
                           bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700
                           max-h-[90vh] overflow-y-auto relative'
                onClick={handleModalClick}
            >
                <div className='flex justify-between items-center mb-5'>
                    <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>
                        网站设置
                    </h2>
                    <button
                        className='p-1.5 rounded-md text-slate-500 dark:text-slate-400 
                                   hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                        onClick={onClose}
                        aria-label="关闭"
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                    {/* 网站名称 */}
                    <div>
                        <label
                            htmlFor='name'
                            className='block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'
                        >
                            网站名称 *
                        </label>
                        <input
                            type='text'
                            id='name'
                            name='name'
                            required
                            value={formData.name || ""}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border rounded-lg 
                                      border-slate-300 dark:border-slate-600
                                      bg-white dark:bg-slate-700/50
                                      text-slate-900 dark:text-slate-100
                                      focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors'
                            placeholder="输入网站名称"
                        />
                    </div>

                    {/* 网站链接 */}
                    <div>
                        <label
                            htmlFor='url'
                            className='block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'
                        >
                            网站链接 *
                        </label>
                        <input
                            type='url'
                            id='url'
                            name='url'
                            required
                            value={formData.url || ""}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border rounded-lg 
                                      border-slate-300 dark:border-slate-600
                                      bg-white dark:bg-slate-700/50
                                      text-slate-900 dark:text-slate-100
                                      focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors'
                            placeholder="https://example.com"
                        />
                    </div>

                    {/* 网站图标 */}
                    <div>
                        <label
                            htmlFor='icon'
                            className='block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'
                        >
                            图标 URL
                        </label>
                        <div className='flex space-x-3'>
                            <div className='flex-shrink-0'>
                                {iconPreview ? (
                                    <img
                                        src={iconPreview}
                                        alt='Icon Preview'
                                        className='w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700'
                                        onError={handleIconError}
                                    />
                                ) : (
                                    <div
                                        className='flex items-center justify-center w-10 h-10 rounded-lg 
                                                   bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400 
                                                   font-medium border border-sky-200 dark:border-sky-800'
                                        aria-label="网站首字母图标"
                                    >
                                        {fallbackIcon}
                                    </div>
                                )}
                            </div>
                            <input
                                type='text'
                                id='icon'
                                name='icon'
                                value={formData.icon || ""}
                                onChange={handleIconChange}
                                placeholder='https://example.com/icon.png'
                                className='flex-1 px-3 py-2 border rounded-lg 
                                          border-slate-300 dark:border-slate-600
                                          bg-white dark:bg-slate-700/50
                                          text-slate-900 dark:text-slate-100
                                          focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors'
                            />
                        </div>
                    </div>

                    {/* 分组选择 */}
                    {groups.length > 0 && (
                        <div>
                            <label
                                htmlFor='group_id'
                                className='block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'
                            >
                                所属分组
                            </label>
                            <select
                                id='group_id'
                                name='group_id'
                                value={formData.group_id}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border rounded-lg 
                                          border-slate-300 dark:border-slate-600
                                          bg-white dark:bg-slate-700/50
                                          text-slate-900 dark:text-slate-100
                                          focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors'
                            >
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* 网站描述 */}
                    <div>
                        <label
                            htmlFor='description'
                            className='block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'
                        >
                            网站描述
                        </label>
                        <textarea
                            id='description'
                            name='description'
                            value={formData.description || ""}
                            onChange={handleChange}
                            rows={2}
                            className='w-full px-3 py-2 border rounded-lg 
                                      border-slate-300 dark:border-slate-600
                                      bg-white dark:bg-slate-700/50
                                      text-slate-900 dark:text-slate-100
                                      focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors'
                            placeholder="简短的网站描述"
                        />
                    </div>

                    {/* 备注 */}
                    <div>
                        <label
                            htmlFor='notes'
                            className='block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'
                        >
                            备注
                        </label>
                        <textarea
                            id='notes'
                            name='notes'
                            value={formData.notes || ""}
                            onChange={handleChange}
                            rows={3}
                            className='w-full px-3 py-2 border rounded-lg 
                                      border-slate-300 dark:border-slate-600
                                      bg-white dark:bg-slate-700/50
                                      text-slate-900 dark:text-slate-100
                                      focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors'
                            placeholder="可选的私人备注"
                        />
                    </div>

                    {/* 按钮组 */}
                    <div className='flex flex-wrap justify-between pt-2'>
                        <button
                            type='button'
                            onClick={confirmDelete}
                            className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors 
                                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800'
                        >
                            删除
                        </button>
                        <div className='space-x-3'>
                            <button
                                type='button'
                                onClick={onClose}
                                className='px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600
                                         text-slate-800 dark:text-slate-200 rounded-lg transition-colors
                                         focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800'
                            >
                                取消
                            </button>
                            <button
                                type='submit'
                                className='px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors
                                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800'
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
