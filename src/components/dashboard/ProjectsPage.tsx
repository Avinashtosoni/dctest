import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Clock, X, Trash2, Edit2, Users, Loader2, AlertCircle, UserPlus, Mail } from 'lucide-react';
import { showDeleteConfirm } from '../../lib/sweetalert';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface Project {
    id: string;
    title: string;
    description: string | null;
    client_name: string;
    client_email: string | null;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    progress: number;
    budget: number | null;
    start_date: string | null;
    due_date: string | null;
    completion_date: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    member_count?: number;
}

interface ProjectMember {
    id: string;
    project_id: string;
    user_id: string;
    role: 'owner' | 'manager' | 'member' | 'viewer';
    assigned_at: string;
    user_email?: string;
}

interface User {
    id: string;
    email: string;
    role?: string;
}

const StatusBadge = ({ status }: { status: Project['status'] }) => {
    const styles = {
        planning: 'bg-purple-100 text-purple-700',
        active: 'bg-green-100 text-green-700',
        completed: 'bg-blue-100 text-blue-700',
        'on-hold': 'bg-yellow-100 text-yellow-700',
        cancelled: 'bg-red-100 text-red-700'
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>
            {status.replace('-', ' ')}
        </span>
    );
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Client selection
    const [existingClients, setExistingClients] = useState<string[]>([]);
    const [showClientDropdown, setShowClientDropdown] = useState(false);

    // Project Details & Members
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRole, setSelectedRole] = useState<'owner' | 'manager' | 'member' | 'viewer'>('member');

    // Form Fields
    const [formData, setFormData] = useState<Partial<Project>>({
        title: '',
        client_name: '',
        client_email: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        progress: 0,
        budget: null,
        start_date: null,
        due_date: null
    });

    // Fetch projects on mount
    useEffect(() => {
        fetchProjects();
        fetchExistingClients();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error: any) {
            console.error('Error fetching projects:', error);
            Swal.fire('Error', 'Failed to load projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingClients = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('client_name')
                .not('client_name', 'is', null)
                .order('client_name');

            if (error) throw error;

            // Get unique client names
            const uniqueClients = Array.from(new Set(data.map(p => p.client_name)));
            setExistingClients(uniqueClients);
        } catch (error: any) {
            console.error('Error fetching clients:', error);
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesFilter = filter === 'all' || project.status === filter;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.client_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const openCreateModal = () => {
        setEditingProject(null);
        setFormData({
            title: '',
            client_name: '',
            client_email: '',
            description: '',
            status: 'planning',
            priority: 'medium',
            progress: 0,
            budget: null,
            start_date: null,
            due_date: null
        });
        setIsModalOpen(true);
        setMenuOpenId(null);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({ ...project });
        setIsModalOpen(true);
        setMenuOpenId(null);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showDeleteConfirm('this project');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('projects')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setProjects(prev => prev.filter(p => p.id !== id));
                Swal.fire('Deleted!', 'Project has been deleted.', 'success');
            } catch (error: any) {
                console.error('Error deleting project:', error);
                Swal.fire('Error', 'Failed to delete project', 'error');
            }
        }
        setMenuOpenId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingProject) {
                // Update existing project
                const { data, error } = await supabase
                    .from('projects')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        client_name: formData.client_name,
                        client_email: formData.client_email,
                        status: formData.status,
                        priority: formData.priority,
                        progress: formData.progress,
                        budget: formData.budget,
                        start_date: formData.start_date,
                        due_date: formData.due_date
                    })
                    .eq('id', editingProject.id)
                    .select()
                    .single();

                if (error) throw error;

                setProjects(prev => prev.map(p => p.id === editingProject.id ? data : p));
                Swal.fire('Success!', 'Project updated successfully', 'success');
            } else {
                // Create new project
                const { data, error } = await supabase
                    .from('projects')
                    .insert([{
                        title: formData.title,
                        description: formData.description,
                        client_name: formData.client_name,
                        client_email: formData.client_email,
                        status: formData.status,
                        priority: formData.priority,
                        progress: formData.progress,
                        budget: formData.budget,
                        start_date: formData.start_date,
                        due_date: formData.due_date
                    }])
                    .select()
                    .single();

                if (error) throw error;

                setProjects(prev => [data, ...prev]);
                Swal.fire('Success!', 'Project created successfully', 'success');
            }

            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving project:', error);
            Swal.fire('Error', error.message || 'Failed to save project', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openProjectDetails = async (project: Project) => {
        setSelectedProject(project);
        setIsDetailsModalOpen(true);
        setMenuOpenId(null);
        await fetchProjectMembers(project.id);
        await fetchAvailableUsers();
    };

    const fetchProjectMembers = async (projectId: string) => {
        try {
            setLoadingMembers(true);
            const { data, error } = await supabase
                .from('project_members')
                .select(`
                    id,
                    project_id,
                    user_id,
                    role,
                    assigned_at
                `)
                .eq('project_id', projectId)
                .order('assigned_at', { ascending: false });

            if (error) throw error;

            // Fetch user emails for each member
            const membersWithEmails = await Promise.all(
                (data || []).map(async (member) => {
                    const { data: userData } = await supabase
                        .from('profiles')
                        .select('email')
                        .eq('id', member.user_id)
                        .single();

                    return {
                        ...member,
                        user_email: userData?.email || 'Unknown'
                    };
                })
            );

            setProjectMembers(membersWithEmails);
        } catch (error: any) {
            console.error('Error fetching members:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            Swal.fire('Error', `Failed to load project members: ${error.message || 'Unknown error'}`, 'error');
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, role')
                .order('email');

            if (error) throw error;

            console.log('Fetched users:', data);
            setAvailableUsers(data || []);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details
            });
            Swal.fire('Error', `Failed to load users: ${error.message || 'Unknown error'}`, 'error');
        }
    };

    const handleAddMember = async () => {
        if (!selectedProject || !selectedUserId) return;

        try {
            setIsSubmitting(true);

            // Check if user is already a member
            const existingMember = projectMembers.find(m => m.user_id === selectedUserId);
            if (existingMember) {
                Swal.fire('Already Added', 'This user is already a member of this project', 'info');
                return;
            }

            const { data, error } = await supabase
                .from('project_members')
                .insert([{
                    project_id: selectedProject.id,
                    user_id: selectedUserId,
                    role: selectedRole
                }])
                .select()
                .single();

            if (error) throw error;

            // Fetch user email
            const { data: userData } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', selectedUserId)
                .single();

            setProjectMembers(prev => [{
                ...data,
                user_email: userData?.email || 'Unknown'
            }, ...prev]);

            // Update member count in projects list
            setProjects(prev => prev.map(p =>
                p.id === selectedProject.id
                    ? { ...p, member_count: (p.member_count || 0) + 1 }
                    : p
            ));

            setIsAddMemberOpen(false);
            setSelectedUserId('');
            setSelectedRole('member');
            Swal.fire('Success!', 'Member added to project', 'success');
        } catch (error: any) {
            console.error('Error adding member:', error);
            Swal.fire('Error', error.message || 'Failed to add member', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!selectedProject) return;

        const confirmed = await showDeleteConfirm('this member from the project');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('project_members')
                    .delete()
                    .eq('id', memberId);

                if (error) throw error;

                setProjectMembers(prev => prev.filter(m => m.id !== memberId));

                // Update member count in projects list
                setProjects(prev => prev.map(p =>
                    p.id === selectedProject.id
                        ? { ...p, member_count: Math.max((p.member_count || 1) - 1, 0) }
                        : p
                ));

                Swal.fire('Removed!', 'Member has been removed from the project.', 'success');
            } catch (error: any) {
                console.error('Error removing member:', error);
                Swal.fire('Error', 'Failed to remove member', 'error');
            }
        }
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedProject(null);
        setProjectMembers([]);
        setIsAddMemberOpen(false);
        setSelectedUserId('');
        setSelectedRole('member');
    };

    return (
        <div className="w-full space-y-6" onClick={() => setMenuOpenId(null)}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-500">Track and manage your ongoing projects</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); openCreateModal(); }}
                    className="flex items-center space-x-2 bg-[#01478c] text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors font-medium shadow-lg shadow-blue-200"
                >
                    <Plus size={18} />
                    <span>New Project</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                    {['all', 'planning', 'active', 'completed', 'on-hold'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f
                                ? 'bg-[#01478c] text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {f === 'all' ? 'All' : f.replace('-', ' ')}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            )}

            {/* Empty State */}
            {!loading && projects.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-6">Create your first project to get started</p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center space-x-2 bg-[#01478c] text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        <span>Create Project</span>
                    </button>
                </div>
            )}

            {/* Grid */}
            {!loading && filteredProjects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <div key={project.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative">
                            <div className="flex justify-between items-start mb-4">
                                <StatusBadge status={project.status} />
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === project.id ? null : project.id); }}
                                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                                    >
                                        <MoreVertical size={20} />
                                    </button>
                                    {menuOpenId === project.id && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditModal(project); }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#01478c] transition-colors">{project.title}</h3>
                            <p className="text-sm text-gray-500 mb-6">{project.client_name}</p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                                        <span>Progress</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#01478c] rounded-full"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Clock size={16} />
                                        <span>{project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No deadline'}</span>
                                    </div>
                                    <div className="font-semibold text-gray-700">
                                        {project.budget ? `$${project.budget.toLocaleString()}` : 'No budget'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users size={16} />
                                    <span>{project.member_count || 0} members</span>
                                </div>
                                <button
                                    onClick={() => openProjectDetails(project)}
                                    className="text-sm font-medium text-[#01478c] hover:underline"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
                            <h2 className="font-bold text-lg text-gray-900">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={formData.client_name}
                                        onChange={e => {
                                            setFormData({ ...formData, client_name: e.target.value });
                                            setShowClientDropdown(e.target.value.length > 0);
                                        }}
                                        onFocus={() => setShowClientDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                                        placeholder="Type to search or add new"
                                    />
                                    {/* Client Dropdown */}
                                    {showClientDropdown && existingClients.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {existingClients
                                                .filter(client =>
                                                    client.toLowerCase().includes(formData.client_name?.toLowerCase() || '')
                                                )
                                                .slice(0, 10)
                                                .map((client, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 transition-colors"
                                                        onClick={() => {
                                                            setFormData({ ...formData, client_name: client });
                                                            setShowClientDropdown(false);
                                                        }}
                                                    >
                                                        {client}
                                                    </button>
                                                ))}
                                            {formData.client_name && !existingClients.some(c =>
                                                c.toLowerCase() === formData.client_name?.toLowerCase()
                                            ) && (
                                                    <div className="px-4 py-2 text-sm text-blue-600 bg-blue-50 border-t border-blue-100">
                                                        ✨ Add new: "{formData.client_name}"
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={formData.client_email || ''}
                                        onChange={e => setFormData({ ...formData, client_email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the project..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="on-hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.start_date || ''}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.due_date || ''}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.budget || ''}
                                    onChange={e => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : null })}
                                    placeholder="5000.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Progress ({formData.progress}%)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    value={formData.progress}
                                    onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#01478c] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                    {editingProject ? 'Update Project' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Details Modal */}
            {isDetailsModalOpen && selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeDetailsModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
                            <div>
                                <h2 className="font-bold text-xl text-gray-900">{selectedProject.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">Project Details & Team</p>
                            </div>
                            <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Project Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Client</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedProject.client_name}</p>
                                    {selectedProject.client_email && (
                                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                            <Mail size={14} />
                                            {selectedProject.client_email}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status & Priority</p>
                                    <div className="flex gap-2 mt-2">
                                        <StatusBadge status={selectedProject.status} />
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${selectedProject.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                            selectedProject.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                selectedProject.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {selectedProject.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedProject.description && (
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Description</p>
                                    <p className="text-gray-700">{selectedProject.description}</p>
                                </div>
                            )}

                            {/* Timeline & Budget */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'Not set'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedProject.due_date ? new Date(selectedProject.due_date).toLocaleDateString() : 'Not set'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Budget</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : 'Not set'}
                                    </p>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                                    <span>Project Progress</span>
                                    <span>{selectedProject.progress}%</span>
                                </div>
                                <div className="h-3 w-full bg-white rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${selectedProject.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Team Members Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Users size={20} className="text-blue-600" />
                                            Team Members
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{projectMembers.length} member(s) assigned</p>
                                    </div>
                                    {!isAddMemberOpen && (
                                        <button
                                            onClick={() => setIsAddMemberOpen(true)}
                                            className="flex items-center gap-2 bg-[#01478c] text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors text-sm font-medium"
                                        >
                                            <UserPlus size={16} />
                                            Add Member
                                        </button>
                                    )}
                                </div>

                                {/* Add Member Form */}
                                {isAddMemberOpen && (
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4 animate-in fade-in slide-in-from-top duration-200">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Select User</label>
                                                <select
                                                    value={selectedUserId}
                                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                >
                                                    <option value="">Choose a user...</option>
                                                    {availableUsers
                                                        .filter(user => !projectMembers.some(m => m.user_id === user.id))
                                                        .map(user => (
                                                            <option key={user.id} value={user.id}>
                                                                {user.email} {user.name ? `(${user.name})` : ''}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                            <div className="w-40">
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                                                <select
                                                    value={selectedRole}
                                                    onChange={(e) => setSelectedRole(e.target.value as any)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                >
                                                    <option value="viewer">Viewer</option>
                                                    <option value="member">Member</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="owner">Owner</option>
                                                </select>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <button
                                                    onClick={handleAddMember}
                                                    disabled={!selectedUserId || isSubmitting}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                >
                                                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                    Add
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAddMemberOpen(false);
                                                        setSelectedUserId('');
                                                        setSelectedRole('member');
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Members List */}
                                {loadingMembers ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="animate-spin text-blue-600" size={32} />
                                    </div>
                                ) : projectMembers.length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">No team members assigned yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Click "Add Member" to assign users to this project</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {projectMembers.map((member) => (
                                            <div key={member.id} className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center justify-between transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Users size={18} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{member.user_email}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Added {new Date(member.assigned_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                                                        member.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                                            member.role === 'member' ? 'bg-green-100 text-green-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {member.role}
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                        title="Remove member"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
