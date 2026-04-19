import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Field, FieldStage } from '../types';
import { StatusBadge, StageBadge } from '../components/StatusBadge';
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  MoreVertical,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export function Fields() {
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<string | null>(null);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchFields();
    if (user?.role === 'ADMIN') {
      api.get('/users/agents').then(res => setAgents(res.data));
    }
  }, [user?.role]);

  const fetchFields = () => {
    setLoading(true);
    api.get('/fields')
      .then(res => setFields(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.cropType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;
    try {
      await api.delete(`/fields/${id}`);
      fetchFields();
    } catch (err) {
      alert('Failed to delete field');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fields</h1>
          <p className="text-gray-500 mt-1">
            {user?.role === 'ADMIN' ? 'Manage all fields and assignments' : 'View your assigned fields'}
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Field
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Fields Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredFields.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No fields found</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new field'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map(field => (
            <FieldCard
              key={field.id}
              field={field}
              isAdmin={user?.role === 'ADMIN'}
              onUpdate={() => setShowUpdateModal(field.id)}
              onDelete={() => handleDelete(field.id)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateFieldModal
          agents={agents}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchFields}
        />
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <UpdateFieldModal
          fieldId={showUpdateModal}
          currentStage={fields.find(f => f.id === showUpdateModal)?.stage || 'PLANTED'}
          onClose={() => setShowUpdateModal(null)}
          onSuccess={fetchFields}
        />
      )}
    </div>
  );
}

function FieldCard({ 
  field, 
  isAdmin, 
  onUpdate, 
  onDelete 
}: { 
  field: Field;
  isAdmin: boolean;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{field.name}</h3>
            <p className="text-sm text-gray-500">{field.cropType}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={field.status} size="sm" />
            {(isAdmin || field.status !== 'COMPLETED') && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    {field.status !== 'COMPLETED' && (
                      <button
                        onClick={() => { onUpdate(); setShowMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Update Stage
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => { onDelete(); setShowMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            Planted: {new Date(field.plantingDate).toLocaleDateString()}
          </div>
          {field.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {field.location}
            </div>
          )}
          {field.agent && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              Assigned to: {field.agent.name}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Current Stage:</span>
            <StageBadge stage={field.stage} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateFieldModal({ 
  agents, 
  onClose, 
  onSuccess 
}: { 
  agents: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    cropType: '',
    plantingDate: new Date().toISOString().split('T')[0],
    location: '',
    size: '',
    agentId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/fields', {
        ...formData,
        size: formData.size ? parseFloat(formData.size) : undefined,
        plantingDate: new Date(formData.plantingDate).toISOString()
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to create field');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create New Field</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
            <input
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <input
              required
              value={formData.cropType}
              onChange={e => setFormData({ ...formData, cropType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
            <input
              type="date"
              required
              value={formData.plantingDate}
              onChange={e => setFormData({ ...formData, plantingDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., North Sector A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size (hectares)</label>
            <input
              type="number"
              step="0.1"
              value={formData.size}
              onChange={e => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Agent</label>
            <select
              value={formData.agentId}
              onChange={e => setFormData({ ...formData, agentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Unassigned</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateFieldModal({ 
  fieldId, 
  currentStage, 
  onClose, 
  onSuccess 
}: { 
  fieldId: string;
  currentStage: FieldStage;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [stage, setStage] = useState<FieldStage>(currentStage);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const stages: FieldStage[] = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/fields/${fieldId}/updates`, { stage, notes });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to update field');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Update Field Stage</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Stage</label>
            <div className="grid grid-cols-2 gap-2">
              {stages.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    stage === s
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Observations
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="Add any observations about the field..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || stage === currentStage}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Stage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
