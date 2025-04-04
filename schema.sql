CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  notes TEXT,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- 插入一些初始数据便于测试
INSERT INTO groups (name, order_num) VALUES 
('常用工具', 1),
('开发资源', 2);

INSERT INTO sites (group_id, name, url, icon, description, notes, order_num) VALUES
(1, 'Google', 'https://www.google.com', 'google.png', '搜索引擎', '', 1),
(1, 'GitHub', 'https://github.com', 'github.png', '代码托管平台', '', 2),
(2, 'MDN', 'https://developer.mozilla.org', 'mdn.png', 'Web开发文档', '', 1),
(2, 'Stack Overflow', 'https://stackoverflow.com', 'stackoverflow.png', '开发问答社区', '', 2);