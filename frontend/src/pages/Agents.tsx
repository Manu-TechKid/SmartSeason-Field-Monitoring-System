import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { User, Field } from '../types';
import { Users, Mail, MapPin } from 'lucide-react';

export function Agents() {
  const [agents, setAgents] = useState<(User & { assignedFields?: Field[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, fieldsRes] = await Promise.all([
          api.get('/users/agents'),
          api.get('/fields')
        ]);
        
        const fields: Field[] = fieldsRes.data;
        const agentsWithFields = agentsRes.data.map((agent: User) => ({
          ...agent,
          assignedFields: fields.filter(f => f.agentId === agent.id)
        }));
        
        setAgents(agentsWithFields);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Field Agents</h1>
        <p className="text-gray-500 mt-1">
          View all field agents and their assigned fields
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No agents found</h3>
          <p className="text-gray-500 mt-1">Field agents will appear here once registered</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-700">
                    {agent.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  <span className="font-medium">{agent.assignedFields?.length || 0}</span>
                  <span>fields assigned</span>
                </div>
                
                {agent.assignedFields && agent.assignedFields.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.assignedFields.slice(0, 3).map(field => (
                      <span
                        key={field.id}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700"
                      >
                        {field.name}
                      </span>
                    ))}
                    {agent.assignedFields.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-500">
                        +{agent.assignedFields.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
