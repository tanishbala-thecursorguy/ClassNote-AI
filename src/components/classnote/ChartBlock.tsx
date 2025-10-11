import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface ChartBlockProps {
  title: string;
  data: Array<{ name: string; value: number }>;
}

export function ChartBlock({ title, data }: ChartBlockProps) {
  return (
    <div className="bg-[#121315] border border-[#2A2C31] rounded-2xl p-6">
      <h3 className="text-[#F5F7FA] mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2C31" />
          <XAxis
            dataKey="name"
            stroke="#A6A8AD"
            tick={{ fill: "#A6A8AD", fontSize: 12 }}
          />
          <YAxis
            stroke="#A6A8AD"
            tick={{ fill: "#A6A8AD", fontSize: 12 }}
          />
          <Bar dataKey="value" fill="#F5F7FA" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
