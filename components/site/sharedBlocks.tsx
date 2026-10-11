import DesignerCta from "@/components/DesignerCta";
import LeadBanner from "@/components/LeadBanner";
import { getDraftDoc, getPart } from "@/lib/site/pages";
import { isEditing } from "@/lib/site/editMode";

/**
 * סקשנים משותפים בתוך עמוד - שלב 6ג. התוכן נקרא מהחלק המשותף
 * (part-designerCta / part-leadBanner), כך ששינוי אחד מתעדכן בכל
 * העמודים. בעריכה - הטיוטה של החלק. אין חלק במסד → התוכן מהקוד.
 */

async function partContent(name: string) {
  const doc = (await isEditing()) ? await getDraftDoc({ partId: `part-${name}` }) : await getPart(name);
  return doc?.nodes[0]?.settings?.data?.content;
}

export async function SharedDesignerCta() {
  const content = await partContent("designerCta");
  return <DesignerCta {...(content ? { content: content as never } : {})} />;
}

export async function SharedLeadBanner({ withForm }: { withForm: boolean }) {
  const content = await partContent("leadBanner");
  return <LeadBanner withForm={withForm} {...(content ? { content: content as never } : {})} />;
}
