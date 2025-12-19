import { useState, useRef, useEffect } from 'react';
import { Upload, Download, User, Briefcase, Hash, Calendar, MapPin, GraduationCap, Ticket, Layout, Image as ImageIcon, Palette, Globe, QrCode } from 'lucide-react';
import html2canvas from 'html2canvas';

type CategoryType = 'school_student' | 'hospital_staff' | 'office_corporate' | 'event_pass';
type OrientationType = 'portrait' | 'landscape';
type DesignTemplate = 'modern_minimalist' | 'classic_professional' | 'colorful_vibrant';
type ExportFormat = 'JPG' | 'PNG' | 'PDF';
type BackgroundPattern = 'solid' | 'gradient' | 'dots' | 'waves' | 'grid';

const BACKGROUND_COLORS = {
    solid: [{ name: 'White', hex: '#ffffff' }, { name: 'Light Gray', hex: '#f3f4f6' }, { name: 'Off White', hex: '#fafbfc' }, { name: 'Cream', hex: '#fffbf0' }, { name: 'Light Blue', hex: '#eff6ff' }, { name: 'Light Green', hex: '#f0fdf4' }],
    gradient: [{ name: 'Blue Purple', hex: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }, { name: 'Orange Pink', hex: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }, { name: 'Green Teal', hex: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }, { name: 'Red Orange', hex: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }, { name: 'Blue Green', hex: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)' }]
};

interface FieldConfig {
    id: string;
    label: string;
    type: 'text' | 'number' | 'image' | 'textarea' | 'select';
    options?: string[];
    placeholder?: string;
}

interface CategoryConfig {
    name: string;
    icon: any;
    fields: FieldConfig[];
    qr_data: string[];
    color: string;
}

const CATEGORIES: Record<CategoryType, CategoryConfig> = {
    school_student: {
        name: 'School Student',
        icon: GraduationCap,
        color: '#10b981',
        qr_data: ['student_name', 'roll_no', 'class_grade'],
        fields: [
            { id: 'school_name', label: 'School Name', type: 'text', placeholder: 'St. Xavier High School' },
            { id: 'student_name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith' },
            { id: 'student_photo', label: 'Upload Photo', type: 'image' },
            { id: 'roll_no', label: 'Roll Number', type: 'number', placeholder: '025' },
            { id: 'class_grade', label: 'Class/Grade', type: 'text', placeholder: '10th - A' },
            { id: 'principal_sign', label: 'Principal Signature', type: 'image' },
            { id: 'school_address', label: 'School Address', type: 'textarea', placeholder: 'Enter address' },
            { id: 'home_address', label: 'Student Address', type: 'textarea', placeholder: 'Enter home address' }
        ]
    },
    hospital_staff: {
        name: 'Hospital Staff',
        icon: Briefcase,
        color: '#0284c7',
        qr_data: ['staff_name', 'batch_id', 'department'],
        fields: [
            { id: 'hospital_name', label: 'Hospital Name', type: 'text', placeholder: 'City General Hospital' },
            { id: 'hospital_logo', label: 'Hospital Logo', type: 'image' },
            { id: 'staff_photo', label: 'Staff Photo', type: 'image' },
            { id: 'staff_name', label: 'Full Name', type: 'text', placeholder: 'Dr. John Doe' },
            { id: 'job_title', label: 'Job Title/Role', type: 'select', options: ['Doctor', 'Nurse', 'Surgeon', 'Receptionist', 'Lab Technician', 'Pharmacist', 'Staff', 'Intern'] },
            { id: 'department', label: 'Department', type: 'text', placeholder: 'Cardiology' },
            { id: 'batch_id', label: 'ID Number', type: 'text', placeholder: 'HOS-001' },
            { id: 'joined_date', label: 'Joined Date', type: 'text', placeholder: '01/01/2024' },
            { id: 'expiry_date', label: 'Expiry Date', type: 'text', placeholder: '12/31/2025' }
        ]
    },
    office_corporate: {
        name: 'Office Corporate',
        icon: Briefcase,
        color: '#01478c',
        qr_data: ['emp_name', 'emp_id'],
        fields: [
            { id: 'company_name', label: 'Company Name', type: 'text', placeholder: 'Tech Corp Inc' },
            { id: 'emp_photo', label: 'Employee Photo', type: 'image' },
            { id: 'emp_name', label: 'Employee Name', type: 'text', placeholder: 'John Doe' },
            { id: 'designation', label: 'Position/Designation', type: 'text', placeholder: 'Software Engineer' },
            { id: 'emp_id', label: 'Employee ID', type: 'text', placeholder: 'EMP-001' },
            { id: 'department', label: 'Department', type: 'text', placeholder: 'Engineering' },
            { id: 'blood_group', label: 'Blood Group', type: 'select', options: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] }
        ]
    },
    event_pass: {
        name: 'Event Pass',
        icon: Ticket,
        color: '#6366f1',
        qr_data: ['event_name', 'pass_type', 'ticket_no'],
        fields: [
            { id: 'event_name', label: 'Event Name', type: 'text', placeholder: 'Tech Conference 2024' },
            { id: 'organizer', label: 'Organizer', type: 'text', placeholder: 'Tech Events LLC' },
            { id: 'attendee_name', label: 'Attendee Name', type: 'text', placeholder: 'John Doe' },
            { id: 'pass_type', label: 'Pass Type', type: 'select', options: ['VIP', 'VVIP', 'General', 'Staff', 'Speaker', 'Media'] },
            { id: 'event_date', label: 'Event Date', type: 'text', placeholder: '25 Dec 2024' },
            { id: 'event_time', label: 'Time / Session', type: 'text', placeholder: '10:00 AM - Night' },
            { id: 'ticket_no', label: 'Ticket No.', type: 'text', placeholder: 'TKT-2024-001' },
            { id: 'ticket_price', label: 'Ticket Price', type: 'text', placeholder: '₹50' },
            { id: 'venue', label: 'Venue', type: 'text', placeholder: 'Convention Center, Main Hall' }
        ]
    }
};

