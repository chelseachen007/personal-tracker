# OCR 识别功能配置指南

## 功能概述

支持通过图片识别快速录入财务、饮食、运动数据：

- **财务识别**: 微信/支付宝账单、小票、收款记录
- **饮食识别**: 外卖订单、营养标签、食物图片
- **运动识别**: 健身记录、运动手环截图、跑步轨迹

## API 端点

| 端点 | 说明 |
|------|------|
| `POST /api/ocr/finance` | 识别财务数据 |
| `POST /api/ocr/meal` | 识别饮食数据 |
| `POST /api/ocr/exercise` | 识别运动数据 |
| `POST /api/ocr/preview` | 预览识别文字 |

## 请求格式

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "autoSave": false
}
```

## 配置 OCR 服务

### 1. 百度 OCR (推荐)

**获取密钥:**
1. 访问 [百度智能云](https://cloud.baidu.com/)
2. 开通「文字识别」服务
3. 创建应用获取 API Key 和 Secret Key

**配置 .env:**
```bash
OCR_PROVIDER=baidu
OCR_API_KEY=your-baidu-api-key
OCR_SECRET_KEY=your-baidu-secret-key
```

**免费额度:**
- 通用文字识别: 500次/天
- 高精度版本: 50次/天

### 2. 腾讯云 OCR

**获取密钥:**
1. 访问 [腾讯云](https://cloud.tencent.com/)
2. 开通「文字识别」服务
3. 获取 SecretId 和 SecretKey

**配置 .env:**
```bash
OCR_PROVIDER=tencent
OCR_TENCENT_SECRET_ID=your-secret-id
OCR_TENCENT_SECRET_KEY=your-secret-key
```

## 识别能力

### 财务数据识别

可识别内容:
- ✅ 交易金额 (¥12.34, 12.34元)
- ✅ 交易日期 (2024-01-30, 01月30日)
- ✅ 收支类型 (支出/收入)
- ✅ 商家名称
- ✅ 支付方式 (微信/支付宝/现金/银行卡)
- ✅ 消费分类 (餐饮/交通/购物/娱乐等)

支持图片:
- 微信支付账单截图
- 支付宝转账记录
- 收银小票照片
- 银行卡消费通知

### 饮食数据识别

可识别内容:
- ✅ 食物名称
- ✅ 卡路里 (kcal/千卡)
- ✅ 蛋白质 (g)
- ✅ 碳水化合物 (g)
- ✅ 脂肪 (g)
- ✅ 餐次类型 (早/午/晚/加餐)

支持图片:
- 外卖订单截图
- 营养标签照片
- 食品包装信息

### 运动数据识别

可识别内容:
- ✅ 运动类型 (跑步/骑行/游泳/健身等)
- ✅ 运动时长 (分钟)
- ✅ 运动距离 (km)
- ✅ 消耗卡路里
- ✅ 运动日期

支持图片:
- 健身APP记录截图
- 运动手环数据
- 跑步轨迹截图

## 前端使用

```vue
<script setup>
import OcrUpload from '~/components/OcrUpload.vue'

function onSaved(record) {
  console.log('保存成功:', record)
}
</script>

<template>
  <OcrUpload type="finance" @saved="onSaved" />
</template>
```

## 使用流程

1. **上传图片** - 点击或拖拽上传账单/记录截图
2. **预览识别** - 查看识别结果，确认数据正确性
3. **保存记录** - 一键保存到数据库
4. **编辑修正** - 可在保存前手动修改识别结果

## 注意事项

1. **首次使用** 需要配置 OCR 服务密钥
2. **图片要求** - 文字清晰、无遮挡、光线充足
3. **数据校验** - 识别结果请确认后再保存
4. **网络要求** - 需要稳定的网络连接调用 OCR API

## 故障排查

### 错误: "OCR recognition failed"

**原因:**
- OCR 服务未配置
- API 密钥无效或已过期
- 网络连接问题
- 图片格式不支持

**解决:**
1. 检查 `.env` 文件中的 OCR 配置
2. 确认 API 密钥有效且额度充足
3. 检查服务器网络连接

### 识别不准确

**建议:**
- 使用高清原图
- 确保文字区域完整可见
- 避免图片模糊或反光
- 裁剪图片只保留有效区域
