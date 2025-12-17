import { useState, useRef } from 'react';
import { Upload, Download, User, Briefcase, Hash, Calendar, MapPin, GraduationCap, Ticket, Music, Layout, Image as ImageIcon, Palette, Globe } from 'lucide-react';
import html2canvas from 'html2canvas';

type TemplateType = 'office' | 'school' | 'concert' | 'event' | 'coaching';
type OrientationType = 'portrait' | 'landscape';
type DesignTheme = 'modern' | 'classic' | 'creative';

interface FieldConfig {
    key: string;
    label: string;
    icon: any;
    placeholder: string;
}

const TEMPLATES: Record<TemplateType, { name: string; icon: any; fields: FieldConfig[]; color: string }> = {
    office: {
        name: 'Office Employee',
        icon: Briefcase,
        color: '#01478c',
        fields: [
            { key: 'name', label: 'Full Name', icon: User, placeholder: 'John Doe' },
            { key: 'role', label: 'Job Title', icon: Briefcase, placeholder: 'Manager' },
            { key: 'id', label: 'Employee ID', icon: Hash, placeholder: 'EMP-001' },
            { key: 'dept', label: 'Department', icon: MapPin, placeholder: 'Marketing' }
        ]
    },
    school: {
        name: 'School / Student',
        icon: GraduationCap,
        color: '#10b981', // Emerald
        fields: [
            { key: 'name', label: 'Student Name', icon: User, placeholder: 'Jane Smith' },
            { key: 'class', label: 'Class / Grade', icon: Hash, placeholder: '10th - A' },
            { key: 'roll', label: 'Roll Number', icon: Hash, placeholder: '25' },
            { key: 'school', label: 'School Name', icon: MapPin, placeholder: 'St. Xavier High' }
        ]
    },
    concert: {
        name: 'Concert Pass',
        icon: Music,
        color: '#8b5cf6', // Violet
        fields: [
            { key: 'name', label: 'Attendee Name', icon: User, placeholder: 'Alex Rock' },
            { key: 'event', label: 'Event Name', icon: Music, placeholder: 'Rock Fest 2024' },
            { key: 'date', label: 'Date', icon: Calendar, placeholder: '15 Aug 2025' },
            { key: 'ticket', label: 'Ticket Type', icon: Ticket, placeholder: 'VIP Access' }
        ]
    },
    event: {
        name: 'Event / Conf',
        icon: Ticket,
        color: '#f43f5e', // Rose
        fields: [
            { key: 'name', label: 'Guest Name', icon: User, placeholder: 'Sarah Connor' },
            { key: 'org', label: 'Organization', icon: Briefcase, placeholder: 'Tech Corp' },
            { key: 'type', label: 'Pass Type', icon: Ticket, placeholder: 'Speaker' },
            { key: 'date', label: 'Valid Until', icon: Calendar, placeholder: '20 Dec 2024' }
        ]
    },
    coaching: {
        name: 'Coaching Inst',
        icon: GraduationCap,
        color: '#f59e0b', // Amber
        fields: [
            { key: 'name', label: 'Student Name', icon: User, placeholder: 'Mike Ross' },
            { key: 'course', label: 'Course Name', icon: GraduationCap, placeholder: 'JEE Advanced' },
            { key: 'batch', label: 'Batch Code', icon: Hash, placeholder: 'B-24' },
            { key: 'id', label: 'Student ID', icon: Hash, placeholder: 'ST-550' }
        ]
    }
};

const THEMES: Record<DesignTheme, { name: string; class: string }> = {
    modern: { name: 'Modern', class: 'font-sans' },
    classic: { name: 'Classic', class: 'font-serif border-4 border-double' },
    creative: { name: 'Creative', class: 'font-mono' } // Using Tailwind font classes logic in render
};

