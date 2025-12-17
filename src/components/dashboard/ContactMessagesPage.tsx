import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Mail,
    Eye,
    Check,
    Archive,
    Trash2,
    X,
    MessageSquare,
    Phone,
    Globe,
    FileText,
    Clock,
    Loader2,
    User,
    Calendar,
    ExternalLink,
    Plus,
    Edit,
    Copy,
    FormInput,
    Save,
    UserCheck
} from 'lucide-react';
import { showDeleteConfirm } from '../../lib/sweetalert';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface FormSubmission {
    id: string;
    form_type: 'contact' | 'quote' | 'seo_audit' | 'newsletter';
    status: 'new' | 'read' | 'replied' | 'archived';
    name: string | null;
    email: string;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
    subject: string | null;
    message: string | null;
    service: string | null;
    guaranteed_results: boolean | null;
    premium_support: boolean | null;
    website_url: string | null;
    industry: string | null;
    metadata: any;
    admin_notes: string | null;
    replied_at: string | null;
    replied_by: string | null;
    user_agent: string | null;
    ip_address: string | null;
    referrer: string | null;
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_submissions: number;
    new_submissions: number;
    read_submissions: number;
    replied_submissions: number;
    archived_submissions: number;
    contact_forms: number;
    quote_forms: number;
    seo_audit_forms: number;
    newsletter_forms: number;
}

interface CustomForm {
    id: string;
    name: string;
    description: string | null;
    shortcode: string;
    fields: FormField[];
    submit_button_text: string;
    success_message: string;
    is_active: boolean;
    recipients: string[]; // Array of role names like "Admin", "Super Admin"
    submission_count: number;
    created_at: string;
}

interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'url';
    required: boolean;
    placeholder?: string;
    options?: string[];
    rows?: number;
}

