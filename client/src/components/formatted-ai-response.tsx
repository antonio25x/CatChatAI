import React from "react";

interface FormattedAIResponseProps {
  content: string;
}

export function FormattedAIResponse({ content }: FormattedAIResponseProps) {
  // Basic Markdown to React elements (safe subset)
  // Bold: **text**
  // Italic: *text*
  // Inline code: `code`
  // Lists: - item
  // Newlines: <br />
  const lines = content.split(/\n+/).map((line, idx) => {
    // List item
    if (/^- /.test(line)) {
      return <li key={idx}>{line.replace(/^- /, "")}</li>;
    }
    // Bold
    let el = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`)
      // Italic
      .replace(/\*(.*?)\*/g, (_, m) => `<em>${m}</em>`)
      // Inline code
      .replace(/`([^`]+)`/g, (_, m) => `<code>${m}</code>`);
    return <span key={idx} dangerouslySetInnerHTML={{ __html: el }} />;
  });

  // Group list items
  const grouped: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    if (React.isValidElement(line) && line.type === 'li') {
      list.push(line);
    } else {
      if (list.length) {
        grouped.push(<ul key={`ul-${idx}`}>{list}</ul>);
        list = [];
      }
      grouped.push(line);
      grouped.push(<br key={`br-${idx}`} />);
    }
  });
  if (list.length) grouped.push(<ul key="ul-end">{list}</ul>);
  
  return (
    <div className="prose prose-sm prose-invert max-w-none" style={{ color: 'hsl(var(--text-primary))' }}>
      {grouped}
    </div>
  );
}
