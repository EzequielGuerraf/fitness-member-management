type NoticeTone = "info" | "success";

interface NoticeProps {
  description: string;
  title: string;
  tone?: NoticeTone;
}

export function Notice({
  description,
  title,
  tone = "info"
}: NoticeProps) {
  return (
    <div className={`notice notice--${tone}`} role="status">
      <div>
        <p className="notice__title">{title}</p>
        <p className="notice__description">{description}</p>
      </div>
    </div>
  );
}
