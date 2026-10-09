/**
 * שאלות ותשובות - רכיב משותף.
 *
 * ⚠️ הוצא מתוך KitchenPage בשלב 2 של מערכת הניהול (09.10.26):
 * עמוד הדוגמה צריך להציג את אותו רכיב בדיוק, ולא העתק של
 * ה-markup שיכול להיפרד ממנו. בעורך הוויזואלי זה יהיה האקורדיון.
 *
 * <details> מקורי: נפתח בלי JS, נגיש למקלדת, ונשאר קריא גם אם
 * הסקריפטים לא נטענו.
 */
export default function Faq({
  title,
  items,
}: {
  title: string;
  items: Array<{ q: string; a: string }>;
}) {
  return (
    <section className="kfaq" aria-labelledby="faq-title">
      <h2 className="kpage__section-title" id="faq-title">
        {title}
      </h2>
      <div className="kfaq__list">
        {items.map((item) => (
          <details className="kfaq__item" key={item.q}>
            <summary className="kfaq__q">
              <span>{item.q}</span>
              <span className="kfaq__sign" aria-hidden="true" />
            </summary>
            <p className="kfaq__a">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