export default function ContactMessagesPage() {
    const [activeTab, setActiveTab] = useState<'submissions' | 'forms'>('submissions');
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [customForms, setCustomForms] = useState<CustomForm[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formTypeFilter, setFormTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingSubmission, setViewingSubmission] = useState<FormSubmission | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

    // Form Builder State
    const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
    const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [formRecipients, setFormRecipients] = useState<string[]>([]);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    useEffect(() => {
        fetchSubmissions();
        fetchStats();
        fetchCustomForms();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('form_submissions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubmissions(data || []);
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase.rpc('get_submission_stats');
            if (error) throw error;
            if (data && data.length > 0) {
                setStats(data[0]);
            }
        } catch (error: any) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchCustomForms = async () => {
        try {
            const { data, error } = await supabase
                .from('custom_forms')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomForms(data || []);
        } catch (error: any) {
            console.error('Error fetching forms:', error);
        }
    };

    const copyShortcode = (shortcode: string) => {
        const fullShortcode = `[form id="${shortcode}"]`;
        navigator.clipboard.writeText(fullShortcode);
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Shortcode copied to clipboard',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handleDeleteForm = async (id: string) => {
        const confirmed = await showDeleteConfirm('this form');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('custom_forms')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                Swal.fire('Deleted!', 'Form deleted successfully.', 'success');
                fetchCustomForms();
            } catch (error: any) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const openFormBuilder = (form?: CustomForm) => {
        if (form) {
            setEditingForm(form);
            setFormName(form.name);
            setFormDescription(form.description || '');
            setFormFields(form.fields);
            setFormRecipients(form.recipients || []);
        } else {
            setEditingForm(null);
            setFormName('');
            setFormDescription('');
            setFormFields([]);
            setFormRecipients(['Admin', 'Super Admin']); // Default recipients
        }
        setIsFormBuilderOpen(true);
    };

    const closeFormBuilder = () => {
        setIsFormBuilderOpen(false);
        setEditingForm(null);
        setFormName('');
        setFormDescription('');
        setFormFields([]);
        setFormRecipients([]);
    };

    const addField = () => {
        setFormFields([...formFields, {
            name: `field_${formFields.length + 1}`,
            label: 'New Field',
            type: 'text',
            required: false,
            placeholder: ''
        }]);
    };

    const updateField = (index: number, updates: Partial<FormField>) => {
        const updated = [...formFields];
        updated[index] = { ...updated[index], ...updates };
        setFormFields(updated);
    };

    const removeField = (index: number) => {
        setFormFields(formFields.filter((_, i) => i !== index));
    };

    const handleSaveForm = async () => {
        if (!formName.trim()) {
            Swal.fire('Error', 'Form name is required!', 'error');
            return;
        }

        if (formFields.length === 0) {
            Swal.fire('Error', 'Add at least one field!', 'error');
            return;
        }

        setIsSubmittingForm(true);

        try {
            if (editingForm) {
                // Update existing form
                const { error } = await supabase
                    .from('custom_forms')
                    .update({
                        name: formName,
                        description: formDescription,
                        fields: formFields,
                        recipients: formRecipients
                    })
                    .eq('id', editingForm.id);

                if (error) throw error;
                Swal.fire('Success!', 'Form updated successfully!', 'success');
            } else {
                // Create new form
                const { data: shortcodeData, error: shortcodeError } = await supabase.rpc('generate_form_shortcode');
                if (shortcodeError) throw shortcodeError;

                const { error } = await supabase
                    .from('custom_forms')
                    .insert([{
                        name: formName,
                        description: formDescription,
                        shortcode: shortcodeData,
                        fields: formFields,
                        recipients: formRecipients
                    }]);

                if (error) throw error;
                Swal.fire('Success!', 'Form created successfully!', 'success');
            }

            fetchCustomForms();
            closeFormBuilder();
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setIsSubmittingForm(false);
        }
    };

    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = (sub.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.message || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFormType = formTypeFilter === 'all' || sub.form_type === formTypeFilter;
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        return matchesSearch && matchesFormType && matchesStatus;
    });

    const handleViewSubmission = async (submission: FormSubmission) => {
        setViewingSubmission(submission);
        setAdminNotes(submission.admin_notes || '');
        setIsViewModalOpen(true);

        // Mark as read if it's new
        if (submission.status === 'new') {
            await updateStatus(submission.id, 'read');
        }
    };

    const updateStatus = async (id: string, status: FormSubmission['status']) => {
        try {
            const updateData: any = { status };

            if (status === 'replied') {
                const { data: { user } } = await supabase.auth.getUser();
                updateData.replied_at = new Date().toISOString();
                updateData.replied_by = user?.id;
            }

            const { error } = await supabase
                .from('form_submissions')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            fetchSubmissions();
            fetchStats();
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleSaveNotes = async () => {
        if (!viewingSubmission) return;

        try {
            const { error } = await supabase
                .from('form_submissions')
                .update({ admin_notes: adminNotes })
                .eq('id', viewingSubmission.id);

            if (error) throw error;

            Swal.fire('Success!', 'Notes saved successfully.', 'success');
            fetchSubmissions();
            setIsViewModalOpen(false);
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showDeleteConfirm('this submission');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('form_submissions')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                Swal.fire('Deleted!', 'Submission deleted successfully.', 'success');
                fetchSubmissions();
                fetchStats();
            } catch (error: any) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const getFormTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'contact': 'Contact Form',
            'quote': 'Quote Request',
            'seo_audit': 'SEO Audit',
            'newsletter': 'Newsletter'
        };
        return labels[type] || type;
    };

    const getFormTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'contact': 'bg-blue-50 text-blue-700 border-blue-100',
            'quote': 'bg-purple-50 text-purple-700 border-purple-100',
            'seo_audit': 'bg-green-50 text-green-700 border-green-100',
            'newsletter': 'bg-orange-50 text-orange-700 border-orange-100'
        };
        return colors[type] || 'bg-gray-50 text-gray-700 border-gray-100';
    };

    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            'new': 'bg-blue-100/80 text-blue-700 ring-1 ring-blue-600/20 shadow-sm',
            'read': 'bg-yellow-100/80 text-yellow-700 ring-1 ring-yellow-600/20 shadow-sm',
            'replied': 'bg-green-100/80 text-green-700 ring-1 ring-green-600/20 shadow-sm',
            'archived': 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20 shadow-sm'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100/50">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Contact Messages</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage all form submissions from your website</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 bg-white rounded-t-2xl px-4">
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={`pb-4 px-4 font-semibold transition-all flex items-center gap-2 ${activeTab === 'submissions'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <MessageSquare size={20} />
                    Submissions
                </button>
                <button
                    onClick={() => setActiveTab('forms')}
                    className={`pb-4 px-4 font-semibold transition-all flex items-center gap-2 ${activeTab === 'forms'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <FormInput size={20} />
                    Custom Forms
                </button>
            </div>

            {/* Submissions Tab Content */}
            {activeTab === 'submissions' && (
                <>
                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Messages', value: stats.total_submissions.toString(), icon: MessageSquare, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' },
                                { label: 'New Messages', value: stats.new_submissions.toString(), icon: Mail, color: 'text-purple-600', bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100' },
                                { label: 'Replied', value: stats.replied_submissions.toString(), icon: Check, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100' },
                                { label: 'Archived', value: stats.archived_submissions.toString(), icon: Archive, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100' },
                            ].map((stat, i) => (
                                <div key={i} className={`p-6 rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${stat.bg}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3.5 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 ${stat.color}`}>
                                            <stat.icon size={24} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                                    <h3 className="text-gray-500 text-sm font-semibold mt-1">{stat.label}</h3>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 md:border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                            <h2 className="text-xl font-bold text-gray-900">All Submissions</h2>

                            <div className="flex gap-3 w-full md:w-auto flex-wrap">
                                <div className="relative flex-1 md:w-64 group">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search messages..."
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm transition-all shadow-sm bg-white"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        value={formTypeFilter}
                                        onChange={(e) => setFormTypeFilter(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-all"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="contact">Contact</option>
                                        <option value="quote">Quote</option>
                                        <option value="seo_audit">SEO Audit</option>
                                        <option value="newsletter">Newsletter</option>
                                    </select>
                                    <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-all"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="new">New</option>
                                        <option value="read">Read</option>
                                        <option value="replied">Replied</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-8 py-5">From</th>
                                        <th className="px-6 py-5">Type</th>
                                        <th className="px-6 py-5">Subject/Service</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5">Date</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredSubmissions.map(submission => (
                                        <tr key={submission.id} className="hover:bg-gray-50/80 transition-all duration-200 group cursor-pointer" onClick={() => handleViewSubmission(submission)}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold shadow-inner">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{submission.name || `${submission.first_name || ''} ${submission.last_name || ''}`.trim() || 'Anonymous'}</p>
                                                        <p className="text-xs text-gray-500">{submission.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getFormTypeColor(submission.form_type)}`}>
                                                    {getFormTypeLabel(submission.form_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-gray-900 font-medium line-clamp-1">
                                                    {submission.subject || submission.service || submission.website_url || 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="relative inline-block">
                                                    <select
                                                        value={submission.status}
                                                        onChange={async (e) => {
                                                            e.stopPropagation();
                                                            await updateStatus(submission.id, e.target.value as any);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer border-0 outline-none ${getStatusStyle(submission.status)}`}
                                                    >
                                                        <option value="new">New</option>
                                                        <option value="read">Read</option>
                                                        <option value="replied">Replied</option>
                                                        <option value="archived">Archived</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-500">
                                                {formatDate(submission.created_at)}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewSubmission(submission);
                                                        }}
                                                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(submission.id);
                                                        }}
                                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden p-4 space-y-4 bg-gray-50/50">
                            {filteredSubmissions.map(submission => (
                                <div key={submission.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3" onClick={() => handleViewSubmission(submission)}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{submission.name || 'Anonymous'}</p>
                                                <p className="text-xs text-gray-500">{submission.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(submission.id); }} className="text-gray-300 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium border ${getFormTypeColor(submission.form_type)}`}>
                                            {getFormTypeLabel(submission.form_type)}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium capitalize ${getStatusStyle(submission.status)}`}>
                                            {submission.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        <Clock size={12} className="inline mr-1" />
                                        {formatDate(submission.created_at)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* View/Edit Modal */}
                    {isViewModalOpen && viewingSubmission && (
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10 rounded-t-3xl">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                                        <p className="text-sm text-gray-500">View and manage submission</p>
                                    </div>
                                    <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-6">
                                    {/* Header Info */}
                                    <div className="flex items-start justify-between pb-6 border-b border-gray-100">
                                        <div>
                                            <span className={`inline-block mb-3 text-xs font-semibold px-3 py-1 rounded-full border ${getFormTypeColor(viewingSubmission.form_type)}`}>
                                                {getFormTypeLabel(viewingSubmission.form_type)}
                                            </span>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                {viewingSubmission.name || `${viewingSubmission.first_name || ''} ${viewingSubmission.last_name || ''}`.trim() || 'Anonymous'}
                                            </h3>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p className="flex items-center gap-2"><Mail size={14} /> {viewingSubmission.email}</p>
                                                {viewingSubmission.phone && <p className="flex items-center gap-2"><Phone size={14} /> {viewingSubmission.phone}</p>}
                                                <p className="flex items-center gap-2"><Calendar size={14} /> {formatDate(viewingSubmission.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form-specific Details */}
                                    <div className="space-y-4">
                                        {viewingSubmission.form_type === 'contact' && (
                                            <>
                                                {viewingSubmission.subject && (
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-700">Subject</label>
                                                        <p className="mt-1 text-gray-900">{viewingSubmission.subject}</p>
                                                    </div>
                                                )}
                                                {viewingSubmission.message && (
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-700">Message</label>
                                                        <p className="mt-1 text-gray-900 whitespace-pre-wrap">{viewingSubmission.message}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {viewingSubmission.form_type === 'quote' && (
                                            <>
                                                {viewingSubmission.service && (
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-700">Service</label>
                                                        <p className="mt-1 text-gray-900">{viewingSubmission.service}</p>
                                                    </div>
                                                )}
                                                <div className="flex gap-4">
                                                    {viewingSubmission.guaranteed_results && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✓ Guaranteed Results</span>
                                                    )}
                                                    {viewingSubmission.premium_support && (
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">✓ Premium Support</span>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {viewingSubmission.form_type === 'seo_audit' && (
                                            <>
                                                {viewingSubmission.website_url && (
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-700">Website URL</label>
                                                        <p className="mt-1 text-gray-900 flex items-center gap-2">
                                                            <Globe size={14} />
                                                            <a href={viewingSubmission.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                                {viewingSubmission.website_url}
                                                                <ExternalLink size={12} className="inline ml-1" />
                                                            </a>
                                                        </p>
                                                    </div>
                                                )}
                                                {viewingSubmission.industry && (
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-700">Industry</label>
                                                        <p className="mt-1 text-gray-900">{viewingSubmission.industry}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Admin Notes */}
                                    <div className="pt-6 border-t border-gray-100">
                                        <label className="text-sm font-semibold text-gray-700">Admin Notes</label>
                                        <textarea
                                            rows={4}
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                                            placeholder="Add internal notes about this submission..."
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                                        <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold transition-colors">
                                            Close
                                        </button>
                                        <button onClick={handleSaveNotes} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-lg shadow-blue-500/30 font-bold transition-all transform active:scale-95">
                                            Save Notes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Custom Forms Tab Content */}
            {activeTab === 'forms' && (
                <div className="space-y-6">
                    {/* Create Form Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => openFormBuilder()}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:brightness-110 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            <Plus size={20} />
                            Create New Form
                        </button>
                    </div>

                    {/* Forms Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customForms.map((form) => (
                            <div key={form.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{form.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{form.description || 'No description'}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {form.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FormInput size={16} className="mr-2" />
                                        {form.fields.length} fields
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail size={16} className="mr-2" />
                                        {form.submission_count} submissions
                                    </div>
                                </div>

                                {/* Shortcode */}
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <code className="text-xs text-gray-700 font-mono">[form id="{form.shortcode}"]</code>
                                        <button
                                            onClick={() => copyShortcode(form.shortcode)}
                                            className="text-blue-600 hover:text-blue-700"
                                            title="Copy Shortcode"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openFormBuilder(form)}
                                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteForm(form.id)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {customForms.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                            <FormInput size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Custom Forms Yet</h3>
                            <p className="text-gray-500 mb-6">Custom forms will appear here once the database migration is applied</p>
                        </div>
                    )}
                </div>
            )}

            {/* Form Builder Modal */}
            {isFormBuilderOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10 rounded-t-3xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingForm ? 'Edit Form' : 'Create New Form'}
                                </h2>
                                <p className="text-sm text-gray-500">Build your custom form</p>
                            </div>
                            <button onClick={closeFormBuilder} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Form Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Form Name *</label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g., Contact Form, Newsletter Signup"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Description</label>
                                    <textarea
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        rows={2}
                                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                                        placeholder="Optional description of what this form is for"
                                    />
                                </div>

                                {/* Recipients Section */}
                                <div className="border-t border-gray-100 pt-4">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                        <UserCheck size={18} />
                                        Notification Recipients
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Admin', 'Super Admin', 'Moderator', 'Editor'].map((role) => (
                                            <label key={role} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={formRecipients.includes(role)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormRecipients([...formRecipients, role]);
                                                        } else {
                                                            setFormRecipients(formRecipients.filter(r => r !== role));
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{role}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Select user roles who should be notified when this form is submitted</p>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Form Fields</h3>
                                    <button
                                        onClick={addField}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                                    >
                                        <Plus size={16} />
                                        Add Field
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formFields.map((field, index) => (
                                        <div key={index} className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-900">Field {index + 1}</h4>
                                                <button
                                                    onClick={() => removeField(index)}
                                                    className="text-red-500 hover:text-red-600"
                                                    title="Remove Field"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-medium text-gray-600">Field Name</label>
                                                    <input
                                                        type="text"
                                                        value={field.name}
                                                        onChange={(e) => updateField(index, { name: e.target.value })}
                                                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                                        placeholder="e.g., email, phone"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-600">Label</label>
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => updateField(index, { label: e.target.value })}
                                                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                                        placeholder="e.g., Email Address"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-600">Type</label>
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => updateField(index, { type: e.target.value as any })}
                                                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white"
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="email">Email</option>
                                                        <option value="tel">Phone</option>
                                                        <option value="number">Number</option>
                                                        <option value="url">URL</option>
                                                        <option value="textarea">Textarea</option>
                                                        <option value="select">Select</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-600">Placeholder</label>
                                                    <input
                                                        type="text"
                                                        value={field.placeholder || ''}
                                                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                                        placeholder="Optional placeholder text"
                                                    />
                                                </div>
                                            </div>
                                            {/* Options for Select Type */}
                                            {field.type === 'select' && (
                                                <div>
                                                    <label className="text-xs font-medium text-gray-600">Options (comma-separated)</label>
                                                    <input
                                                        type="text"
                                                        value={field.options?.join(', ') || ''}
                                                        onChange={(e) => updateField(index, {
                                                            options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                                                        })}
                                                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                                        placeholder="e.g., Option 1, Option 2, Option 3"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Separate each option with a comma</p>
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(index, { required: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    Required Field
                                                </label>
                                            </div>
                                        </div>
                                    ))}

                                    {formFields.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            <FormInput size={48} className="mx-auto mb-2" />
                                            <p>No fields yet. Click "Add Field" to get started.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                                <button
                                    onClick={closeFormBuilder}
                                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveForm}
                                    disabled={isSubmittingForm}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-lg shadow-blue-500/30 font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Save size={20} />
                                    {isSubmittingForm ? 'Saving...' : (editingForm ? 'Update Form' : 'Create Form')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