const TEMPLATES: Record<DesignTemplate, { name: string }> = {
    modern_minimalist: { name: 'Modern Minimalist' },
    classic_professional: { name: 'Classic Professional' },
    colorful_vibrant: { name: 'Colorful Vibrant' }
};

export default function IdCardGenerator() {
    const [category, setCategory] = useState<CategoryType>('school_student');
    const [orientation, setOrientation] = useState<OrientationType>('portrait');
    const [template, setTemplate] = useState<DesignTemplate>('modern_minimalist');
    const [exportFormat, setExportFormat] = useState<ExportFormat>('JPG');
    const [details, setDetails] = useState<Record<string, string>>({});
    const [photos, setPhotos] = useState<Record<string, string>>({});
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [showQrCode, setShowQrCode] = useState(true);
    const [cardBgColor, setCardBgColor] = useState<string>('#ffffff');
    const [accentColor, setAccentColor] = useState<string>(CATEGORIES['school_student'].color);
    const [backgroundPattern, setBackgroundPattern] = useState<BackgroundPattern>('solid');
    const [eventPassBgImage, setEventPassBgImage] = useState<string | null>(null);
    const [scale, setScale] = useState(1);

    const cardRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    const activeCategory = CATEGORIES[category];

    // Update accent color when category changes
    useEffect(() => {
        setAccentColor(activeCategory.color);
    }, [category, activeCategory]);

    // Calculate scale to fit preview
    useEffect(() => {
        const calculateScale = () => {
            if (!previewContainerRef.current) return;
            const containerWidth = previewContainerRef.current.clientWidth;
            const containerHeight = previewContainerRef.current.clientHeight;
            const padding = 60; // Padding for comfortable view

            // Card dimensions
            const cardStyle = getCardStyle();
            const cardW = parseInt(typeof cardStyle.width === 'string' ? cardStyle.width : '0') || 400;
            const cardH = parseInt(typeof cardStyle.height === 'string' ? cardStyle.height : '0') || 600;

            const scaleX = (containerWidth - padding) / cardW;
            const scaleY = (containerHeight - padding) / cardH;

            // Use the smaller scale to fit both dimensions
            const newScale = Math.min(Math.min(scaleX, scaleY), 1);
            // Ensure it doesn't get too small or negative
            setScale(Math.max(newScale, 0.4));
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        // Small delay to ensure container is rendered
        const timer = setTimeout(calculateScale, 100);
        return () => {
            window.removeEventListener('resize', calculateScale);
            clearTimeout(timer);
        };
    }, [orientation, category, template]);

    // Generate QR Code using Canvas
    useEffect(() => {
        const generateQR = async () => {
            try {
                const qrFields = activeCategory.qr_data;
                const qrText = qrFields.map(field => `${field}:${details[field] || ''}`).join('|');

                if (qrText.length > 1) {
                    const encodedText = encodeURIComponent(qrText);
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedText}`;
                    setQrCode(qrUrl);
                }
            } catch (error) {
                console.error('QR Generation failed:', error);
            }
        };

        generateQR();
    }, [details, category, activeCategory]);

    const handlePhotoUpload = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotos({ ...photos, [fieldId]: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleDetailChange = (fieldId: string, value: string) => {
        setDetails({ ...details, [fieldId]: value });
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            // Need to temporarily reset transform to capture correctly if scale affects it,
            // but html2canvas usually captures the element state. 
            // Better to clone or specific options? 
            // Actually html2canvas captures what's visible. 
            // If we use 'scale' option in html2canvas it multiplies the resolution.

            const canvas = await html2canvas(cardRef.current, {
                scale: 4, // High Res
                useCORS: true,
                backgroundColor: null // transparent
            } as any);

            const link = document.createElement('a');
            const fileName = `ID-Card-${category}-${(details['student_name'] || details['staff_name'] || details['emp_name'] || 'card').replace(/\s+/g, '-')}`;

            if (exportFormat === 'JPG') {
                link.download = `${fileName}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
            } else if (exportFormat === 'PNG') {
                link.download = `${fileName}.png`;
                link.href = canvas.toDataURL('image/png');
            } else if (exportFormat === 'PDF') {
                // For PDF, usually we'd use jsPDF, but here we just download as image for simplicity unless jsPDF is added. 
                // The previous code downloaded as JPG for PDF. We'll keep that behavior or suggest jsPDF later.
                link.download = `${fileName}.pdf`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
            }

            link.click();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Error generating ID card.');
        }
    };

    const getCardStyle = () => {
        if (category === 'event_pass') {
            return { width: '600px', height: '250px' };
        }
        if (category === 'hospital_staff') {
            return { width: '320px', height: '500px' };
        }
        const base = orientation === 'portrait'
            ? { width: '350px', height: '550px' }
            : { width: '550px', height: '350px' };
        return base;
    };

    const getThemeStyles = () => {
        let bgColor = cardBgColor;
        let accentColorVal = accentColor;

        if (template === 'modern_minimalist') {
            bgColor = cardBgColor === '#ffffff' ? '#f9fafb' : cardBgColor;
        } else if (template === 'classic_professional') {
            bgColor = cardBgColor;
        } else if (template === 'colorful_vibrant') {
            // For vibrant, we keep usage of transparent overlays unless solid color is picked
            bgColor = cardBgColor;
        }

        return { bgColor, accentColorVal };
    };

    const getBackgroundStyle = (baseColor: string) => {
        if (backgroundPattern === 'gradient' && baseColor.startsWith('linear-gradient')) {
            return { background: baseColor };
        } else if (backgroundPattern === 'dots') {
            return {
                backgroundColor: baseColor,
                backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
            };
        } else if (backgroundPattern === 'waves') {
            return {
                backgroundColor: baseColor,
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(0,0,0,0.05) 35px, rgba(0,0,0,0.05) 70px)`
            };
        } else if (backgroundPattern === 'grid') {
            return {
                backgroundColor: baseColor,
                backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0,0,0,.05) 25%, rgba(0,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.05) 75%, rgba(0,0,0,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0,0,0,.05) 25%, rgba(0,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.05) 75%, rgba(0,0,0,.05) 76%, transparent 77%, transparent)`,
                backgroundSize: '50px 50px'
            };
        }
        return { backgroundColor: baseColor };
    };

    const themeStyles = getThemeStyles();

    return (
        <div className="flex flex-col h-screen pt-16 bg-gray-50 overflow-hidden font-sans">
            {/* TOP BAR: Header & Categories */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-30 flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-shrink-0">
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">ID Card Generator</h1>
                    <p className="text-[10px] text-gray-500">Professional ID cards generator.</p>
                </div>

                {/* Categories - Horizontal Scroll */}
                <div className="flex-1 flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar mask-gradient-x py-1 px-2">
                    {(Object.keys(CATEGORIES) as CategoryType[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all flex-shrink-0 whitespace-nowrap ${category === cat ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                        >
                            {(() => { const Icon = CATEGORIES[cat].icon; return <Icon size={14} />; })()}
                            <span className="text-[10px] font-bold uppercase tracking-wide">{CATEGORIES[cat].name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-shrink-0 hidden md:block">
                    <p className="text-[15px] text-gray-400 bg-gray-50 px-2 py-1 rounded border">Paid Plans For bulk with Serial Number: <span className="text-green-600 font-bold">₹1/card</span></p>
                </div>
            </div>

            {/* SECONDARY TOP BAR: Design Controls */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 md:gap-8 overflow-x-auto z-20 flex-shrink-0 custom-scrollbar">
                {/* Orientation */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Orientation</label>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg">
                        {(['portrait', 'landscape'] as OrientationType[]).map(ori => (
                            <button
                                key={ori}
                                onClick={() => setOrientation(ori)}
                                className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${orientation === ori ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {ori}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-px h-8 bg-gray-100 flex-shrink-0"></div>

                {/* Template */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Template</label>
                    <div className="flex gap-1">
                        {(Object.keys(TEMPLATES) as DesignTemplate[]).map(tmpl => (
                            <button
                                key={tmpl}
                                onClick={() => setTemplate(tmpl)}
                                className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase border transition-all whitespace-nowrap ${template === tmpl ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {TEMPLATES[tmpl].name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-px h-8 bg-gray-100 flex-shrink-0"></div>

                {/* Pattern */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Pattern</label>
                    <select
                        value={backgroundPattern}
                        onChange={(e) => setBackgroundPattern(e.target.value as BackgroundPattern)}
                        className="h-[26px] px-2 bg-gray-50 border border-gray-200 rounded text-[10px] font-bold text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                        {(['solid', 'dots', 'waves', 'grid'] as BackgroundPattern[]).map(p => (
                            <option key={p} value={p}>{p.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <div className="w-px h-8 bg-gray-100 flex-shrink-0"></div>

                {/* Colors */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Theme Colors</label>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            {BACKGROUND_COLORS.solid.slice(0, 4).map(color => (
                                <button
                                    key={color.hex}
                                    onClick={() => { setCardBgColor(color.hex); setBackgroundPattern('solid'); }}
                                    className={`w-5 h-5 rounded-full border shadow-sm transition-transform hover:scale-110 ${cardBgColor === color.hex && backgroundPattern === 'solid' ? 'ring-2 ring-offset-1 ring-blue-500' : 'border-gray-200'}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <div className="flex gap-1">
                            {BACKGROUND_COLORS.gradient.slice(0, 3).map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => { setCardBgColor(color.hex); setBackgroundPattern('gradient'); }}
                                    className={`w-5 h-5 rounded-full border shadow-sm transition-transform hover:scale-110 ${cardBgColor === color.hex && backgroundPattern === 'gradient' ? 'ring-2 ring-offset-1 ring-blue-500' : 'border-white'}`}
                                    style={{ background: color.hex }}
                                    title={color.name}
                                />
                            ))}
                        </div>

                        {/* Accent Color Picker */}
                        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                            <div className="relative group">
                                <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm cursor-pointer" style={{ backgroundColor: accentColor }}></div>
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                                    title="Accent Color"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Event Background Upload (Conditional) */}
                {category === 'event_pass' && (
                    <>
                        <div className="w-px h-8 bg-gray-100 flex-shrink-0"></div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Bg Image</label>
                            <label className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold cursor-pointer hover:bg-blue-100 transition-colors">
                                <Upload size={10} />
                                <span>Upload</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setEventPassBgImage(ev.target?.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                            </label>
                        </div>
                    </>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL: Inputs */}
                <div className="w-full lg:w-[400px] flex-shrink-0 h-full overflow-y-auto bg-white border-r border-gray-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 custom-scrollbar flex flex-col">
                    <div className="p-6 space-y-6 flex-1">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10 py-2 border-b border-gray-100">
                            Enter Details
                        </h2>

                        <div className="space-y-4">
                            {activeCategory.fields.map((field) => (
                                <div key={field.id}>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block pl-1">{field.label}</label>

                                    {field.type === 'image' ? (
                                        <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm hover:border-blue-300 transition-all group">
                                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex flex-shrink-0 items-center justify-center overflow-hidden relative">
                                                {photos[field.id] ? (
                                                    <img src={photos[field.id]} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={18} className="text-gray-300 group-hover:text-blue-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm">
                                                    <Upload size={10} />
                                                    Choose File
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(field.id, e)} />
                                                </label>
                                                {photos[field.id] && (
                                                    <button
                                                        onClick={() => setPhotos({ ...photos, [field.id]: '' })}
                                                        className="ml-2 text-[10px] text-red-400 hover:text-red-500"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : field.type === 'select' ? (
                                        <div className="relative">
                                            <select
                                                value={details[field.id] || ''}
                                                onChange={(e) => handleDetailChange(field.id, e.target.value)}
                                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none"
                                            >
                                                <option value="">Select Option...</option>
                                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        </div>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            placeholder={field.placeholder}
                                            value={details[field.id] || ''}
                                            onChange={(e) => handleDetailChange(field.id, e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none placeholder:text-gray-400"
                                        />
                                    ) : (
                                        <input
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            placeholder={field.placeholder}
                                            value={details[field.id] || ''}
                                            onChange={(e) => handleDetailChange(field.id, e.target.value)}
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase">Show QR Code</span>
                                <button
                                    onClick={() => setShowQrCode(!showQrCode)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all ${showQrCode ? 'bg-green-500' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showQrCode ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Download Section */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 pb-8 lg:pb-4">
                        <div className="flex gap-1 mb-3 bg-white p-1 rounded-lg border border-gray-200">
                            {(['JPG', 'PNG', 'PDF'] as ExportFormat[]).map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => setExportFormat(fmt)}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${exportFormat === fmt ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleDownload}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            <span>Download ID Card</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL: Preview */}
                <div className="flex-1 relative bg-slate-100/50 flex items-center justify-center overflow-hidden p-8" ref={previewContainerRef}>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-mono font-bold text-gray-500 border border-gray-200 shadow-sm">
                            PREVIEW MODE
                        </div>
                        <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-mono font-bold text-gray-500 border border-gray-200 shadow-sm">
                            {Math.round(scale * 100)}%
                        </div>
                    </div>

                    <div
                        style={{
                            transform: `scale(${scale})`,
                            transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                        }}
                    >
                        <div className={`bg-transparent p-0 relative pointer-events-none drop-shadow-2xl`}>
                            {category === 'event_pass' ? (
                                <div
                                    ref={cardRef}
                                    className="relative overflow-hidden pointer-events-auto bg-white"
                                    style={{
                                        width: '600px',
                                        height: '250px',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                    }}
                                >
                                    {/* Standard Event Pass Content - Same as before but ensured clean rendering */}
                                    <div className="absolute inset-0" style={{
                                        ...getBackgroundStyle(
                                            backgroundPattern === 'gradient' && cardBgColor.startsWith('linear-gradient') ? cardBgColor :
                                                backgroundPattern === 'solid' && cardBgColor.startsWith('linear-gradient') ? accentColor :
                                                    accentColor
                                        )
                                    }} />

                                    {eventPassBgImage ? (
                                        <div className="absolute overflow-hidden" style={{ width: '280px', height: '300px', transform: 'rotate(-15deg) skewX(-5deg)', top: '-50px', left: '120px', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', opacity: 0.9 }}>
                                            <img src={eventPassBgImage} className="w-full h-full object-cover" style={{ transform: 'rotate(15deg) scale(1.3)' }} alt="Bg" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute" style={{ width: '300px', height: '400px', background: 'rgba(255,255,255,0.1)', transform: 'rotate(-15deg)', top: '-100px', left: '150px' }} />
                                            <div className="absolute" style={{ width: '200px', height: '400px', background: 'rgba(255,255,255,0.05)', transform: 'rotate(-15deg)', top: '-100px', left: '280px' }} />
                                        </>
                                    )}

                                    <div className="absolute left-0 top-0 bottom-0 z-10 p-6 flex flex-col justify-between" style={{ width: '60%' }}>
                                        <div>
                                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{details['organizer'] || 'Organizer Name'}</p>
                                            <h1 className="text-white text-2xl font-black uppercase tracking-tight leading-none drop-shadow-sm">{details['event_name'] || 'EVENT NAME'}</h1>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-white text-base font-bold mb-1">{details['attendee_name'] || 'Attendee Name'}</p>
                                            <div className="flex items-center gap-3 text-white/90 text-[10px] bg-black/10 inline-flex px-2 py-1.5 rounded backdrop-blur-sm">
                                                <Calendar size={12} />
                                                <span className="font-bold">{details['event_date'] || 'Date'}</span>
                                                <span className="opacity-50">|</span>
                                                <span>{details['event_time'] || 'Time'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between gap-4 mt-auto">
                                            <div>
                                                <p className="text-white/60 text-[9px] uppercase font-bold mb-0.5">Price</p>
                                                <p className="text-white text-2xl font-black tracking-tighter">{details['ticket_price'] || 'FREE'}</p>
                                            </div>
                                            <div className="text-right flex-1 max-w-[180px]">
                                                <div className="flex items-center justify-end gap-1 text-white/80 mb-0.5"><MapPin size={10} /><p className="text-[9px] uppercase font-bold">Venue</p></div>
                                                <p className="text-white text-[10px] font-medium leading-tight">{details['venue'] || 'Venue Location, City'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 bottom-0" style={{ right: '35%', borderLeft: '2px dashed rgba(255,255,255,0.4)' }} />
                                    <div className="absolute w-6 h-6 rounded-full bg-slate-100 shadow-inner" style={{ right: 'calc(35% - 12px)', top: '-12px' }}></div>
                                    <div className="absolute w-6 h-6 rounded-full bg-slate-100 shadow-inner" style={{ right: 'calc(35% - 12px)', bottom: '-12px' }}></div>

                                    <div className="absolute top-0 bottom-0 flex flex-col items-center justify-center z-10 p-4" style={{ right: 0, width: '35%' }}>
                                        <div className="mb-4">
                                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm" style={{ backgroundColor: details['pass_type'] === 'VIP' || details['pass_type'] === 'VVIP' ? '#fbbf24' : 'rgba(255,255,255,0.95)', color: details['pass_type'] === 'VIP' || details['pass_type'] === 'VVIP' ? '#1f2937' : '#000' }}>
                                                {details['pass_type'] || 'General'}
                                            </span>
                                        </div>
                                        <div className="bg-white p-2 rounded-xl shadow-lg mb-3">
                                            {showQrCode && qrCode ? <img src={qrCode} className="w-20 h-20 mix-blend-multiply" alt="QR" /> : <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center"><QrCode className="text-gray-300" /></div>}
                                        </div>
                                        <p className="text-white/80 text-[10px] uppercase font-bold text-center tracking-wider">Scan for Entry</p>
                                    </div>
                                </div>
                            ) : category === 'hospital_staff' ? (
                                <div
                                    ref={cardRef}
                                    className="relative overflow-hidden pointer-events-auto bg-white flex flex-col shadow-2xl"
                                    style={{ width: '320px', height: '500px', borderRadius: '16px' }}
                                >
                                    <div className="relative flex flex-col items-center justify-end pb-8 flex-shrink-0" style={{ height: '190px', background: backgroundPattern === 'gradient' && cardBgColor.startsWith('linear-gradient') ? cardBgColor : accentColor, clipPath: 'ellipse(150% 100% at 50% 0%)' }}>
                                        <div className="absolute top-5 w-full px-5 flex justify-between items-start z-30">
                                            <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-lg p-1 shadow-sm flex items-center justify-center">
                                                {photos['hospital_logo'] ? <img src={photos['hospital_logo']} className="w-full h-full object-contain" /> : <div className="text-blue-500 font-black text-[10px]">LOGO</div>}
                                            </div>
                                            {showQrCode && qrCode && <div className="p-1 bg-white rounded-lg shadow-sm"><img src={qrCode} className="w-10 h-10" /></div>}
                                        </div>
                                        <div className="text-center z-10 mb-8 px-4">
                                            <h3 className="text-white text-lg font-black uppercase tracking-wide leading-tight drop-shadow-md">{details['hospital_name'] || 'HOSPITAL NAME'}</h3>
                                            <p className="text-white/80 text-[10px] font-medium tracking-wider uppercase mt-1">Medical Staff ID</p>
                                        </div>
                                    </div>
                                    <div className="absolute left-1/2 transform -translate-x-1/2 top-[140px] z-20">
                                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center text-gray-300">
                                            {photos['staff_photo'] ? <img src={photos['staff_photo']} className="w-full h-full object-cover" /> : <User size={48} />}
                                        </div>
                                    </div>
                                    <div className="pt-20 px-6 flex-1 flex flex-col items-center">
                                        <h2 className="text-xl font-bold text-gray-900 text-center leading-none">{details['staff_name'] || 'Doctor Name'}</h2>
                                        <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wide border border-blue-100">{details['job_title'] || 'Specialist'}</span>
                                        <div className="w-full mt-6 space-y-3">
                                            <div className="flex justify-between items-center border-b border-gray-100 pb-2"><span className="text-[10px] text-gray-400 font-bold uppercase">ID Number</span><span className="text-sm font-mono font-semibold text-gray-700">{details['batch_id'] || '---'}</span></div>
                                            <div className="flex justify-between items-center border-b border-gray-100 pb-2"><span className="text-[10px] text-gray-400 font-bold uppercase">Department</span><span className="text-sm font-semibold text-gray-700">{details['department'] || '---'}</span></div>
                                        </div>
                                    </div>
                                    <div className="h-3 w-full mt-auto" style={{ backgroundColor: accentColor }}></div>
                                </div>
                            ) : (
                                <div
                                    ref={cardRef}
                                    className={`relative pointer-events-auto bg-white overflow-hidden shadow-2xl flex ${orientation === 'landscape' ? 'flex-row' : 'flex-col'}`}
                                    style={{
                                        ...getCardStyle(),
                                        ...getBackgroundStyle(themeStyles.bgColor),
                                        borderRadius: template === 'classic_professional' ? '0' : '16px',
                                        border: template === 'classic_professional' ? '2px solid #ddd' : 'none'
                                    }}
                                >
                                    {template === 'modern_minimalist' && (
                                        <div className={`absolute z-10 ${orientation === 'portrait' ? 'top-0 left-0 right-0 h-3' : 'top-0 bottom-0 left-0 w-3'}`} style={{ backgroundColor: accentColor }} />
                                    )}

                                    {orientation === 'portrait' && (
                                        <>
                                            <div className={`p-5 pb-0 relative z-10 text-center ${template === 'modern_minimalist' ? 'pt-8' : ''}`}>
                                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">{details['school_name'] || details['hospital_name'] || details['company_name'] || 'COMPANY NAME'}</h3>
                                                {template === 'classic_professional' && <div className="h-0.5 w-1/3 bg-gray-800 mx-auto mt-2"></div>}
                                            </div>
                                            <div className="flex justify-center p-6 pb-4">
                                                <div className="w-32 h-32 rounded-full border-4 shadow-lg overflow-hidden bg-white relative group" style={{ borderColor: template === 'modern_minimalist' ? accentColor : '#fff' }}>
                                                    {photos['student_photo'] || photos['staff_photo'] || photos['emp_photo'] ? <img src={photos['student_photo'] || photos['staff_photo'] || photos['emp_photo']} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300"><User size={48} /></div>}
                                                </div>
                                            </div>
                                            <div className="text-center px-4 mb-6">
                                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{details['student_name'] || details['staff_name'] || details['emp_name'] || 'YOUR NAME'}</h2>
                                                <p className="text-sm font-bold uppercase tracking-wide mt-1" style={{ color: accentColor }}>{details['designation'] || details['job_title'] || activeCategory.name}</p>
                                            </div>
                                            <div className="flex-1 px-8 space-y-3">
                                                {activeCategory.fields.filter(f => f.type !== 'image' && f.type !== 'textarea').slice(0, 5).map(field => (
                                                    <div key={field.id} className="flex justify-between items-center border-b border-gray-100 pb-1.5 dashed">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{field.label}</span>
                                                        <span className="text-xs font-semibold text-gray-700 text-right max-w-[150px] truncate">{details[field.id] || '-'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 mt-auto flex items-end justify-between">
                                                <div className="text-[10px] text-gray-400 font-medium">ID: {details['roll_no'] || details['emp_id'] || details['batch_id'] || '00000'}</div>
                                                {showQrCode && qrCode && <img src={qrCode} className="w-14 h-14" />}
                                            </div>
                                            <div className="h-3 w-full" style={{ backgroundColor: accentColor }}></div>
                                        </>
                                    )}

                                    {orientation === 'landscape' && (
                                        <>
                                            <div className={`w-1/3 flex flex-col items-center justify-center p-4 relative z-10 border-r border-gray-100 bg-gray-50/50`}>
                                                <div className="w-24 h-24 rounded-full border-4 shadow-md overflow-hidden bg-white mb-3" style={{ borderColor: accentColor }}>
                                                    {photos['student_photo'] || photos['staff_photo'] || photos['emp_photo'] ? <img src={photos['student_photo'] || photos['staff_photo'] || photos['emp_photo']} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300"><User size={32} /></div>}
                                                </div>
                                                <h2 className="text-sm font-bold text-center leading-tight mb-1">{details['student_name'] || details['staff_name'] || details['emp_name'] || 'Name'}</h2>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase text-center">{details['designation'] || details['job_title'] || 'Role'}</p>
                                                {showQrCode && qrCode && <div className="mt-auto pt-2"><img src={qrCode} className="w-12 h-12" /></div>}
                                            </div>
                                            <div className="flex-1 p-5 flex flex-col">
                                                <div className="border-b-2 border-gray-100 pb-2 mb-4 flex justify-between items-center">
                                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">{details['school_name'] || details['hospital_name'] || details['company_name'] || 'ORGANIZATION'}</h3>
                                                    {photos['hospital_logo'] && <img src={photos['hospital_logo']} className="h-6 w-auto" />}
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                                    {activeCategory.fields.filter(f => f.type !== 'image' && f.type !== 'textarea').slice(0, 6).map(field => (
                                                        <div key={field.id}>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase">{field.label}</p>
                                                            <p className="text-xs font-semibold text-gray-700 truncate">{details[field.id] || '-'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-auto flex justify-between items-center">
                                                    <div className="text-[10px] text-gray-400">Valid: 2024-2025</div>
                                                    <div className="text-white text-[9px] font-bold uppercase py-1 px-3 rounded-full" style={{ backgroundColor: accentColor }}>AUTHORIZED</div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
