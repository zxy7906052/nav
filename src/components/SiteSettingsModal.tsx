// src/components/SiteSettingsModal.tsx
import { useState, useEffect } from "react";
import { Site, Group } from "../API/http";

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

    // 提交表单
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 更新网站信息
        onUpdate({
            ...site,
            ...formData,
        });

        onClose();
    };

    // 确认删除
    const confirmDelete = () => {
        if (window.confirm("确定要删除这个网站吗？此操作不可恢复。")) {
            onDelete(site.id!);
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

    // 计算首字母图标
    const fallbackIcon = formData.name?.charAt(0).toUpperCase() || "A";

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <div
                className='w-full max-w-md p-6 mx-4 rounded-lg 
                           bg-white dark:bg-gray-800 shadow-xl 
                           max-h-[90vh] overflow-y-auto'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                        网站设置
                    </h2>
                    <button
                        className='p-1 rounded-md text-gray-500 dark:text-gray-400 
                                   hover:bg-gray-100 dark:hover:bg-gray-700'
                        onClick={onClose}
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-6 w-6'
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

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* 网站名称 */}
                    <div>
                        <label
                            htmlFor='name'
                            className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'
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
                            className='w-full px-3 py-2 border rounded-md 
                                      border-gray-300 dark:border-gray-600
                                      bg-white dark:bg-gray-700
                                      text-gray-900 dark:text-gray-100
                                      focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>

                    {/* 网站链接 */}
                    <div>
                        <label
                            htmlFor='url'
                            className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'
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
                            className='w-full px-3 py-2 border rounded-md 
                                      border-gray-300 dark:border-gray-600
                                      bg-white dark:bg-gray-700
                                      text-gray-900 dark:text-gray-100
                                      focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>

                    {/* 网站图标 */}
                    <div>
                        <label
                            htmlFor='icon'
                            className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'
                        >
                            图标 URL
                        </label>
                        <div className='flex space-x-2'>
                            <div className='flex-shrink-0'>
                                {iconPreview ? (
                                    <img
                                        src={iconPreview}
                                        alt='Icon Preview'
                                        className='w-10 h-10 rounded-md'
                                        onError={() => {
                                            setIconPreview(null);
                                        }}
                                    />
                                ) : (
                                    <div
                                        className='flex items-center justify-center w-10 h-10 rounded-md 
                                                   bg-blue-500 dark:bg-blue-600 text-white'
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
                                className='flex-1 px-3 py-2 border rounded-md 
                                          border-gray-300 dark:border-gray-600
                                          bg-white dark:bg-gray-700
                                          text-gray-900 dark:text-gray-100
                                          focus:ring-blue-500 focus:border-blue-500'
                            />
                        </div>
                    </div>

                    {/* 分组选择 */}
                    {groups.length > 0 && (
                        <div>
                            <label
                                htmlFor='group_id'
                                className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'
                            >
                                所属分组
                            </label>
                            <select
                                id='group_id'
                                name='group_id'
                                value={formData.group_id}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border rounded-md 
                                          border-gray-300 dark:border-gray-600
                                          bg-white dark:bg-gray-700
                                          text-gray-900 dark:text-gray-100
                                          focus:ring-blue-500 focus:border-blue-500'
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
                            className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'
                        >
                            网站描述
                        </label>
                        <textarea
                            id='description'
                            name='description'
                            value={formData.description || ""}
                            onChange={handleChange}
                            rows={2}
                            className='w-full px-3 py-2 border rounded-md 
                                      border-gray-300 dark:border-gray-600
                                      bg-white dark:bg-gray-700
                                      text-gray-900 dark:text-gray-100
                                      focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>

                    {/* 网站备注 */}
                    <div>
                        <label
                            htmlFor='notes'
                            className='block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'
                        >
                            备注
                        </label>
                        <textarea
                            id='notes'
                            name='notes'
                            value={formData.notes || ""}
                            onChange={handleChange}
                            rows={3}
                            className='w-full px-3 py-2 border rounded-md 
                                      border-gray-300 dark:border-gray-600
                                      bg-white dark:bg-gray-700
                                      text-gray-900 dark:text-gray-100
                                      focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>

                    {/* 按钮组 */}
                    <div className='flex justify-between pt-2'>
                        <button
                            type='button'
                            onClick={confirmDelete}
                            className='px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700'
                        >
                            删除
                        </button>
                        <div className='space-x-2'>
                            <button
                                type='button'
                                onClick={onClose}
                                className='px-4 py-2 rounded-md 
                                         text-gray-700 dark:text-gray-200
                                         bg-gray-200 dark:bg-gray-700
                                         hover:bg-gray-300 dark:hover:bg-gray-600'
                            >
                                取消
                            </button>
                            <button
                                type='submit'
                                className='px-4 py-2 rounded-md text-white 
                                         bg-blue-600 hover:bg-blue-700'
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
