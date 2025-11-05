'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { KoperasiType } from '../../types';
import { getKoperasiTypeLabel } from '../../lib/mockData';

interface TypeDistributionChartProps {
  data: {
    type: KoperasiType;
    count: number;
    percentage: number;
  }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function TypeDistributionChart({ data }: TypeDistributionChartProps) {
  const chartData = data.map((item, index) => ({
    name: getKoperasiTypeLabel(item.type),
    value: item.count,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Jumlah: {data.value} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Distribusi Jenis Koperasi
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatusOverviewChartProps {
  activeCount: number;
  inactiveCount: number;
  legalCount: number;
  pendingLegalCount: number;
}

export function StatusOverviewChart({ 
  activeCount, 
  inactiveCount, 
  legalCount, 
  pendingLegalCount 
}: StatusOverviewChartProps) {
  const data = [
    {
      name: 'Status Operasional',
      Aktif: activeCount,
    },
    {
      name: 'Status Legal',
      Legal: legalCount,
      Pending: pendingLegalCount,
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Overview Status Koperasi
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Aktif" fill="#10B981" />
            <Bar dataKey="Legal" fill="#3B82F6" />
            <Bar dataKey="Pending" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
