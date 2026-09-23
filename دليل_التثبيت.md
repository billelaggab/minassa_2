# دليل التثبيت والتشغيل الشامل: منظومة الاستقصاء وإدارة المعلومات الاستخباراتية (CIIS)

> **نظام محلي آمن ومُغلق (Self-Hosted & Air-Gapped Friendly) مخصص للصحفيين والمحققين الاستقصائيين**  
> يعمل على خوادم **Ubuntu Server 22.04 / 24.04 LTS** باستخدام **Docker & Docker Compose** مع دعم كامل للغة العربية (RTL).

---

## 1. المتطلبات الأساسية للنظام (System Requirements)

- **نظام التشغيل:** خادم Ubuntu Server 22.04 LTS أو 24.04 LTS (أو أي توزيعة Linux متوافقة مع دبيان).
- **المعالج (CPU):** معالج ثنائي النواة على الأقل (يفضل 4 أنوية لعمليات معالجة مستندات WeasyPrint ومحرك البحث).
- **الذاكرة العشوائية (RAM):** 4 جيجابايت كحد أدنى (يوصى بـ 8 جيجابايت لدعم فهرسة Meilisearch وقاعدة البيانات).
- **مساحة التخزين:** 40 جيجابايت على الأقل (يفضل قرص NVMe مشفر ببروتوكول **LUKS** لحماية الأدلة الجنائية).
- **الحزم البرمجية:** Docker Engine 24+ و Docker Compose v2+.

---

## 2. تثبيت Docker و Docker Compose على خادم أوبونتو الجديد

نفذ الأوامر التالية على خادم Ubuntu لإعداد Docker وتحديث النظام:

```bash
# 1. تحديث مستودعات النظام وتثبيت أدوات الأمان الأساسية
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release ufw

# 2. إضافة مستودع Docker الرسمي ومفتاح GPG
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. تثبيت Docker Engine و Docker Compose
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. تفعيل وتشغيل خدمة Docker تلقائياً مع إقلاع النظام
sudo systemctl enable docker
sudo systemctl start docker

# 5. إضافة المستخدم الحالي لمجموعة docker لتجنب استخدام sudo دائماً
sudo usermod -aG docker $USER
newgrp docker
```

---

## 3. تنزيل وتشغيل المنصة (Deploying the Platform)

### الخطوة 1: استنساخ المشروع أو فك ضغط الأرشيف
```bash
# إنشاء مجلد للمنصة في المسار الآمن
mkdir -p /opt/investigative-system
cd /opt/investigative-system

# نسخ ملفات المشروع إلى المجلد الحالي
```

### الخطوة 2: مراجعة ملف الإعدادات البيئية (.env)
تأكد من ضبط كلمات المرور ومفاتيح التشفير المحلية:
```bash
cat << 'EOF' > .env
# Database Settings
POSTGRES_DB=investigative_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YourStrongSecretPassword_ChangeThis!
DATABASE_URL=postgresql://postgres:YourStrongSecretPassword_ChangeThis!@localhost:5432/investigative_db

# Meilisearch Settings
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_MASTER_KEY=YourStrongMeiliKey_ChangeThis_AirGapped2026!

# Security & Storage
NEXT_PUBLIC_APP_ENV=production
NEXT_TELEMETRY_DISABLED=1
STORAGE_DIR=/app/storage/uploads
EOF
```

### الخطوة 3: بناء وتشغيل الحاويات في الخلفية
```bash
docker compose up -d --build
```

### الخطوة 4: التحقق من جاهزية وحالة الحاويات
```bash
docker compose ps
```
ستظهر الحاويات الخمس التالية بحالة نشطة:
1. `ciis_gateway`: بوابة Nginx العكسية المشفرة (المنفذ 80 / 443).
2. `ciis_frontend`: واجهة الاستقصاء التفاعلية باللغة العربية (Next.js).
3. `ciis_backend`: واجهة FastAPI ومحرك توليد تقارير WeasyPrint PDF.
4. `ciis_postgres`: قاعدة بيانات PostgreSQL 15 للأشخاص وسلسلة الحيازة.
5. `ciis_meilisearch`: محرك البحث الفوري بالتطبيع اللغوي العربي.

---

## 4. تهيئة قاعدة البيانات والبيانات الاستقصائية الأولية

لتطبيق مخطط الجداول (Schema) وبث البيانات النموذجية:

```bash
# تطبيق المخطط عبر الحاوية
docker compose exec frontend npx drizzle-kit push

# زرع البيانات الأولية الاستقصائية النموذجية
docker compose exec frontend npx tsx --env-file=.env src/db/seed.ts
```