export default function IdCardGenerator() {
    const [template, setTemplate] = useState<TemplateType>('office');
    const [orientation, setOrientation] = useState<OrientationType>('portrait');
    const [theme, setTheme] = useState<DesignTheme>('modern');
    const [orgName, setOrgName] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [details, setDetails] = useState<Record<string, string>>({});
    const cardRef = useRef<HTMLDivElement>(null);

    const activeTemplate = TEMPLATES[template];

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 3, // High Res
                useCORS: true,
                backgroundColor: null
            } as any);

            const link = document.createElement('a');
            link.download = `ID-Card-${template}-${(details['name'] || 'user').replace(/\s+/g, '-')}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
        } catch (error) {
            console.error('Download failed', error);
            alert('Error generating ID card.');
        }
    };

    // Dimensions
    const getCardStyle = () => {
        const base = orientation === 'portrait' ? { width: '350px', height: '550px' } : { width: '550px', height: '350px' };
        return { ...base, borderColor: activeTemplate.color };
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 lg:pt-24 pb-12">
            <div className="w-full max-w-[1920px] mx-auto px-400 sm:px-6 lg:px-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Pro ID Card Generator</h1>
                    <p className="text-gray-600">Create professional ID cards. Customize theme, layout, and details.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* LEFT COLUMN: Controls */}
                    <div className="lg:col-span-5 xl:col-span-4 bg-white p-5 lg:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 lg:space-y-8 h-fit overflow-y-auto max-h-[800px]">

                        {/* 1. Template Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">1. Select Category</label>
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                                {(Object.keys(TEMPLATES) as TemplateType[]).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTemplate(t)}
                                        className={`flex flex-col lg:flex-row items-center p-3 rounded-xl text-sm font-medium transition-all text-center lg:text-left ${template === t
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <span className={`mb-2 lg:mb-0 lg:mr-3 opacity-70 flex-shrink-0`}>
                                            {(() => { const Icon = TEMPLATES[t].icon; return <Icon size={20} />; })()}
                                        </span>
                                        <span>{TEMPLATES[t].name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Visual Settings */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">2. Visual Style</label>

                            {/* Orientation */}
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                                <button
                                    onClick={() => setOrientation('portrait')}
                                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${orientation === 'portrait' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                                >
                                    <Layout size={16} className="mr-2" /> Portrait
                                </button>
                                <button
                                    onClick={() => setOrientation('landscape')}
                                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${orientation === 'landscape' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                                >
                                    <ImageIcon size={16} className="mr-2 rotate-90" /> Landscape
                                </button>
                            </div>

                            {/* Theme */}
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(THEMES) as DesignTheme[]).map((thm) => (
                                    <button
                                        key={thm}
                                        onClick={() => setTheme(thm)}
                                        className={`py-2 px-1 rounded-lg text-xs font-bold uppercase transition-all border-2 ${theme === thm ? 'border-gray-900 text-gray-900 bg-gray-50' : 'border-transparent text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        {THEMES[thm].name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Details Form */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">3. Enter Details</label>
                            <div className="space-y-4">
                                {/* Organization Name */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Organization / School Header</label>
                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Harvard University"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Photo Upload */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                        {photo ? <img src={photo} className="w-full h-full object-cover" /> : <User className="w-full h-full p-6 text-gray-400" />}
                                    </div>
                                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex-1 text-center transition-colors">
                                        <Upload size={16} className="inline mr-2" /> Upload Photo
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    </label>
                                </div>

                                {activeTemplate.fields.map((field) => (
                                    <div key={field.key}>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">{field.label}</label>
                                        <div className="relative">
                                            <field.icon size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder={field.placeholder}
                                                value={details[field.key] || ''}
                                                onChange={(e) => setDetails({ ...details, [field.key]: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleDownload} className="w-full bg-[#ff6b35] text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-[#e55a2b] transition-all shadow-lg hover:shadow-orange-500/25 active:scale-95">
                            <Download className="mr-2" /> Download JPG
                        </button>

                    </div>

                    {/* RIGHT COLUMN: Preview */}
                    <div className="lg:col-span-7 xl:col-span-8 sticky top-24">
                        <div className="bg-gray-200/50 rounded-3xl p-4 sm:p-8 flex items-center justify-center min-h-[500px] lg:min-h-[600px] border-2 border-dashed border-gray-300 relative overflow-hidden">
                            <div className="absolute inset-0 pattern-grid-gray-300 pattern-bg-transparent pattern-size-4 pattern-opacity-10 pointer-events-none"></div>

                            {/* THE CARD */}
                            <div
                                ref={cardRef}
                                className={`bg-white shadow-2xl overflow-hidden relative transition-all duration-500 flex flex-col transform scale-90 sm:scale-100 ${THEMES[theme].class} ${orientation === 'landscape' ? 'flex-row' : ''}`}
                                style={{
                                    ...getCardStyle(),
                                    borderLeft: theme === 'modern' ? `8px solid ${activeTemplate.color}` : (theme === 'classic' ? `2px solid #000` : 'none'),
                                    borderRadius: theme === 'classic' ? '0px' : '20px'
                                }}
                            >
                                {/* THEME: CREATIVE BACKGROUNDS */}
                                {theme === 'creative' && (
                                    <div className="absolute inset-0 z-0">
                                        <div className="absolute top-0 right-0 w-full h-full opacity-10" style={{ background: `radial-gradient(circle at 100% 0%, ${activeTemplate.color}, transparent 60%)` }}></div>
                                        <div className="absolute bottom-0 left-0 w-2/3 h-full opacity-10" style={{ background: `linear-gradient(45deg, ${activeTemplate.color}, transparent)` }}></div>
                                    </div>
                                )}

                                {/* THEME: MODERN BACKGROUNDS */}
                                {theme === 'modern' && (
                                    <>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-[100%] opacity-50 z-0"></div>
                                        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 rounded-tl-full z-0" style={{ backgroundColor: activeTemplate.color }}></div>
                                    </>
                                )}


                                {/* ============== PORTRAIT ============= */}
                                {orientation === 'portrait' && (
                                    <>
                                        {/* Header Section */}
                                        <div className={`relative z-10 flex flex-col items-center justify-center pt-8 pb-4 transition-colors duration-300`}
                                            style={{
                                                backgroundColor: theme === 'classic' ? '#f8f9fa' : (theme === 'modern' ? `${activeTemplate.color}15` : 'transparent'),
                                                borderBottom: theme === 'classic' ? '2px solid #eee' : 'none'
                                            }}>

                                            {/* Org Header */}
                                            <div className={`text-center px-6 mb-4 w-full`}>
                                                <h3 className={`font-bold uppercase tracking-wider ${theme === 'modern' ? 'text-sm' : 'text-lg text-serif'} text-gray-800 break-words`}>
                                                    {orgName || 'Organization Name'}
                                                </h3>
                                            </div>

                                            <div className={`w-32 h-32 ${theme === 'modern' ? 'rounded-full' : 'rounded-lg'} border-4 border-white shadow-md overflow-hidden bg-gray-200 relative`}>
                                                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <User className="w-full h-full p-6 text-gray-400" />}
                                            </div>
                                        </div>

                                        {/* Body Section */}
                                        <div className="flex-1 p-6 text-center relative z-10">
                                            <h2 className={`text-2xl font-bold text-gray-900 mb-1 ${theme === 'classic' ? 'font-serif' : ''}`}>{details['name'] || 'Name Here'}</h2>

                                            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider mb-8 ${theme === 'modern' ? 'rounded-full' : ''}`}
                                                style={{
                                                    backgroundColor: theme === 'modern' ? `${activeTemplate.color}20` : 'transparent',
                                                    color: activeTemplate.color,
                                                    border: theme === 'classic' ? `1px solid ${activeTemplate.color}` : 'none'
                                                }}>
                                                {template} ID
                                            </span>

                                            <div className={`grid gap-3 text-left w-full`}>
                                                {activeTemplate.fields.slice(1).map((f) => (
                                                    <div key={f.key} className={`flex items-center pb-2 ${theme === 'modern' ? 'border-b border-gray-100' : ''}`}>
                                                        <div className="w-8 flex justify-center text-gray-400">
                                                            <f.icon size={14} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none mb-0.5">{f.label}</span>
                                                            <span className={`text-sm font-semibold text-gray-800 ${theme === 'creative' ? 'text-lg' : ''} break-all`}>{details[f.key] || '---'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="h-10 flex items-center justify-center text-white text-[10px] font-bold tracking-widest uppercase relative z-10" style={{ backgroundColor: activeTemplate.color }}>
                                            {new Date().getFullYear()} • ID CARD
                                        </div>
                                    </>
                                )}


                                {/* ============== LANDSCAPE ============= */}
                                {orientation === 'landscape' && (
                                    <>
                                        {/* Sidebar (Photo) */}
                                        <div className={`w-48 relative z-10 flex flex-col items-center justify-center p-4 border-r border-gray-100`}
                                            style={{ backgroundColor: theme === 'classic' ? '#f8f9fa' : `${activeTemplate.color}05` }}>

                                            <div className={`w-28 h-28 ${theme === 'modern' ? 'rounded-full' : 'rounded-lg'} border-4 border-white shadow-md overflow-hidden bg-gray-200 mb-4`}>
                                                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <User className="w-full h-full p-6 text-gray-400" />}
                                            </div>
                                            <div className="text-center w-full">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">ID Status</div>
                                                <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${theme === 'modern' ? 'rounded-full' : ''}`}
                                                    style={{
                                                        backgroundColor: activeTemplate.color,
                                                        color: 'white'
                                                    }}>
                                                    {template}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 p-6 relative z-10 flex flex-col">
                                            {/* Org Header Landscape */}
                                            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                                                <div>
                                                    <h3 className={`font-bold uppercase tracking-wider ${theme === 'modern' ? 'text-sm' : 'text-lg font-serif'} text-gray-800 break-words`}>
                                                        {orgName || 'Organization Name'}
                                                    </h3>
                                                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">Official Identity Card</div>
                                                </div>
                                                <Palette size={20} style={{ color: activeTemplate.color, opacity: 0.5 }} />
                                            </div>

                                            <h2 className={`text-2xl font-bold text-gray-900 mb-1 ${theme === 'classic' ? 'font-serif' : ''}`}>{details['name'] || 'Name Here'}</h2>

                                            <div className="mt-auto grid grid-cols-2 gap-4">
                                                {activeTemplate.fields.slice(1).map((f) => (
                                                    <div key={f.key}>
                                                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">{f.label}</span>
                                                        <span className="block text-sm font-semibold text-gray-800 break-all">{details[f.key] || '---'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
