import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Calendar, Link as LinkIcon, Edit, Camera, Activity, Award, Briefcase, Loader2, Save, X, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types/auth';
import { showToast } from '../../lib/sweetalert';

const activityData = [
    { name: 'Mon', tasks: 4 },
    { name: 'Tue', tasks: 3 },
    { name: 'Wed', tasks: 7 },
    { name: 'Thu', tasks: 5 },
    { name: 'Fri', tasks: 6 },
    { name: 'Sat', tasks: 2 },
    { name: 'Sun', tasks: 1 },
];

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Profile>>({});

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user!.id)
                .single();

            if (error) throw error;
            setProfile(data);
            setFormData(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // Remove fields that shouldn't be updated directly or are read-only
            const { role, email, id, created_at, updated_at, ...updates } = formData as any;

            const { error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;

            await fetchProfile(); // Refresh data
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setSaving(true);
        try {
            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update Profile with new Avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user!.id);

            if (updateError) throw updateError;

            await fetchProfile();
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showToast.error('Failed to upload avatar. Make sure "avatars" bucket exists.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-blue-600" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header Banner & Profile Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    {/* Placeholder for Cover Photo Edit */}
                    <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors text-xs font-medium flex items-center space-x-2">
                        <Camera size={16} />
                        <span>Edit Cover</span>
                    </button>
                </div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-start">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 space-y-4 md:space-y-0 md:space-x-6">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-xl bg-white p-1 shadow-lg overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt="Profile"
                                            className="w-full h-full rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                            <User size={48} /> {/* User icon import needed if used, using Fallback generic */}
                                            <span className="text-3xl font-bold text-gray-300">{profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={saving}
                                    className="absolute bottom-2 right-2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                                </button>
                            </div>
                            <div className="pb-2">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={formData.full_name || ''}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="block w-full px-3 py-1 text-xl font-bold border rounded-md"
                                            placeholder="Full Name"
                                        />
                                        <input
                                            type="text"
                                            value={formData.job_title || ''}
                                            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                            className="block w-full px-3 py-1 text-sm border rounded-md"
                                            placeholder="Job Title"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'No Name Set'}</h1>
                                        <p className="text-gray-500 font-medium">{profile?.job_title || profile?.role || 'No Title'}</p>
                                    </>
                                )}

                                <div className="flex items-center flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <MapPin size={14} />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.location || ''}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="px-2 py-0.5 border rounded text-xs w-32"
                                                placeholder="Location"
                                            />
                                        ) : (
                                            <span>{profile?.location || 'Location not set'}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Briefcase size={14} />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.company || ''}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                className="px-2 py-0.5 border rounded text-xs w-32"
                                                placeholder="Company"
                                            />
                                        ) : (
                                            <span>{profile?.company || 'Company not set'}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${profile?.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' :
                                            profile?.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {profile?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block mt-4">
                            {isEditing ? (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        <X size={16} />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <Edit size={16} />
                                    <span>Edit Profile</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Info & Skills */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Mail size={16} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-gray-500 text-xs">Email Address</p>
                                    <p className="font-medium text-gray-900 truncate" title={user?.email}>{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Phone size={16} />
                                </div>
                                <div className="w-full">
                                    <p className="text-gray-500 text-xs">Phone Number</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full border rounded px-2 py-1 mt-1"
                                            placeholder="+1 (555) ..."
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{profile?.phone || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Joined Date</p>
                                    <p className="font-medium text-gray-900">
                                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Skills</h3>
                        {isEditing ? (
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {(formData.skills || []).map((skill, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, skills: (formData.skills || []).filter((_, i) => i !== index) })}
                                                className="text-blue-500 hover:text-red-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Type a skill and press Enter"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.target as HTMLInputElement;
                                            const newSkill = input.value.trim();
                                            if (newSkill && !(formData.skills || []).includes(newSkill)) {
                                                setFormData({ ...formData, skills: [...(formData.skills || []), newSkill] });
                                                input.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {(profile?.skills && profile.skills.length > 0) ? profile.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                        {skill}
                                    </span>
                                )) : (
                                    <span className="text-gray-400 text-sm">No skills added yet.</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: About, Stats, Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">About Me</h3>
                        {isEditing ? (
                            <textarea
                                value={formData.bio || ''}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full border rounded-md p-2 text-sm"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                                {profile?.bio || 'No bio provided yet.'}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">124</p>
                                <p className="text-xs text-gray-500">Projects Done</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">86%</p>
                                <p className="text-xs text-gray-500">Success Rate</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">12</p>
                                <p className="text-xs text-gray-500">Awards Won</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Weekly Activity</h3>
                            <button className="text-sm text-blue-600 hover:underline">View Report</button>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ stroke: '#4F46E5', strokeWidth: 1 }}
                                    />
                                    <Area type="monotone" dataKey="tasks" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
