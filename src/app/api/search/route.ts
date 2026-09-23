import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { persons, contactChannels, intelligenceNotes, attachments } from "@/db/schema";
import { matchArabicQuery, normalizeArabic, SearchMatch } from "@/lib/arabic-search";

export interface RankedSearchResult {
  personId: string;
  primaryName: string;
  avatarUrl: string | null;
  occupation: string | null;
  sensitivityLevel: string;
  status: string;
  matches: SearchMatch[];
  totalScore: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ success: true, results: [], totalHits: 0 });
    }

    const allPersons = await db.select().from(persons);
    const allContacts = await db.select().from(contactChannels);
    const allNotes = await db.select().from(intelligenceNotes);
    const allFiles = await db.select().from(attachments);

    const personResultsMap = new Map<string, RankedSearchResult>();

    // Helper to get or init person result
    const getResultHolder = (p: (typeof allPersons)[0]): RankedSearchResult => {
      let holder = personResultsMap.get(p.id);
      if (!holder) {
        holder = {
          personId: p.id,
          primaryName: p.primaryName,
          avatarUrl: p.avatarUrl,
          occupation: p.occupation,
          sensitivityLevel: p.sensitivityLevel,
          status: p.status,
          matches: [],
          totalScore: 0,
        };
        personResultsMap.set(p.id, holder);
      }
      return holder;
    };

    // 1. Search in Persons (Name, Aliases, Occupation, Summary, Address)
    for (const p of allPersons) {
      // Primary name
      const nameMatch = matchArabicQuery(p.primaryName, query, "primaryName", "الاسم الكامل");
      if (nameMatch) {
        const holder = getResultHolder(p);
        holder.matches.push({ ...nameMatch, score: nameMatch.score + 50 }); // Higher weight for name
        holder.totalScore += nameMatch.score + 50;
      }

      // Aliases
      if (p.aliases) {
        try {
          const aliasArray: string[] = JSON.parse(p.aliases);
          for (const alias of aliasArray) {
            const aliasMatch = matchArabicQuery(alias, query, "alias", "اسم حركي / مستعار");
            if (aliasMatch) {
              const holder = getResultHolder(p);
              holder.matches.push({ ...aliasMatch, score: aliasMatch.score + 40 });
              holder.totalScore += aliasMatch.score + 40;
            }
          }
        } catch {
          const aliasMatch = matchArabicQuery(p.aliases, query, "alias", "اسم حركي");
          if (aliasMatch) {
            const holder = getResultHolder(p);
            holder.matches.push(aliasMatch);
            holder.totalScore += aliasMatch.score;
          }
        }
      }

      // Occupation
      const occMatch = matchArabicQuery(p.occupation, query, "occupation", "المهنة / الغطاء");
      if (occMatch) {
        const holder = getResultHolder(p);
        holder.matches.push(occMatch);
        holder.totalScore += occMatch.score;
      }

      // Summary
      const summaryMatch = matchArabicQuery(p.summary, query, "summary", "ملخص التحقيق");
      if (summaryMatch) {
        const holder = getResultHolder(p);
        holder.matches.push(summaryMatch);
        holder.totalScore += summaryMatch.score;
      }

      // Address
      const addressMatch = matchArabicQuery(p.address, query, "address", "العنوان الفعلي");
      if (addressMatch) {
        const holder = getResultHolder(p);
        holder.matches.push(addressMatch);
        holder.totalScore += addressMatch.score;
      }
    }

    // 2. Search in Contact Channels (Phone numbers, Emails, Handles, Carrier notes)
    for (const c of allContacts) {
      const person = allPersons.find((p) => p.id === c.personId);
      if (!person) continue;

      const valMatch = matchArabicQuery(
        c.value,
        query,
        c.channelType,
        c.channelType === "phone"
          ? "رقم هاتف"
          : c.channelType === "email"
          ? "عنوان بريد"
          : "معرّف اجتماعي"
      );
      if (valMatch) {
        const holder = getResultHolder(person);
        holder.matches.push({ ...valMatch, score: valMatch.score + 30 });
        holder.totalScore += valMatch.score + 30;
      }

      if (c.carrierNotes) {
        const carrierMatch = matchArabicQuery(c.carrierNotes, query, "carrierNotes", "ملاحظات الشبكة");
        if (carrierMatch) {
          const holder = getResultHolder(person);
          holder.matches.push(carrierMatch);
          holder.totalScore += carrierMatch.score;
        }
      }
    }

    // 3. Search in Intelligence & Field Notes (Title, Content)
    for (const n of allNotes) {
      const person = allPersons.find((p) => p.id === n.personId);
      if (!person) continue;

      const titleMatch = matchArabicQuery(n.title, query, "noteTitle", "عنوان تقرير الملاحظة");
      if (titleMatch) {
        const holder = getResultHolder(person);
        holder.matches.push({ ...titleMatch, score: titleMatch.score + 25 });
        holder.totalScore += titleMatch.score + 25;
      }

      const contentMatch = matchArabicQuery(n.content, query, "noteContent", "نص التقرير الاستخباراتي");
      if (contentMatch) {
        const holder = getResultHolder(person);
        holder.matches.push(contentMatch);
        holder.totalScore += contentMatch.score;
      }
    }

    // 4. Search in Document & Media Attachments (Filename, Context description, SHA256)
    for (const f of allFiles) {
      const person = allPersons.find((p) => p.id === f.personId);
      if (!person) continue;

      const fileMatch = matchArabicQuery(f.originalFilename, query, "filename", "اسم الحرز الرقمي");
      if (fileMatch) {
        const holder = getResultHolder(person);
        holder.matches.push({ ...fileMatch, score: fileMatch.score + 20 });
        holder.totalScore += fileMatch.score + 20;
      }

      if (f.contextDescription) {
        const descMatch = matchArabicQuery(f.contextDescription, query, "fileDescription", "وصف الحرز الجنائي");
        if (descMatch) {
          const holder = getResultHolder(person);
          holder.matches.push(descMatch);
          holder.totalScore += descMatch.score;
        }
      }

      if (f.sha256Hash.toLowerCase().includes(query.toLowerCase().trim())) {
        const holder = getResultHolder(person);
        holder.matches.push({
          field: "sha256Hash",
          fieldLabel: "بصمة التشفير الجنائي SHA-256",
          originalText: f.sha256Hash,
          snippet: `بصمة تطابق الحرز: ${f.sha256Hash}`,
          score: 100,
        });
        holder.totalScore += 100;
      }
    }

    // Sort results by totalScore descending
    const sortedResults = Array.from(personResultsMap.values()).sort(
      (a, b) => b.totalScore - a.totalScore
    );

    return NextResponse.json({
      success: true,
      query,
      normalizedQuery: normalizeArabic(query),
      totalHits: sortedResults.length,
      results: sortedResults,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ success: false, error: "فشل البحث" }, { status: 500 });
  }
}
