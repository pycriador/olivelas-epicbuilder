import { parseInlineMarkdown } from "@/lib/organize-hub-body";

/** Renders inline markdown (**bold**, *italic*) without showing markers. */
export function HubRichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const segments = parseInlineMarkdown(text);
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.bold) {
          return (
            <strong key={i} className="font-semibold text-primary">
              {seg.text}
            </strong>
          );
        }
        if (seg.italic) {
          return (
            <em key={i} className="italic">
              {seg.text}
            </em>
          );
        }
        return <span key={i}>{seg.text}</span>;
      })}
    </span>
  );
}
