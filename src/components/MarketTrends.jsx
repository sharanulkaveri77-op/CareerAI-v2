import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function MarketTrends({ data }) {
  const chartData = (data || []).map((d) => ({
    month: d.month || d.label,
    Demand: d.demand ?? d.Demand,
    Salary: d.salary ?? d.Salary,
  }))

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-500">
        No trend data available yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: '#151320',
            border: '1px solid #ffffff10',
            borderRadius: 12,
            color: '#fff',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
        <Line
          type="monotone"
          dataKey="Demand"
          stroke="#a855f7"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Salary"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
