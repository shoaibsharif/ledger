'use client'

import { formatCurrency } from '@/lib/currencies'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface MonthlyTrendChartProps {
  data: Array<{
    month: string
    currency: string
    owedToMe: number
    iOwe: number
  }>
  primaryCurrency: string
}

export function MonthlyTrendChart({
  data,
  primaryCurrency,
}: MonthlyTrendChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const chartData = useMemo(() => {
    return data.filter((d) => d.currency === primaryCurrency)
  }, [data, primaryCurrency])

  const formatMonth = (monthStr: string) => {
    if (!monthStr) return ''
    try {
      const date = new Date(monthStr + '-01')
      const month = date.toLocaleString('default', { month: 'short' })
      const year = date.getFullYear().toString().slice(-2)
      return `${month} '${year}`
    } catch (e) {
      return monthStr
    }
  }

  if (chartData.length === 0 || !mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-sm">
        No data available for {primaryCurrency}
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height={256}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="2 2"
            stroke="#0a0a0a"
            opacity={0.1}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={{ stroke: '#0a0a0a', strokeWidth: 1, opacity: 0.2 }}
            dy={10}
            tickFormatter={formatMonth}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: '#0a0a0a', opacity: 0.05 }}
            contentStyle={{
              backgroundColor: '#f5f0e8', // paper
              border: '2px solid #0a0a0a', // ink
              borderRadius: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              boxShadow: '4px 4px 0px 0px #0a0a0a', // ink
            }}
            formatter={(value: number | undefined, name: string | undefined) => [
              formatCurrency(value || 0, primaryCurrency),
              name,
            ]}
            labelStyle={{
              fontWeight: 'bold',
              marginBottom: 8,
              borderBottom: '1px solid #0a0a0a',
              paddingBottom: 4,
            }}
            labelFormatter={formatMonth}
          />
          <Bar
            dataKey="owedToMe"
            stackId="a"
            fill="#1a4a3a" // forest
            name="Owed to me"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="iOwe"
            stackId="a"
            fill="#c41e3a" // crimson
            name="I owe"
            radius={[0, 0, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
