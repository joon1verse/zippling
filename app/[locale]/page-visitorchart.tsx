// app/[locale]/page-visitorchart.tsx (수정된 코드)

'use client'; 

// [수정] AreaChart와 Area를 추가로 import 합니다.
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type VisitorChartProps = {
  data: {
    date: string;
    visitors: number;
  }[];
};

export default function VisitorChart({ data }: VisitorChartProps) {
  // 날짜 형식 변경 로직은 기존과 동일하게 유지합니다.
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-CA', { month: '2-digit', day: '2-digit' }).replace('/', '-'),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* [수정] LineChart를 AreaChart로 변경 */}
      <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {/* [수정] 그라데이션 색상을 정의합니다. */}
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
        {/* [수정] Line을 Area로 변경하고, 정의한 그라데이션(fill)을 적용합니다. */}
        <Area 
          type="monotone" 
          dataKey="visitors" 
          name="방문자" 
          stroke="#0f766e" // 라인 색상을 조금 더 진하게
          strokeWidth={2} 
          fillOpacity={1} 
          fill="url(#colorVisitors)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}