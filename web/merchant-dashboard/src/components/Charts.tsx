import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#D4A373', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336']

interface LineChartProps {
  data: any[]
  lines: { key: string; color: string; name: string }[]
  xKey?: string
  height?: number
}

export const ScanLineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  xKey = 'date',
  height = 300,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      {lines.map((l) => (
        <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} name={l.name} />
      ))}
    </LineChart>
  </ResponsiveContainer>
)

interface BarChartProps {
  data: any[]
  bars: { key: string; color: string; name: string }[]
  xKey?: string
  height?: number
}

export const CampaignBarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  xKey = 'name',
  height = 300,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      {bars.map((b) => (
        <Bar key={b.key} dataKey={b.key} fill={b.color} name={b.name} />
      ))}
    </BarChart>
  </ResponsiveContainer>
)

interface PieChartProps {
  data: { name: string; value: number }[]
  height?: number
}

export const DemographicsPieChart: React.FC<PieChartProps> = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        dataKey="value"
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
)
