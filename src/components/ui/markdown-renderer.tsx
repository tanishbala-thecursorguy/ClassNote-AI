import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderMarkdown = (text: string): React.ReactElement => {
    // Split by lines
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    
    let currentList: string[] = [];
    let inList = false;
    let listType: 'bullet' | 'ordered' = 'bullet';

    let skipToIndex = -1;
    lines.forEach((line, index) => {
      // Skip table rows that were already processed
      if (index < skipToIndex) {
        return;
      }
      const trimmed = line.trim();

      // Horizontal rule
      if (trimmed.startsWith('---')) {
        if (inList) {
          elements.push(renderList(currentList, listType));
          currentList = [];
          inList = false;
        }
        elements.push(<hr key={index} className="my-4 border-gray-700" />);
        return;
      }

      // Chart detection (JSON chart data in code blocks)
      if (trimmed.startsWith('```chart') || trimmed.startsWith('```json')) {
        if (inList) {
          elements.push(renderList(currentList, listType));
          currentList = [];
          inList = false;
        }
        // Collect chart JSON until closing ```
        let chartText = '';
        let chartIndex = index;
        
        // Remove opening ```
        chartText = trimmed.replace(/```chart\s*|```json\s*/g, '').trim();
        
        // If not closed on same line, collect until closing ```
        if (!trimmed.endsWith('```')) {
          chartIndex++;
          while (chartIndex < lines.length) {
            const nextLine = lines[chartIndex].trim();
            if (nextLine.includes('```')) {
              chartText += '\n' + nextLine.replace(/```/g, '').trim();
              break;
            }
            chartText += '\n' + nextLine;
            chartIndex++;
          }
        } else {
          // Remove closing ```
          chartText = chartText.replace(/```/g, '').trim();
        }
        
        if (chartText) {
          try {
            const chartData = JSON.parse(chartText);
            if (chartData.type && chartData.data) {
              elements.push(renderChart(chartData, index));
              skipToIndex = chartIndex + 1;
              return;
            }
          } catch (e) {
            // Invalid JSON, treat as regular text
          }
        }
      }
      
      // Also detect standalone JSON chart objects
      if (trimmed.startsWith('{') && trimmed.includes('"type"') && trimmed.includes('"data"')) {
        try {
          const chartData = JSON.parse(trimmed);
          if (chartData.type && Array.isArray(chartData.data)) {
            if (inList) {
              elements.push(renderList(currentList, listType));
              currentList = [];
              inList = false;
            }
            elements.push(renderChart(chartData, index));
            return;
          }
        } catch (e) {
          // Not JSON, continue
        }
      }

      // Table detection (markdown table with | separators)
      if (trimmed.includes('|') && trimmed.split('|').length >= 3) {
        if (inList) {
          elements.push(renderList(currentList, listType));
          currentList = [];
          inList = false;
        }
        // Collect table rows until we hit a non-table line
        const tableRows: string[] = [];
        let tableIndex = index;
        while (tableIndex < lines.length && lines[tableIndex].trim().includes('|') && lines[tableIndex].trim().split('|').length >= 2) {
          tableRows.push(lines[tableIndex].trim());
          tableIndex++;
        }
        if (tableRows.length > 0) {
          elements.push(renderTable(tableRows, index));
          skipToIndex = tableIndex;
          return;
        }
      }

      // Headings
      if (trimmed.startsWith('## ')) {
        if (inList) {
          elements.push(renderList(currentList, listType));
          currentList = [];
          inList = false;
        }
        const text = trimmed.substring(3);
        elements.push(
          <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3">
            {renderInline(text)}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('### ')) {
        if (inList) {
          elements.push(renderList(currentList, listType));
          currentList = [];
          inList = false;
        }
        const text = trimmed.substring(4);
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
            {renderInline(text)}
          </h3>
        );
        return;
      }

      // Bullet points
      if (trimmed.match(/^[\*\-•]\s/)) {
        if (!inList) {
          inList = true;
          listType = 'bullet';
        }
        const text = trimmed.substring(2);
        currentList.push(text);
        return;
      }

      // Ordered list
      if (trimmed.match(/^\d+\.\s/)) {
        if (!inList) {
          inList = true;
          listType = 'ordered';
        }
        const text = trimmed.replace(/^\d+\.\s/, '');
        currentList.push(text);
        return;
      }

      // Close list if we hit a non-list line
      if (inList && trimmed !== '') {
        elements.push(renderList(currentList, listType));
        currentList = [];
        inList = false;
      }

      // Regular paragraph
      if (trimmed !== '') {
        elements.push(
          <p key={index} className="mb-3 text-gray-200 leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      } else if (elements.length > 0) {
        // Empty line - add spacing
        elements.push(<br key={`spacer-${index}`} />);
      }
    });

    // Close any remaining list
    if (inList && currentList.length > 0) {
      elements.push(renderList(currentList, listType));
    }

    return <>{elements}</>;
  };

  const renderChart = (chartData: any, keyIndex: number): React.ReactElement => {
    const { type = 'bar', title = '', data = [], xKey = 'name', yKey = 'value', colors = ['#F5F7FA'] } = chartData;
    
    const COLORS = colors.length > 0 ? colors : ['#F5F7FA', '#A6A8AD', '#6B7280', '#4B5563'];

    return (
      <div key={`chart-${keyIndex}`} className="my-6 bg-[#121315] border border-[#2A2C31] rounded-2xl p-6">
        {title && (
          <h4 className="text-[#F5F7FA] font-semibold mb-4 text-lg">{title}</h4>
        )}
        <ResponsiveContainer width="100%" height={300}>
          {type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2C31" />
              <XAxis
                dataKey={xKey}
                stroke="#A6A8AD"
                tick={{ fill: "#A6A8AD", fontSize: 12 }}
              />
              <YAxis
                stroke="#A6A8AD"
                tick={{ fill: "#A6A8AD", fontSize: 12 }}
              />
              <Bar dataKey={yKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2C31" />
              <XAxis
                dataKey={xKey}
                stroke="#A6A8AD"
                tick={{ fill: "#A6A8AD", fontSize: 12 }}
              />
              <YAxis
                stroke="#A6A8AD"
                tick={{ fill: "#A6A8AD", fontSize: 12 }}
              />
              <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} dot={{ fill: COLORS[0] }} />
            </LineChart>
          ) : type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yKey}
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <div className="text-gray-400 text-center">Unsupported chart type: {type}</div>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const renderTable = (rows: string[], keyIndex: number): React.ReactElement => {
    if (rows.length === 0) {
      return <div key={`table-${keyIndex}`} />;
    }

    // Parse table rows
    const parsedRows = rows.map(row => {
      const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      return cells;
    }).filter(row => row.length > 0);

    if (parsedRows.length === 0) {
      return <div key={`table-${keyIndex}`} />;
    }

    // First row is header, second might be separator (|---|), rest are data
    const headerRow = parsedRows[0];
    const dataRows = parsedRows.slice(1).filter(row => {
      // Skip separator rows (all dashes or empty)
      return !row.every(cell => /^[\s\-]+$/.test(cell));
    });

    return (
      <div key={`table-${keyIndex}`} className="my-4 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-[#121315]">
              {headerRow.map((cell, idx) => (
                <th key={idx} className="border border-gray-700 px-4 py-2 text-left text-white font-semibold">
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-[#1C1D20]" : "bg-[#121315]"}>
                {headerRow.map((_, colIdx) => (
                  <td key={colIdx} className="border border-gray-700 px-4 py-2 text-gray-200">
                    {colIdx < row.length ? renderInline(row[colIdx]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderList = (items: string[], type: 'bullet' | 'ordered'): React.ReactElement => {
    if (type === 'ordered') {
      return (
        <ol key={`list-${items.length}`} className="list-decimal list-inside mb-4 space-y-2 text-gray-200 ml-4">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    }
    return (
      <ul key={`list-${items.length}`} className="list-disc list-inside mb-4 space-y-2 text-gray-200 ml-4">
        {items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
  };

  const renderInline = (text: string): (string | React.ReactElement)[] => {
    const parts: (string | React.ReactElement)[] = [];
    let processedText = text;
    let key = 0;

    // First, process markdown links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    const linkMatches: Array<{index: number; length: number; text: string; url: string}> = [];
    let linkMatch;
    
    while ((linkMatch = linkRegex.exec(text)) !== null) {
      linkMatches.push({
        index: linkMatch.index,
        length: linkMatch[0].length,
        text: linkMatch[1],
        url: linkMatch[2]
      });
    }

    // Process URLs (http/https/www)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const urlMatches: Array<{index: number; length: number; url: string}> = [];
    let urlMatch;
    
    while ((urlMatch = urlRegex.exec(text)) !== null) {
      // Check if this URL is already part of a markdown link
      const isInLink = linkMatches.some(link => 
        urlMatch.index >= link.index && urlMatch.index < link.index + link.length
      );
      if (!isInLink) {
        urlMatches.push({
          index: urlMatch.index,
          length: urlMatch[0].length,
          url: urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`
        });
      }
    }

    // Combine and sort all matches by index
    const allMatches = [
      ...linkMatches.map(m => ({...m, type: 'link' as const})),
      ...urlMatches.map(m => ({...m, type: 'url' as const, text: m.url}))
    ].sort((a, b) => a.index - b.index);

    let lastIndex = 0;

    // Process bold text **text** in segments
    allMatches.forEach((match, idx) => {
      // Process text before this match (including bold)
      if (match.index > lastIndex) {
        const segment = text.substring(lastIndex, match.index);
        parts.push(...renderBoldText(segment, key));
      }

      // Add the link
      if (match.type === 'link') {
        parts.push(
          <a
            key={`link-${key++}`}
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
          >
            {match.text}
          </a>
        );
      } else {
        parts.push(
          <a
            key={`url-${key++}`}
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
          >
            {match.url}
          </a>
        );
      }

      lastIndex = match.index + match.length;
    });

    // Process remaining text after all matches
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex);
      parts.push(...renderBoldText(remaining, key));
    }

    return parts.length > 0 ? parts : [text];
  };

  const renderBoldText = (text: string, startKey: number): (string | React.ReactElement)[] => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let key = startKey;

    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(
        <strong key={`bold-${key++}`} className="font-bold text-white">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
}

