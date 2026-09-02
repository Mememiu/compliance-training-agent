import { useMemo } from 'react';

interface SimpleMarkdownProps {
  content: string;
}

/**
 * 轻量级 Markdown 渲染组件
 * 支持：标题、粗体、列表、表格、代码块、引用、分隔线
 */
export function SimpleMarkdown({ content }: SimpleMarkdownProps) {
  const elements = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div className="prose-content" style={{ color: 'var(--td-text-color-primary)' }}>
      {elements}
    </div>
  );
}

function parseMarkdown(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 跳过空行
    if (line.trim() === '') {
      i++;
      continue;
    }

    // 表格检测
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      result.push(renderTable(tableLines, key++));
      continue;
    }

    // 标题
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = parseInline(headingMatch[2]);
      result.push(renderHeading(level, text, key++));
      i++;
      continue;
    }

    // 分隔线
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      result.push(
        <hr key={key++} style={{ border: 'none', borderTop: '1px solid var(--td-component-stroke)', margin: '16px 0' }} />
      );
      i++;
      continue;
    }

    // 引用块
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      result.push(
        <blockquote
          key={key++}
          style={{
            borderLeft: '1px solid var(--td-brand-color)',
            paddingLeft: '12px',
            margin: '12px 0',
            color: 'var(--td-text-color-secondary)',
            fontStyle: 'italic',
          }}
        >
          {quoteLines.map((l, idx) => (
            <p key={idx} style={{ margin: 0 }}>{parseInline(l)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 有序列表
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      result.push(
        <ol key={key++} style={{ margin: '8px 0', paddingLeft: '24px', listStyleType: 'decimal' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.7' }}>
              {parseInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 无序列表
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ''));
        i++;
      }
      result.push(
        <ul key={key++} style={{ margin: '8px 0', paddingLeft: '24px', listStyleType: 'disc' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px', lineHeight: '1.7' }}>
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 普通段落
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('> ') &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^[-*]\s/.test(lines[i]) &&
      !lines[i].includes('|') &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      result.push(
        <p key={key++} style={{ margin: '8px 0', lineHeight: '1.8' }}>
          {paraLines.map((l, idx) => (
            <span key={idx}>
              {parseInline(l)}
              {idx < paraLines.length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    }
  }

  return result;
}

function renderHeading(level: number, text: React.ReactNode, key: number): React.ReactNode {
  const sizes = ['1.5rem', '1.25rem', '1.1rem', '1rem'];
  const margins = ['20px 0 12px', '16px 0 10px', '14px 0 8px', '12px 0 6px'];
  return (
    <div
      key={key}
      style={{
        fontSize: sizes[level - 1] || '1rem',
        fontWeight: 700,
        margin: margins[level - 1] || '12px 0 6px',
        color: 'var(--td-text-color-primary)',
        paddingBottom: level <= 2 ? '6px' : 0,
        borderBottom: level <= 2 ? '1px solid var(--td-component-stroke)' : 'none',
      }}
    >
      {text}
    </div>
  );
}

function renderTable(lines: string[], key: number): React.ReactNode {
  const rows = lines.map(line => {
    const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
    return cells;
  });

  // 第一行是表头，第二行是分隔符（跳过）
  const header = rows[0] || [];
  const body = rows.slice(2);

  return (
    <div key={key} style={{ overflowX: 'auto', margin: '12px 0' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr>
            {header.map((cell, idx) => (
              <th
                key={idx}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  backgroundColor: 'var(--td-bg-color-component)',
                  borderBottom: '2px solid var(--td-component-stroke)',
                  color: 'var(--td-text-color-primary)',
                }}
              >
                {parseInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ridx) => (
            <tr key={ridx}>
              {row.map((cell, cidx) => (
                <td
                  key={cidx}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--td-component-stroke)',
                    color: 'var(--td-text-color-primary)',
                  }}
                >
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 解析行内格式：粗体、行内代码
 */
function parseInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // 粗体 **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // 行内代码 `code`
    const codeMatch = remaining.match(/`(.+?)`/);

    // 找到最近的匹配
    const matches: Array<{ type: 'bold' | 'code'; match: RegExpMatchArray }> = [];
    if (boldMatch) matches.push({ type: 'bold', match: boldMatch });
    if (codeMatch) matches.push({ type: 'code', match: codeMatch });

    if (matches.length === 0) {
      result.push(remaining);
      break;
    }

    // 按位置排序，取最早的
    matches.sort((a, b) => (a.match.index || 0) - (b.match.index || 0));
    const earliest = matches[0];
    const idx = earliest.match.index || 0;

    // 添加前面的普通文本
    if (idx > 0) {
      result.push(remaining.slice(0, idx));
    }

    if (earliest.type === 'bold') {
      result.push(
        <strong key={key++} style={{ fontWeight: 700, color: 'var(--td-text-color-primary)' }}>
          {earliest.match[1]}
        </strong>
      );
    } else {
      result.push(
        <code
          key={key++}
          style={{
            backgroundColor: 'var(--td-bg-color-component)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontFamily: 'monospace',
          }}
        >
          {earliest.match[1]}
        </code>
      );
    }

    remaining = remaining.slice(idx + earliest.match[0].length);
  }

  return result;
}
