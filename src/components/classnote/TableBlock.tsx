interface TableBlockProps {
  title: string;
  headers: string[];
  rows: string[][];
}

export function TableBlock({ title, headers, rows }: TableBlockProps) {
  return (
    <div className="bg-[#121315] border border-[#2A2C31] rounded-2xl p-6">
      <h3 className="text-[#F5F7FA] mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2C31]">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="text-left py-3 px-4 text-[#F5F7FA]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b border-[#2A2C31]/30 ${
                  rowIndex % 2 === 0 ? "bg-[#1C1D20]/30" : ""
                }`}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="py-3 px-4 text-[#E5E7EB] text-sm"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
