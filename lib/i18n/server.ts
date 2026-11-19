import { cookies } from "next/headers";
import { normalizeLanguage, translate, TranslationKey } from "@/lib/i18n/translations";

export async function getServerTranslator() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  return { language, t: (key: TranslationKey) => translate(language, key) };
}
