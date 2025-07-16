// app/[locale]/page-visitorchart.tsx
'use client'; 

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// [수정 1] props 타입을 수정하여 dataKey를 받도록 합니다.
type VisitorChartProps = {
  data: {
    date: string;
    [key: string]: any;
  }[];
  dataKey: string;
};

export default function VisitorChart({ data, dataKey }: VisitorChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-CA', { month: '2-digit', day: '2-digit' }).replace('/', '-'),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
        <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            fontSize: '12px',
          }}
          labelStyle={{ fontWeight: 'bold', color: '#111827' }}
          cursor={{ stroke: '#14b8a6', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        {/* [수정 2] dataKey와 name을 props로 받은 값으로 동적으로 설정합니다. */}
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          name={dataKey} 
          stroke="#0f766e"
          strokeWidth={2} 
          fillOpacity={1} 
          fill="url(#colorVisitors)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}