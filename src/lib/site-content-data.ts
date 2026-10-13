import { defaultSiteContent, siteContentSchema } from "@/lib/site-content";
import { prisma } from "@/lib/db";

export async function getSiteContent() {
  if (!process.env.DATABASE_URL) return defaultSiteContent;

  const savedContent = await prisma.siteContent.findUnique({
    where: { id: "main" },
    select: { content: true },
  });
  if (!savedContent) return defaultSiteContent;

  return siteContentSchema.parse(savedContent.content);
}
