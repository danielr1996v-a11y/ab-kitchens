import { Fragment, type ReactNode } from "react";

/**
 * ממיר טקסט עם סימוני **הדגשה** לרכיבי React,
 * ושובר שורה אוטומטית אחרי כל N מילים.
 *
 * נוח לניהול: הלקוח כותב בממשק טקסט רגיל, ועוטף מילים חשובות ב-**כוכביות**.
 * אין צורך ב-HTML ואין סכנת הזרקת קוד.
 */

type Segment = { text: string; bold: boolean };

/** מפרק טקסט לקטעים לפי סימוני ** */
function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }
  return segments;
}

/**
 * מרנדר טקסט עם הדגשות ושבירות שורה.
 *
 * שבירת שורה ידנית: מעבר שורה בטקסט (Enter בממשק הניהול) הופך ל-<br>.
 * שבירה אוטומטית: אופציונלית - כל wordsPerLine מילים. 0 = כבוי.
 *
 * @param text הטקסט, עם **הדגשות** ומעברי שורה אופציונליים
 * @param wordsPerLine כמה מילים בשורה לפני שבירה אוטומטית (0 = ידני בלבד)
 */
export function renderRichText(text: string, wordsPerLine = 0): ReactNode {
  const output: ReactNode[] = [];
  let key = 0;

  // שבירות ידניות קודמות לכל השאר - כל שורה מעובדת בנפרד
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) output.push(<br key={`mbr-${key++}`} />);

    const segments = parseSegments(line);
    let wordCount = 0;

    segments.forEach((segment) => {
      const parts = segment.text.split(/(\s+)/);

      parts.forEach((part) => {
        if (!part) return;

        const isWhitespace = /^\s+$/.test(part);

        if (isWhitespace) {
          // שוברים שורה במקום רווח, כשהגענו למכסת המילים
          if (wordsPerLine > 0 && wordCount > 0 && wordCount % wordsPerLine === 0) {
            output.push(<br key={`br-${key++}`} />);
          } else {
            output.push(<Fragment key={`sp-${key++}`}> </Fragment>);
          }
          return;
        }

        wordCount += 1;
        output.push(
          segment.bold ? (
            <strong key={`w-${key++}`}>{part}</strong>
          ) : (
            <Fragment key={`w-${key++}`}>{part}</Fragment>
          )
        );
      });
    });
  });

  return output;
}

/**
 * renderHighlight - מסמן קטע טקסט במרקר.
 *
 * תחביר: ==טקסט== יעטוף ב-<mark class="mark">.
 * נבחר תחביר שונה מ-** כדי ששני הסימונים יוכלו לחיות זה לצד זה.
 *
 * האנימציה עצמה ב-CSS, ומופעלת כשהסקשן העוטף מקבל is-visible.
 */
export function renderHighlight(text: string): ReactNode {
  const parts = text.split(/(==.+?==)/g);

  return parts.map((part, i) => {
    if (part.startsWith("==") && part.endsWith("==")) {
      return (
        <mark className="mark" key={i}>
          {part.slice(2, -2)}
        </mark>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
