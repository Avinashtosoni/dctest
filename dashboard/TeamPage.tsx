import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    MoreVertical,
    Trash2,
    Edit3,
    Github,
    Twitter,
    Linkedin,
    Mail,
    XCircle,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { showDeleteConfirm } from '../../lib/sweetalert';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    image: string | null;
    status: 'Active' | 'On Leave';
    linkedin?: string | null;
    twitter?: string | null;
    github?: string | null;
    email?: string | null;
    display_order?: number;
    visible?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function TeamPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState<Partial<TeamMember>>({});
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch team members from database
    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setMembers(data || []);
        } catch (error: any) {
            console.error('Error fetching team members:', error);
            Swal.fire('Error', 'Failed to load team members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        const confirmed = await showDeleteConfirm('this team member');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('team_members')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setMembers(members.filter(m => m.id !== id));
                Swal.fire('Deleted!', 'Team member has been deleted.', 'success');
            } catch (error: any) {
                console.error('Error deleting team member:', error);
                Swal.fire('Error', 'Failed to delete team member', 'error');
            }
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setFormData(member);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingMember(null);
        setFormData({
            status: 'Active',
            image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            visible: true,
            display_order: members.length + 1
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingMember) {
                // Update existing member
                const { data, error } = await supabase
                    .from('team_members')
                    .update({
                        name: formData.name,
                        role: formData.role,
                        bio: formData.bio,
                        image: formData.image,
                        status: formData.status,
                        linkedin: formData.linkedin,
                        twitter: formData.twitter,
                        github: formData.github,
                        email: formData.email,
                        visible: formData.visible ?? true
                    })
                    .eq('id', editingMember.id)
                    .select()
                    .single();

                if (error) throw error;

                setMembers(members.map(m => m.id === editingMember.id ? data : m));
                Swal.fire('Success!', 'Team member updated successfully', 'success');
            } else {
                // Create new member
                const { data, error } = await supabase
                    .from('team_members')
                    .insert([{
                        name: formData.name,
                        role: formData.role,
                        bio: formData.bio,
                        image: formData.image,
                        status: formData.status || 'Active',
                        linkedin: formData.linkedin,
                        twitter: formData.twitter,
                        github: formData.github,
                        email: formData.email,
                        display_order: formData.display_order || members.length + 1,
                        visible: formData.visible ?? true
                    }])
                    .select()
                    .single();

                if (error) throw error;

                setMembers([...members, data]);
                Swal.fire('Success!', 'Team member added successfully', 'success');
            }

            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving team member:', error);
            Swal.fire('Error', error.message || 'Failed to save team member', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="text-blue-600" size={32} />
                        Team Members
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage your team profiles and roles.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                    <Plus size={20} /> Add Member
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or role..."
                    className="w-full md:w-96 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            )}

            {/* Empty State */}
            {!loading && members.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
                    <p className="text-gray-500 mb-6">Add your first team member to get started</p>
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center space-x-2 bg-[#01478c] text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        <span>Add Team Member</span>
                    </button>
                </div>
            )}

            {/* Grid */}
            {!loading && filteredMembers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map(member => (
                        <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                            <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                                <div className="absolute top-4 right-4 text-white/80">
                                    <div className="relative group/menu">
                                        <button className="hover:text-white transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 pb-6 -mt-12">
                                <div className="relative inline-block">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${member.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'
                                        }`} />
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                                    <p className="text-blue-600 font-medium text-sm">{member.role}</p>
                                    <p className="text-gray-500 text-sm mt-3 line-clamp-2">{member.bio}</p>
                                </div>

                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                                    {member.linkedin && <Linkedin size={16} className="text-gray-400 hover:text-[#0077b5] cursor-pointer transition-colors" />}
                                    {member.twitter && <Twitter size={16} className="text-gray-400 hover:text-[#1da1f2] cursor-pointer transition-colors" />}
                                    {member.github && <Github size={16} className="text-gray-400 hover:text-gray-900 cursor-pointer transition-colors" />}
                                    {member.email && <Mail size={16} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />}

                                    <div className="ml-auto flex gap-2">
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingMember ? 'Edit Member' : 'Add Team Member'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                            <form id="team-form" onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            value={formData.role || ''}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                            value={formData.status || 'Active'}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="On Leave">On Leave</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        rows={3}
                                        value={formData.bio || ''}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        value={formData.image || ''}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </div>

                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Social Links</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Linkedin size={18} className="text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="LinkedIn Profile URL"
                                                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                value={formData.linkedin || ''}
                                                onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Twitter size={18} className="text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Twitter Profile URL"
                                                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                value={formData.twitter || ''}
                                                onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail size={18} className="text-gray-400" />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                value={formData.email || ''}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Github size={18} className="text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="GitHub Profile URL"
                                                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                value={formData.github || ''}
                                                onChange={e => setFormData({ ...formData, github: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 shrink-0 flex gap-4 bg-white">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 text-gray-700 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="team-form"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                {editingMember ? 'Save Changes' : 'Add Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
