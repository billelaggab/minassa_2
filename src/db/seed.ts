import { db } from "./index";
import { persons, contactChannels, intelligenceNotes, relationships, attachments, auditLogs } from "./schema";
import crypto from "node:crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function seedDatabase() {
  console.log("Checking if database already has seed data...");
  const existingPersons = await db.select().from(persons);
  if (existingPersons.length > 0) {
    console.log(`Database already has ${existingPersons.length} persons.`);
    return;
  }

  console.log("Seeding investigative intelligence database...");

  // Person 1: طارق المنصوري
  const [tariq] = await db
    .insert(persons)
    .values({
      primaryName: "طارق عبد الرحمن المنصوري",
      aliases: JSON.stringify(["الوسيط المالي", "أبو يوسف", "Falcon-7", "العراب"]),
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      dob: "1978-04-12",
      nationality: "إماراتي / كندي",
      occupation: "رئيس مجلس إدارة شركة أوريون للملاحة والاستشارات البحرية",
      address: "دبي، مرسى دبي - برج الأمواج، البنتهاوس 42",
      reliabilityRating: 4,
      sensitivityLevel: "top_secret",
      status: "under_investigation",
      summary:
        "الهدف الرئيسي في التحقيق الاستقصائي بشأن غسيل الأموال وتهريب شحنات النفط الخاضعة للعقوبات عبر شركات ملاحة وهمية في جزر العذراء البريطانية وسيشيل. يدير شبكة معقدة من الحسابات المصرفية في سويسرا وقبرص وليتوانيا.",
    })
    .returning();

  // Person 2: د. ليلى البغدادي
  const [leila] = await db
    .insert(persons)
    .values({
      primaryName: "الدكتورة ليلى كمال البغدادي",
      aliases: JSON.stringify(["المستشارة القانونية", "صندوق الأسرار", "Lady Justice"]),
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face",
      dob: "1982-11-03",
      nationality: "لبنانية / فرنسية",
      occupation: "شريكة إدارية في مكتب البغدادي وشركاه للمحاماة الدولية",
      address: "بيروت، منطقة فردان - سنتر الصخرة، الطابق السادس",
      reliabilityRating: 5,
      sensitivityLevel: "confidential",
      status: "monitored",
      summary:
        "العقل القانوني لشبكة الشركات الأوفشور التابعة لطارق المنصوري. تشرف على صياغة عقود الخدمات الاستشارية الوهمية وإنشاء الصناديق الائتمانية المعقدة لحجب المالك المستفيد النهائي.",
    })
    .returning();

  // Person 3: سالم الهاشمي
  const [salem] = await db
    .insert(persons)
    .values({
      primaryName: "سالم محمود الهاشمي",
      aliases: JSON.stringify(["المحاسب المبلّغ", "المهندس المالي", "Deep Throat 2"]),
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
      dob: "1985-02-19",
      nationality: "أردني",
      occupation: "رئيس قسم الامتثال والتدقيق المالي الداخلي (سابقاً)",
      address: "عمّان، عبدون - شارع دمشق (موقع آمن تحت حماية المصادر)",
      reliabilityRating: 5,
      sensitivityLevel: "top_secret",
      status: "source",
      summary:
        "المصدر السري والمبلغ الرئيسي للتحقيق. سلّم الفريق الاستقصائي محركات أقراص مشفرة تحتوي على أكثر من 4,200 رسالة بريد إلكتروني وجدول تحويلات سويفت (SWIFT) تثبت دفع رشاوى لمسؤولين في موانئ البحر المتوسط.",
    })
    .returning();

  // Person 4: كريم عبد الجبار
  const [karim] = await db
    .insert(persons)
    .values({
      primaryName: "كريم ممدوح عبد الجبار",
      aliases: JSON.stringify(["الظل الجمركي", "أبو رامي", "Sea Captain"]),
      avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face",
      dob: "1974-08-30",
      nationality: "مصري",
      occupation: "وسيط جمركي معتمد ومدير التخليص في ميناء بورسعيد والإسكندرية",
      address: "الإسكندرية، المنشية - عمارة الشحن البحري، شقة 14",
      reliabilityRating: 2,
      sensitivityLevel: "confidential",
      status: "under_investigation",
      summary:
        "مسؤول عن تزوير شهادات المنشأ وبوالص الشحن لتسهيل دخول وتفريغ الشحنات غير المصرح بها، يتلقى عمولاته نقدياً وعبر محافظ عملات مشفرة تابعة لشركة أوريون.",
    })
    .returning();

  // Person 5: فيكتور رومانوف
  const [victor] = await db
    .insert(persons)
    .values({
      primaryName: "فيكتور رومانوف (Victor Romanov)",
      aliases: JSON.stringify(["Mr. Gray", "الوسيط القبرصي", "The Vault"]),
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face",
      dob: "1970-06-15",
      nationality: "سويسري / قبرصي",
      occupation: "مدير محفظة استثمارية وشريك بنك الأصول الخاصة في ليمماسول",
      address: "زيورخ، بانهوفشتراسه 104 / ليماسول، الواجهة البحرية",
      reliabilityRating: 3,
      sensitivityLevel: "top_secret",
      status: "under_investigation",
      summary:
        "العقدة المالية الخارجية التي تربط الشركات الوهمية في الشرق الأوسط بالمصارف الأوروبية وأسواق الذهب والعملات الرقمية في سويسرا.",
    })
    .returning();

  // Insert Contact Channels for Tariq
  await db.insert(contactChannels).values([
    {
      personId: tariq.id,
      channelType: "phone",
      value: "+971501234567",
      label: "شخصي رئيسي",
      hasWhatsapp: true,
      hasSignal: true,
      hasTelegram: true,
      carrierNotes: "مزود الخدمة: اتصالات الإمارات - شريحة مسجلة باسم شركة أوريون للملاحة",
    },
    {
      personId: tariq.id,
      channelType: "phone",
      value: "+447700900123",
      label: "هاتف سري (Burner)",
      hasWhatsapp: false,
      hasSignal: true,
      hasTelegram: false,
      carrierNotes: "شريحة مدفوعة مسبقاً غير مسجلة (UK O2) يتم تشغيلها في أيام محددة فقط",
    },
    {
      personId: tariq.id,
      channelType: "email",
      value: "t.mansouri@orion-maritime.ae",
      label: "بريد رسمي للشركة",
      pgpPublicKey: null,
      carrierNotes: "خوادم البريد مستضافة لدى ميكروسوفت أوفيس 365",
    },
    {
      personId: tariq.id,
      channelType: "email",
      value: "falcon_ops77@proton.me",
      label: "بريد مشفر شديد السرية",
      pgpPublicKey:
        "-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: ProtonMail\n\nmQENBF2/33gBCADcO6qZ8...CLASSIFIED_FALCON_KEY...\n=9XkL\n-----END PGP PUBLIC KEY BLOCK-----",
      carrierNotes: "مستخدم للتواصل الحصري مع الوسيط القبرصي والمحامية في بيروت",
    },
    {
      personId: tariq.id,
      channelType: "social",
      value: "@tariq_orion_ops",
      label: "تيليغرام سري",
      profileUrl: "https://t.me/tariq_orion_ops",
      carrierNotes: "جلسة نشطة مع تفعيل ميزة التدمير الذاتي للرسائل بعد 24 ساعة",
    },
  ]);

  // Contact Channels for Leila
  await db.insert(contactChannels).values([
    {
      personId: leila.id,
      channelType: "phone",
      value: "+9611800200",
      label: "مكتب المحاماة ببيروت",
      hasWhatsapp: false,
      hasSignal: false,
      hasTelegram: false,
      carrierNotes: "خط أرضي ثابت لمكتب المحاماة في فردان",
    },
    {
      personId: leila.id,
      channelType: "phone",
      value: "+9613987654",
      label: "هاتف محمول خاص",
      hasWhatsapp: true,
      hasSignal: true,
      hasTelegram: true,
      carrierNotes: "مزود الخدمة: تاتش لبنان - مفعل بخاصية التشفير التلقائي",
    },
    {
      personId: leila.id,
      channelType: "email",
      value: "leila.baghdadi@baghdadi-law.com",
      label: "بريد مهني معتمد",
      pgpPublicKey: null,
      carrierNotes: "خادم مخصص في جنيف",
    },
    {
      personId: leila.id,
      channelType: "email",
      value: "l.baghdadi.private@tuta.io",
      label: "بريد تيلدا المشفر",
      pgpPublicKey: "-----BEGIN PGP PUBLIC KEY BLOCK-----\nmQENBF4...LEILA_LEGAL_PGP_KEY...\n-----END PGP PUBLIC KEY BLOCK-----",
      carrierNotes: "صندوق البريد المشفر المستخدم لتبادل مسودات الشركات الائتمانية",
    },
  ]);

  // Contact Channels for Salem (Whistleblower)
  await db.insert(contactChannels).values([
    {
      personId: salem.id,
      channelType: "phone",
      value: "+962799988776",
      label: "هاتف طوارئ محمي",
      hasWhatsapp: false,
      hasSignal: true,
      hasTelegram: false,
      carrierNotes: "لا يُستخدم إلا عبر تطبيق سيغنال بميزة أرقام الأمان والتحقق من المفاتيح",
    },
    {
      personId: salem.id,
      channelType: "email",
      value: "source_whistleblower@proton.me",
      label: "قناة التسريب الآمنة",
      pgpPublicKey:
        "-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: Keybase OpenPGP v2.1.13\n\nmQINBF...SECURE_SOURCE_SALEM_KEY...\n-----END PGP PUBLIC KEY BLOCK-----",
      carrierNotes: "التواصل محكوم ببروتوكول أمني صارم بعدم ذكر الأسماء الصريحة عبر الرسائل",
    },
  ]);

  // Intelligence Notes
  const [note1] = await db
    .insert(intelligenceNotes)
    .values({
      personId: tariq.id,
      title: "محضر رصد ميداني: اجتماع فندق إمبيريال في فيينا",
      category: "meeting_log",
      eventDate: "2024-11-14",
      isConfidential: true,
      content:
        "رصد الفريق الاستقصائي وصول طارق المنصوري إلى العاصمة النمساوية فيينا عبر رحلة خاصة. التقى في صالة رجال الأعمال بفندق إمبيريال مع مندوب من مصرف سويسري ووسيط روسي.\n\nالنقاط المرصودة:\n1. تم استعراض ملفات ورقية تحتوي على كشوفات حسابات لشركة 'Ocean Crest Limited' المسجلة في جزر مارشال.\n2. دار نقاش حاد حول رفض بنك أوروبي تمرير تحويل بقيمة 14.8 مليون يورو بسبب اشتباه في غسيل أموال.\n3. اتفق الطرفان على تفتيت المبلغ إلى دفعات تقل عن 500 ألف يورو وتحويلها عبر 6 شركات استشارية في نيقوسيا ودبي.",
    })
    .returning();

  const [note2] = await db
    .insert(intelligenceNotes)
    .values({
      personId: tariq.id,
      title: "أثر مالي: تدفقات الحسابات البنكية لشركة أوريون للملاحة",
      category: "financial_trail",
      eventDate: "2024-12-05",
      isConfidential: false,
      content:
        "مراجعة الكشوفات المالية المسربة من البنك الوسيط:\n- تم رصد 32 تحويلاً نقدياً خلال النصف الثاني من 2024 بإجمالي 48.5 مليون دولار.\n- المرسل الأساسي: عقود صيانة بحرية واستشارات وهمية لا تقابلها أي أنشطة فعلية على أرض الواقع.\n- المستفيد النهائي: حسابات استثمارية في زيورخ باسم فيكتور رومانوف وأفراد من عائلة المنصوري.",
    })
    .returning();

  const [note3] = await db
    .insert(intelligenceNotes)
    .values({
      personId: salem.id,
      title: "إفادة المبلغ: آلية التلاعب بالسجلات وتخطي بروتوكولات مكافحة غسيل الأموال",
      category: "source_leak",
      eventDate: "2025-01-18",
      isConfidential: true,
      content:
        "أفاد سالم الهاشمي خلال جلسة استجواب سرية استغرقت 4 ساعات:\n'كانت التعليمات تأتي شفهياً من مكتب الإدارة العليا بعدم إرسال إخطارات الأنشطة المشبوهة (SARs) إلى وحدة التحريات المالية، وإدراج شركات طارق المنصوري ضمن القائمة البيضاء الموثوقة لتجاوز الفلاتر الآلية للمصرف. قمت بنسخ قاعدة بيانات المعاملات الكاملة قبل تقديم استقالتي ومغادرة مقر العمل.'",
    })
    .returning();

  const [note4] = await db
    .insert(intelligenceNotes)
    .values({
      personId: leila.id,
      title: "فحص خلفية: شبكة الشركات العابرة للحدود في لوكسمبورغ وجنيف",
      category: "background_check",
      eventDate: "2025-02-02",
      isConfidential: false,
      content:
        "أظهرت وثائق السجل التجاري في لوكسمبورغ أن د. ليلى البغدادي تشغل منصب مدير غير تنفيذي في 14 شركة قابضة. تشير عقود التأسيس إلى أن حقوق التصويت مقيدة باتفاقيات سرية تعود ملكيتها إلى طارق المنصوري ومستثمرين لم يتم الإفصاح عنهم.",
    })
    .returning();

  // Relationships (Network Graph)
  await db.insert(relationships).values([
    {
      sourcePersonId: tariq.id,
      targetPersonId: leila.id,
      relationshipType: "lawyer",
      confidenceScore: "confirmed",
      contextNotes: "المحامية الاستراتيجية والوكيلة الحصرية لإدارة الصناديق الائتمانية وتأسيس الشركات الوهمية للمنصوري.",
    },
    {
      sourcePersonId: tariq.id,
      targetPersonId: victor.id,
      relationshipType: "business_partner",
      confidenceScore: "confirmed",
      contextNotes: "شريك مالي خارجي لإدارة محافظ الاستثمار وتسهيل الصفقات عبر بنوك سويسرا وقبرص.",
    },
    {
      sourcePersonId: tariq.id,
      targetPersonId: karim.id,
      relationshipType: "accomplice",
      confidenceScore: "suspected",
      contextNotes: "المنسق الميداني للتخليص الجمركي وتعديل بوالص الشحن غير القانونية في موانئ البحر الأبيض المتوسط.",
    },
    {
      sourcePersonId: salem.id,
      targetPersonId: tariq.id,
      relationshipType: "whistleblower",
      confidenceScore: "confirmed",
      contextNotes: "المحاسب الداخلي الذي كشف التجاوزات وسلّم أدلة التحويلات المصرفية المشبوهة للصحفيين.",
    },
    {
      sourcePersonId: leila.id,
      targetPersonId: victor.id,
      relationshipType: "broker",
      confidenceScore: "confirmed",
      contextNotes: "التنسيق القانوني المستمر لتحويل الأموال من لوكسمبورغ إلى ليماسول وزيورخ وتجهيز عقود الاستثمار.",
    },
  ]);

  // Cryptographic Attachments & Evidence with real SHA-256 Chain of Custody
  const samplePdfDummy =
    "JVBERi0xLjQKJcOkw7zDtsOfCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2OCAwMDAwMCBuIAowMDAwMDAwMTI1IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA0Ci9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjE5NQolJUVPRg==";

  const pdfHash = sha256(samplePdfDummy);
  const photoHash = sha256("FORENSIC_PHOTO_SAMPLE_HASH_VIENNA_2024_11_14");
  const contractHash = sha256("FORENSIC_ORION_CONTRACT_HASH_MARSHALL_ISLANDS");

  await db.insert(attachments).values([
    {
      personId: tariq.id,
      noteId: note1.id,
      originalFilename: "محضر_رصد_فيينا_فندق_إمبيريال.pdf",
      storedFilename: `evidence_${crypto.randomUUID()}.pdf`,
      mimeType: "application/pdf",
      fileSize: 452819,
      sha256Hash: pdfHash,
      contextDescription: "تقرير استخباراتي مصور مع لقطات فيديو مفرغة لمحادثات طاولة فيينا وتحديد هويات الحاضرين.",
      fileData: `data:application/pdf;base64,${samplePdfDummy}`,
      isSensitive: true,
    },
    {
      personId: tariq.id,
      noteId: note2.id,
      originalFilename: "كشوفات_سويفت_بنك_أوريون_المسربة.pdf",
      storedFilename: `evidence_${crypto.randomUUID()}.pdf`,
      mimeType: "application/pdf",
      fileSize: 1284902,
      sha256Hash: contractHash,
      contextDescription: "نسخ رقمية معتمدة من أوامر التحويل البنكية بختم المقاصة الدولية تثبت حركة 48.5 مليون دولار.",
      fileData: `data:application/pdf;base64,${samplePdfDummy}`,
      isSensitive: true,
    },
    {
      personId: tariq.id,
      noteId: note1.id,
      originalFilename: "صورة_مراقبة_سرية_لقاء_المنصوري.jpg",
      storedFilename: `evidence_${crypto.randomUUID()}.jpg`,
      mimeType: "image/jpeg",
      fileSize: 894102,
      sha256Hash: photoHash,
      contextDescription: "صورة ملتقطة بعدسة مقربة أثناء مصافحة طارق المنصوري للوسيط في بهو الفندق.",
      fileData: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&fit=crop",
      isSensitive: false,
    },
    {
      personId: salem.id,
      noteId: note3.id,
      originalFilename: "إفادة_المصدر_الخطيّة_الموقعة.pdf",
      storedFilename: `evidence_${crypto.randomUUID()}.pdf`,
      mimeType: "application/pdf",
      fileSize: 310440,
      sha256Hash: sha256("SALEM_DEPOSITION_2025_CONFIDENTIAL"),
      contextDescription: "الشهادة الخطية الأصلية الموقعة من المحاسب المبلّغ مع بصمة الإبهام الموثقة قانونياً.",
      fileData: `data:application/pdf;base64,${samplePdfDummy}`,
      isSensitive: true,
    },
  ]);

  // Insert initial audit logs
  await db.insert(auditLogs).values([
    {
      action: "INITIAL_DATABASE_BOOTSTRAP",
      entityType: "system",
      entityId: "SYS-001",
      details: "تهيئة النظام الاستقصائي الأولي وتشفير المفاتيح المحلية وتوليد جداول الأدلة الجنائية.",
      ipAddress: "127.0.0.1",
    },
    {
      action: "DOSSIER_ACCESSED",
      entityType: "person",
      entityId: tariq.id,
      details: "فتح ملف الهدف طارق عبد الرحمن المنصوري من محطة العمل الاستقصائية الآمنة.",
      ipAddress: "127.0.0.1",
    },
  ]);

  console.log("Database seeded successfully with 5 investigative dossiers!");
}

if (process.argv[1]?.includes("seed")) {
  seedDatabase()
    .then(() => {
      console.log("Seed script completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
