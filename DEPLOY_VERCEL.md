# دليل نشر Walleo على Vercel

## المتطلبات الأساسية

1. حساب على [Vercel](https://vercel.com)
2. GitHub/GitLab/Bitbucket account
3. Backend منشور على Render أو Railway

## خطوات النشر

### 1. رفع الكود إلى GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/walleo.git
git push -u origin main
```

### 2. النشر عبر Vercel Dashboard

1. سجل الدخول إلى [vercel.com](https://vercel.com)
2. انقر على **Add New** → **Project**
3. استورد الـ repository من GitHub
4. **Root Directory**: اختر `web/merchant-dashboard`
5. **Framework Preset**: Vite
6. اضبط المتغيرات البيئية:
   - `VITE_API_URL`: رابط الـ Backend (مثال: `https://walleo-backend.onrender.com`)
7. انقر **Deploy**

### 3. النشر عبر Vercel CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# الدخول إلى مجلد web/merchant-dashboard
cd web/merchant-dashboard

# النشر الأول
vercel

# اتبع التعليمات:
# - Set up and deploy: Yes
# - Which scope: حدد حسابك
# - Link to existing project: No
# - Project name: walleo-dashboard
# - Directory: ./
# - Override settings: No

# النشر للإنتاج
vercel --prod
```

## إعدادات إضافية

### Custom Domain (اختياري)

في Vercel Dashboard → Settings → Domains، أضف دومينك (مثال: `dashboard.walleo.com`) واتبع التعليمات لتحديث DNS.

### Environment Variables

| المتغير | القيمة | الوصف |
|---------|--------|-------|
| `VITE_API_URL` | `https://api.walleo.com` | Backend API URL |

## التحقق من النشر

```bash
curl https://your-project.vercel.app
# أو فتح المتصفح
open https://your-project.vercel.app
```

## هيكل المسارات بعد النشر

```
https://your-project.vercel.app/
├── /              → Dashboard (requires auth)
├── /login         → Login page
├── /dashboard     → Dashboard
├── /campaigns     → Campaign management
├── /analytics     → Analytics
├── /settings      → Settings
├── /privacy       → Privacy policy
├── /terms         → Terms of service
├── /faq           → FAQ
├── /contact       → Contact
├── /about         → About
└── /support       → Support
```

## استكشاف الأخطاء

### مشكلة: Blank page after deploy

**الحل:**
```bash
# تحقق من build
cd web/merchant-dashboard && npm run build
# تأكد من وجود dist/index.html
ls dist/
```

### مشكلة: API calls fail

**الحل:** تحقق من `VITE_API_URL` في Vercel Dashboard — يجب أن يبدأ بـ `https://`.

### مشكلة: 404 on refresh

**الحل:** تأكد من أن `vercel.json` يحتوي على:
```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

## تحديث النشر

```bash
# بعد أي تغيير في الكود
git add .
git commit -m "Update"
git push
# Vercel سينشر تلقائياً
```

## مراقبة الأداء

- **Vercel Analytics**: متاح في dashboard
- **Logs**: Vercel Dashboard → Project → Analytics
- **Speed Insights**: متاح مجاناً
