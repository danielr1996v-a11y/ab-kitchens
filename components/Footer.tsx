import { site, nav } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="container-full py-12 border-t border-[var(--color-border)] mt-auto">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div>
          <p className="text-lg font-bold">{site.name}</p>
          <p className="text-sm text-[var(--color-muted)] mt-2">{site.address}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-[var(--color-accent)]">
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <a href={`tel:${site.phone1}`} className="hover:text-[var(--color-accent)]">{site.phone1}</a>
          <a href={`tel:${site.phone2}`} className="hover:text-[var(--color-accent)]">{site.phone2}</a>
          <a href={`mailto:${site.email}`} className="hover:text-[var(--color-accent)]">{site.email}</a>
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted)] mt-10">
        © {new Date().getFullYear()} {site.name}. כל הזכויות שמורות.
      </p>
    </footer>
  );
}
