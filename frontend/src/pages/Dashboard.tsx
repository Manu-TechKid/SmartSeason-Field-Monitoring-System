import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { DashboardStats } from '../types';
import { StatusBadge, StageBadge } from '../components/StatusBadge';
import { 
  Sprout, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#6b7280'];
const STAGE_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fields/stats/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statusData = [
    { name: 'Active', value: stats.statusBreakdown.active, color: COLORS[0] },
    { name: 'At Risk', value: stats.statusBreakdown.atRisk, color: COLORS[1] },
    { name: 'Completed', value: stats.statusBreakdown.completed, color: COLORS[2] },
  ].filter(d => d.value > 0);

  const stageData = [
    { name: 'Planted', value: stats.stageBreakdown.planted, color: STAGE_COLORS[0] },
    { name: 'Growing', value: stats.stageBreakdown.growing, color: STAGE_COLORS[1] },
    { name: 'Ready', value: stats.stageBreakdown.ready, color: STAGE_COLORS[2] },
    { name: 'Harvested', value: stats.stageBreakdown.harvested, color: STAGE_COLORS[3] },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your fields today
          </p>
        </div>
        <Link
          to="/fields"
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          View all fields
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Sprout}
          label="Total Fields"
          value={stats.totalFields}
          color="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active"
          value={stats.statusBreakdown.active}
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="At Risk"
          value={stats.statusBreakdown.atRisk}
          color="red"
          alert={stats.statusBreakdown.atRisk > 0}
        />
        <StatCard
          icon={TrendingUp}
          label="Completed"
          value={stats.statusBreakdown.completed}
          color="gray"
        />
      </div>

      {/* Charts & Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              Field Distribution
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Status Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-4 text-center">By Status</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stage Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-4 text-center">By Stage</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            Recent Updates
          </h3>
          
          {stats.recentUpdates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent updates</p>
          ) : (
            <div className="space-y-4">
              {stats.recentUpdates.map(update => (
                <div key={update.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {update.field.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Updated to <StageBadge stage={update.stage} size="sm" />
                    </p>
                    {update.notes && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {update.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      by {update.agent?.name} • {new Date(update.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  alert 
}: { 
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  alert?: boolean;
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${alert ? 'border-red-200' : 'border-gray-200'} p-6`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
