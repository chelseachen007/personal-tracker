# AI Food Tracker Skill

自动识别食物图片并添加到个人追踪系统的 AI 助手。

## 功能描述

此 skill 让 Claude 可以通过调用 AI 视觉识别接口来：
1. 识别食物图片
2. 提取营养信息（卡路里、蛋白质、碳水、脂肪）
3. 自动添加餐食记录到个人追踪系统

## 使用方法

### 方式一：上传食物图片
```
请帮我识别这张食物图片并添加到记录中
```
然后上传图片

### 方式二：直接描述食物
```
我今天午餐吃了鸡胸肉沙拉，帮我记录下来
约 400 卡路里，30g 蛋白质
```

## API 端点

### 识别食物
- **URL**: `POST /api/ai/recognize-food`
- **请求**:
```json
{
  "image": "data:image/jpeg;base64,...",
  "autoSave": false
}
```
- **响应**:
```json
{
  "foodName": "鸡胸肉沙拉",
  "mealType": "lunch",
  "calories": 400,
  "protein": 30,
  "carbs": 15,
  "fat": 12,
  "confidence": 0.9,
  "description": "..."
}
```

### 添加餐食记录
- **URL**: `POST /api/meals`
- **请求**:
```json
{
  "mealDate": "2026-01-30T12:00:00.000Z",
  "mealType": "lunch",
  "foodName": "鸡胸肉沙拉",
  "calories": 400,
  "protein": 30,
  "carbs": 15,
  "fat": 12,
  "notes": "备注"
}
```

## 餐次类型
- `breakfast` - 早餐
- `lunch` - 午餐
- `dinner` - 晚餐
- `snack` - 零食/加餐

## 配置要求

确保后端 `.env` 文件包含：
```
GLM_API_KEY=your-api-key-here
```

## 示例对话

**用户**: 我中午吃了番茄鸡蛋面，帮我记录
**AI**: 我来帮你记录这餐。请问大概多少卡路里？或者有照片吗？

**用户**: [上传照片]
**AI**: 已识别出番茄鸡蛋面，约 450 卡路里。已为你添加到午餐记录中。

**用户**: 晚上吃了一个苹果
**AI**: 好的，我来记录。约 80 卡路里的水果，已添加到零食记录。