بعد اكتمال الخطوة، توجه إلى المتصفح على العنوان التالي:
- محلياً على الخادم: `http://localhost` أو `http://127.0.0.1`
- عبر الشبكة المحلية الآمنة (LAN): `http://192.168.x.x` (IP الخادم الخاص بك)

---

## 5. التشغيل في وضع العزل التام عن الإنترنت (Air-Gapped Mode)

تتميز المنصة بأنها لا تُجري أي اتصال خارجي (Zero External Calls). الخطوط وأيقونات الواجهة ومحرك البحث تعمل كلياً من الذاكرة المحلية والقرص الصلب.

لعزل الخادم برمجياً والتأكد من عدم وصوله للإنترنت الخارجي:
```bash
# حظر الاتصالات الخارجية الصادرة باستثناء الشبكة المحلية
sudo ufw default deny outgoing
sudo ufw default deny incoming

# السماح فقط بالوصول إلى المنصة عبر الشبكة المحلية (LAN Subnet)
sudo ufw allow from 192.168.1.0/24 to any port 80 proto tcp
sudo ufw allow from 192.168.1.0/24 to any port 443 proto tcp

# تفعيل الجدار الناري
sudo ufw enable
```

---

## 6. ميزات الأمان وسلسلة الحيازة الجنائية (Chain of Custody)

1. **حساب البصمات الجنائية (SHA-256):**  
   عند رفع أي ملف أو مستند مسرب أو صورة حرز، يقوم النظام تلقائياً وبشكل فوري بحساب بصمة `SHA-256` الفريدة وتخزينها في قاعدة البيانات وسجل التدقيق لمنع التشكيك في سلامة الأدلة.

2. **الحماية ضد هجمات مسار المجلدات (Path Traversal Protection):**  
   تتم معالجة وتطهير جميع أسماء الملفات المرفوعة وتوليد معرّفات مشفرة `UUID` للتخزين الفيزيائي على القرص.

3. **سجل التدقيق الأمني (Immutable Audit Trail):**  
   يسجل النظام كل عملية فتح ملف، استعراض، تصدير، أو حذف، مرفقة بالوقت وبصمة IP الخاصة بالمحقق.

---

## 7. أخذ نسخة احتياطية مشفرة واستعادتها (Encrypted Backups)

لحماية ملفات التحقيق الاستقصائي الحساسة خارجياً، استخدم الأمر التالي لأخذ نسخة احتياطية مشفرة باستخدام مفتاح GPG:

```bash
# أخذ نسخة احتياطية من قاعدة البيانات والأحراز الرقمية
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/ciis-backups"
mkdir -p $BACKUP_DIR

# تصدير قاعدة البيانات
docker compose exec -T postgres pg_dump -U postgres investigative_db > $BACKUP_DIR/db_${TIMESTAMP}.sql

# أرشفة الأحراز الرقمية وقاعدة البيانات وتشفيرها بمفتاح GPG المتماثل
tar -czf - -C /opt/investigative-system/storage uploads -C $BACKUP_DIR db_${TIMESTAMP}.sql | \
gpg --symmetric --cipher-algo AES256 -o $BACKUP_DIR/CIIS_BACKUP_${TIMESTAMP}.tar.gz.gpg

# حذف ملف الـ SQL المؤقت غير المشفر
rm $BACKUP_DIR/db_${TIMESTAMP}.sql

echo "تم إنشاء النسخة الاحتياطية المشفرة بنجاح: $BACKUP_DIR/CIIS_BACKUP_${TIMESTAMP}.tar.gz.gpg"
```

لاستعادة النسخة الاحتياطية:
```bash
# فك تشفير الأرشيف
gpg -d $BACKUP_DIR/CIIS_BACKUP_*.tar.gz.gpg | tar -xzf - -C /tmp/

# استعادة قاعدة البيانات
cat /tmp/db_*.sql | docker compose exec -T postgres psql -U postgres -d investigative_db
```

---

## 8. دليل الأوامر السريعة للصيانة

| الأمر | الوظيفة |
| :--- | :--- |
| `docker compose up -d` | تشغيل جميع الخدمات في الخلفية |
| `docker compose stop` | إيقاف مؤقت للخدمات مع حفظ البيانات |
| `docker compose down` | إيقاف الحاويات والشبكات (البيانات تظل محفوظة في الـ Volumes) |
| `docker compose logs -f backend` | متابعة سجلات خادم FastAPI المباشرة |
| `docker compose logs -f frontend` | متابعة سجلات واجهة Next.js |
| `docker compose restart meilisearch` | إعادة تشغيل محرك البحث العربي |

---

## 9. الدعم والاستفسارات الأمنية
تم تصميم هذه المنصة وفقاً لأعلى معايير أمن المعلومات الصحفية وحماية المصادر المبلغة وفق معايير بروتوكول تور وسلسلة الحيازة الدولية.
