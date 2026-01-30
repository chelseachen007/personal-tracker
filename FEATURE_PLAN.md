# Personal Tracker 功能增强计划

## 概述

为 Personal Tracker 项目添加以下四大功能：
1. AI OCR 票据识别
2. 高级表格组件（AG Grid）
3. 数据导出功能
4. AI 食物识别

---

## 功能一：AI OCR 票据识别

### 后端实现

#### 1.1 安装依赖
```bash
cd backend
npm install tesseract.js sharp
```

#### 1.2 创建 OCR 模块
**文件**: `backend/src/ocr.js`（已存在，需增强）
- 使用 Tesseract.js 进行文字识别
- 实现票据数据解析（日期、金额、商家）
- 智能分类逻辑

#### 1.3 添加 OCR API 路由
**文件**: `backend/src/server.js`
```
POST /api/ocr/analyze
- 接收图片上传
- 返回识别的票据数据
```

### 前端实现

#### 1.4 创建 OCR 上传组件
**文件**: `frontend/components/OcrUpload.vue`（已存在，需完善）
- 图片上传预览
- OCR 进度显示
- 自动填充表单

#### 1.5 集成到财务页面
**文件**: `frontend/pages/finance/index.vue`
- 添加 OCR 上传按钮
- 识别结果自动填入财务表单

---

## 功能二：高级表格组件（AG Grid）

### 2.1 安装依赖
```bash
cd frontend
npm install @ag-grid-community @ag-grid-vue3 @ag-grid-enterprise
```

### 2.2 创建通用表格组件
**文件**: `frontend/components/AgDataTable.vue`
- 封装 AG Grid 配置
- 支持分页、排序、筛选
- 支持自定义列配置
- 暗色模式适配

### 2.3 更新各页面使用新表格
**文件**:
- `frontend/pages/health/index.vue`
- `frontend/pages/finance/index.vue`
- `frontend/pages/meals/index.vue`
- `frontend/pages/exercise/index.vue`

### 2.4 表格功能
- 列大小调整
- 列显示/隐藏
- 导出为 CSV
- 全局搜索
- 日期范围筛选

---

## 功能三：数据导出功能

### 后端实现

#### 3.1 添加导出依赖
```bash
cd backend
npm install exceljs
```

#### 3.2 创建导出工具模块
**文件**: `backend/src/utils/export.js`
- Excel 文件生成
- CSV 文件生成
- 带格式的数据导出

#### 3.3 添加导出 API 路由
**文件**: `backend/src/server.js`
```
GET /api/export/health
GET /api/export/finance
GET /api/export/meals
GET /api/export/exercise
- 查询参数: startDate, endDate, format (xlsx/csv)
```

### 前端实现

#### 3.4 安装前端导出依赖
```bash
cd frontend
npm install xlsx file-saver
```

#### 3.5 创建导出 Composable
**文件**: `frontend/composables/useExport.ts`
- 统一的导出接口
- 支持后端导出和前端导出
- 导出进度提示

#### 3.6 添加导出按钮到各页面
**文件**: 各页面组件
- 导出按钮（带下拉菜单选择格式）
- 导出范围选择（全部/当前筛选结果）

---

## 功能四：AI 食物识别

### 后端实现

#### 4.1 添加 AI 依赖
```bash
cd backend
npm install @anthropic-ai/sdk
```

#### 4.2 创建食物识别模块
**文件**: `backend/src/ai/foodRecognition.js`
- 使用 Claude Vision API
- 营养素估算
- 食物分类

#### 4.3 添加食物识别 API
**文件**: `backend/src/server.js`
```
POST /api/ai/recognize-food
- 接收食物图片
- 返回识别结果和营养素
```

### 前端实现

#### 4.4 创建食物识别组件
**文件**: `frontend/components/FoodRecognition.vue`
- 拍照/上传图片
- AI 识别进度
- 营养素展示
- 一键添加到餐食记录

#### 4.5 集成到餐食页面
**文件**: `frontend/pages/meals/index.vue`
- 添加 AI 识别入口
- 识别结果编辑确认

---

## 实施顺序

### Phase 1: 基础设施
1. 安装所有依赖
2. 创建通用表格组件
3. 创建导出工具

### Phase 2: OCR 功能
4. 后端 OCR 模块
5. 前端 OCR 组件
6. 财务页面集成

### Phase 3: 导出功能
7. 后端导出 API
8. 前端导出 composable
9. 各页面集成导出

### Phase 4: AI 食物识别
10. 后端 AI 模块
11. 前端食物识别组件
12. 餐食页面集成

### Phase 5: 完善与测试
13. 更新表格组件到所有页面
14. 添加环境变量配置
15. 测试所有功能

---

## 环境变量配置

**后端** (`backend/.env`):
```env
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=your-anthropic-api-key  # AI 食物识别
```

**前端** (`frontend/.env`):
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## 技术栈总结

| 功能 | 后端技术 | 前端技术 |
|------|----------|----------|
| OCR | Tesseract.js | OcrUpload.vue |
| 表格 | - | AG Grid Vue3 |
| 导出 | ExcelJS | xlsx + file-saver |
| AI 食物识别 | @anthropic-ai/sdk | FoodRecognition.vue |

---

## 预计工作量

- Phase 1: 基础设施 (2-3 步)
- Phase 2: OCR 功能 (3 步)
- Phase 3: 导出功能 (3 步)
- Phase 4: AI 食物识别 (3 步)
- Phase 5: 完善测试 (3 步)

**总计**: 约 15 个实施步骤
