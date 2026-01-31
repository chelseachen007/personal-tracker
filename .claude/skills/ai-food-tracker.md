# AI Food & Finance Tracker Skill

自动识别食物图片和财务截图并添加到个人追踪系统的 AI 助手。

## 功能描述

此 skill 让 Claude 可以通过调用 AI 视觉识别接口来：

### 食物识别
1. 识别食物图片
2. 提取营养信息（卡路里、蛋白质、碳水、脂肪）
3. 自动添加餐食记录到个人追踪系统

### 财务识别
1. 识别微信/支付宝的支付/收款截图
2. 提取交易信息（金额、类型、类别、描述）
3. 自动添加财务记录到个人追踪系统

## 使用方法

### 食物记录
#### 方式一：上传食物图片
```
请帮我识别这张食物图片并添加到记录中
```
然后上传图片

#### 方式二：直接描述食物
```
我今天午餐吃了鸡胸肉沙拉，帮我记录下来
约 400 卡路里，30g 蛋白质
```

### 财务记录
#### 上传支付/收款截图
```
请帮我识别这张微信支付截图并添加到记录中
```
然后上传微信或支付宝的截图

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

### 识别财务记录
- **URL**: `POST /api/ai/recognize-finance`
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
  "transactionType": "expense",
  "amount": 20.00,
  "category": "餐饮",
  "description": "黄焖鸡米饭",
  "paymentMethod": "微信",
  "recordDate": "2026-01-30T12:00:00.000Z",
  "confidence": 0.9
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

## 交易类型
- `income` - 收入
- `expense` - 支出

## 财务类别
- `餐饮`、`交通`、`购物`、`娱乐`、`医疗`、`教育`、`工资`、`转账`、`其他`

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

**用户**: [上传微信支付截图]
**AI**: 已识别出支付信息：支出 20 元，类别为餐饮，用于黄焖鸡米饭。已为你添加到财务记录中。
