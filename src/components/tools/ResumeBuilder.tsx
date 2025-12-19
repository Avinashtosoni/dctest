import { useState, useRef, useEffect } from 'react';
import { Upload, Download, User, Briefcase, GraduationCap, Wrench, FolderOpen, Plus, Trash2, Mail, Phone, MapPin, Linkedin, Globe, Palette, Star, Sparkles, Eye, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type TemplateType =
    | 'modern' | 'classic' | 'creative' | 'minimal'
    | 'executive' | 'elegant' | 'tech' | 'artistic'
    | 'corporate' | 'startup' | 'academic' | 'healthcare'
    | 'wedding_elegant' | 'wedding_floral' | 'wedding_modern' | 'wedding_classic'
    | 'bold' | 'timeline' | 'infographic' | 'dark_mode'
    | 'luxury' | 'simple' | 'fresh' | 'professional';

interface TemplateConfig {
    id: TemplateType;
    name: string;
    category: 'Professional' | 'Creative' | 'Wedding' | 'Modern' | 'Specialty';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    layout: 'sidebar-left' | 'sidebar-right' | 'top-header' | 'two-column' | 'centered';
    style: 'minimal' | 'bold' | 'elegant' | 'modern' | 'classic';
    badge?: 'recommended' | 'popular' | 'new' | 'ats-friendly';
}

const TEMPLATES: TemplateConfig[] = [
    // Professional Templates
    { id: 'modern', name: 'Modern Pro', category: 'Professional', primaryColor: '#2563eb', secondaryColor: '#f8fafc', accentColor: '#3b82f6', layout: 'sidebar-left', style: 'modern', badge: 'recommended' },
    { id: 'classic', name: 'Classic', category: 'Professional', primaryColor: '#1f2937', secondaryColor: '#ffffff', accentColor: '#374151', layout: 'top-header', style: 'classic', badge: 'ats-friendly' },
    { id: 'executive', name: 'Executive', category: 'Professional', primaryColor: '#0f172a', secondaryColor: '#f1f5f9', accentColor: '#475569', layout: 'sidebar-left', style: 'elegant', badge: 'popular' },
    { id: 'corporate', name: 'Corporate', category: 'Professional', primaryColor: '#1e3a5f', secondaryColor: '#ffffff', accentColor: '#2563eb', layout: 'top-header', style: 'classic' },
    { id: 'professional', name: 'Professional', category: 'Professional', primaryColor: '#334155', secondaryColor: '#f8fafc', accentColor: '#0ea5e9', layout: 'sidebar-right', style: 'modern', badge: 'ats-friendly' },

    // Creative Templates
    { id: 'creative', name: 'Creative', category: 'Creative', primaryColor: '#7c3aed', secondaryColor: '#faf5ff', accentColor: '#a855f7', layout: 'two-column', style: 'bold', badge: 'popular' },
    { id: 'artistic', name: 'Artistic', category: 'Creative', primaryColor: '#ec4899', secondaryColor: '#fdf2f8', accentColor: '#f472b6', layout: 'sidebar-left', style: 'bold' },
    { id: 'bold', name: 'Bold', category: 'Creative', primaryColor: '#dc2626', secondaryColor: '#fef2f2', accentColor: '#f87171', layout: 'top-header', style: 'bold', badge: 'new' },
    { id: 'infographic', name: 'Infographic', category: 'Creative', primaryColor: '#0891b2', secondaryColor: '#ecfeff', accentColor: '#22d3ee', layout: 'two-column', style: 'modern' },
    { id: 'dark_mode', name: 'Dark Mode', category: 'Creative', primaryColor: '#18181b', secondaryColor: '#27272a', accentColor: '#a1a1aa', layout: 'sidebar-left', style: 'modern', badge: 'new' },

    // Modern Templates
    { id: 'minimal', name: 'Minimal', category: 'Modern', primaryColor: '#64748b', secondaryColor: '#ffffff', accentColor: '#94a3b8', layout: 'centered', style: 'minimal', badge: 'recommended' },
    { id: 'tech', name: 'Tech', category: 'Modern', primaryColor: '#059669', secondaryColor: '#ecfdf5', accentColor: '#10b981', layout: 'sidebar-left', style: 'modern', badge: 'popular' },
    { id: 'startup', name: 'Startup', category: 'Modern', primaryColor: '#f59e0b', secondaryColor: '#fffbeb', accentColor: '#fbbf24', layout: 'top-header', style: 'bold' },
    { id: 'fresh', name: 'Fresh', category: 'Modern', primaryColor: '#14b8a6', secondaryColor: '#f0fdfa', accentColor: '#2dd4bf', layout: 'two-column', style: 'modern', badge: 'new' },
    { id: 'simple', name: 'Simple', category: 'Modern', primaryColor: '#6b7280', secondaryColor: '#ffffff', accentColor: '#9ca3af', layout: 'centered', style: 'minimal', badge: 'ats-friendly' },

    // Wedding Templates
    { id: 'wedding_elegant', name: 'Elegant Wedding', category: 'Wedding', primaryColor: '#be185d', secondaryColor: '#fdf2f8', accentColor: '#ec4899', layout: 'centered', style: 'elegant', badge: 'recommended' },
    { id: 'wedding_floral', name: 'Floral Wedding', category: 'Wedding', primaryColor: '#059669', secondaryColor: '#f0fdf4', accentColor: '#10b981', layout: 'centered', style: 'elegant', badge: 'popular' },
    { id: 'wedding_modern', name: 'Modern Wedding', category: 'Wedding', primaryColor: '#7c3aed', secondaryColor: '#faf5ff', accentColor: '#a855f7', layout: 'two-column', style: 'modern' },
    { id: 'wedding_classic', name: 'Classic Wedding', category: 'Wedding', primaryColor: '#92400e', secondaryColor: '#fffbeb', accentColor: '#d97706', layout: 'centered', style: 'classic' },

    // Specialty Templates
    { id: 'elegant', name: 'Elegant', category: 'Specialty', primaryColor: '#854d0e', secondaryColor: '#fefce8', accentColor: '#ca8a04', layout: 'sidebar-right', style: 'elegant' },
    { id: 'academic', name: 'Academic', category: 'Specialty', primaryColor: '#1e40af', secondaryColor: '#eff6ff', accentColor: '#3b82f6', layout: 'top-header', style: 'classic', badge: 'ats-friendly' },
    { id: 'healthcare', name: 'Healthcare', category: 'Specialty', primaryColor: '#0e7490', secondaryColor: '#ecfeff', accentColor: '#06b6d4', layout: 'sidebar-left', style: 'modern' },
    { id: 'timeline', name: 'Timeline', category: 'Specialty', primaryColor: '#4f46e5', secondaryColor: '#eef2ff', accentColor: '#6366f1', layout: 'two-column', style: 'modern', badge: 'new' },
    { id: 'luxury', name: 'Luxury', category: 'Specialty', primaryColor: '#78350f', secondaryColor: '#fef3c7', accentColor: '#b45309', layout: 'centered', style: 'elegant', badge: 'popular' }
];

const TEMPLATE_CATEGORIES = ['All', 'Professional', 'Creative', 'Modern', 'Wedding', 'Specialty'] as const;

interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    website: string;
    summary: string;
    photo: string | null;
}

interface Experience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    year: string;
    gpa: string;
}

interface Skill {
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface Project {
    id: string;
    name: string;
    description: string;
    technologies: string;
    link: string;
}

// Wedding Biodata Interface - Based on Indian wedding resume formats
interface WeddingBiodata {
    // Personal Details
    fullName: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
    rashi: string;
    nakshatra: string;
    religion: string;
    caste: string;
    subCaste: string;
    gotra: string;
    manglik: string;
    gan: string;
    height: string;
    weight: string;
    complexion: string;
    bloodGroup: string;
    education: string;
    occupation: string;
    income: string;
    photo: string | null;

    // Family Details
    fatherName: string;
    fatherOccupation: string;
    motherName: string;
    motherOccupation: string;
    brothers: string;
    sisters: string;
    mamaDetails: string;
    familyType: string;
    familyStatus: string;

    // Contact Details
    phone: string;
    email: string;
    address: string;
    contactPerson: string;
}

// Rashi options for dropdown
const RASHI_OPTIONS = [
    'Mesh (Aries)', 'Vrishabh (Taurus)', 'Mithun (Gemini)', 'Kark (Cancer)',
    'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchik (Scorpio)',
    'Dhanu (Sagittarius)', 'Makar (Capricorn)', 'Kumbh (Aquarius)', 'Meen (Pisces)'
];

const NAKSHATRA_OPTIONS = [
    'Ashwini', 'Bharani', 'Kritika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const COMPLEXION_OPTIONS = ['Very Fair', 'Fair', 'Wheatish', 'Wheatish Brown', 'Dark'];
const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const MANGLIK_OPTIONS = ['Yes', 'No', 'Anshik (Partial)', 'Not Sure'];
const GAN_OPTIONS = ['Dev (Divine)', 'Manushya (Human)', 'Rakshas (Demon)'];

const ACCENT_COLORS = [
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Green', hex: '#059669' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Orange', hex: '#ea580c' },
    { name: 'Teal', hex: '#0d9488' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Pink', hex: '#db2777' },
    { name: 'Maroon', hex: '#881337' },
    { name: 'Gold', hex: '#b45309' }
];

// Thumbnail component for template preview - enhanced with badges and hover effects
const TemplateThumbnail = ({ template, isSelected, onClick }: { template: TemplateConfig; isSelected: boolean; onClick: () => void }) => {
    // Badge configuration
    const getBadgeStyle = (badge: TemplateConfig['badge']) => {
        switch (badge) {
            case 'recommended': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Star, label: 'Recommended' };
            case 'popular': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Star, label: 'Popular' };
            case 'new': return { bg: 'bg-green-100', text: 'text-green-700', icon: Sparkles, label: 'New' };
            case 'ats-friendly': return { bg: 'bg-teal-100', text: 'text-teal-700', icon: Check, label: 'ATS' };
            default: return null;
        }
    };

    const badgeStyle = getBadgeStyle(template.badge);

    return (
        <div
            className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-teal-500 shadow-xl scale-[1.02]' : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:scale-[1.02]'}`}
            style={{ aspectRatio: '3/4' }}
            onClick={onClick}
        >
            {/* Mini Resume Preview */}
            <div className="w-full h-full" style={{ backgroundColor: template.secondaryColor }}>
                {/* Layout based on template */}
                {template.layout === 'sidebar-left' && (
                    <>
                        <div className="absolute left-0 top-0 bottom-0 w-[35%]" style={{ backgroundColor: template.primaryColor }}>
                            <div className="w-5 h-5 rounded-full bg-white/50 mx-auto mt-4" />
                            <div className="h-1 w-10 bg-white/40 mx-auto mt-2 rounded" />
                            <div className="h-0.5 w-8 bg-white/25 mx-auto mt-1 rounded" />
                            <div className="mt-4 mx-2 space-y-1">
                                <div className="h-0.5 w-full bg-white/30 rounded" />
                                <div className="h-0.5 w-3/4 bg-white/20 rounded" />
                                <div className="h-0.5 w-full bg-white/30 rounded" />
                                <div className="h-0.5 w-2/3 bg-white/20 rounded" />
                            </div>
                        </div>
                        <div className="absolute left-[35%] right-0 top-0 bottom-0 p-3">
                            <div className="h-2.5 w-20 rounded mt-1" style={{ backgroundColor: template.accentColor }} />
                            <div className="h-0.5 w-24 bg-gray-300 mt-1.5 rounded" />
                            <div className="mt-4 space-y-1">
                                <div className="h-1 w-10 rounded" style={{ backgroundColor: template.accentColor + '40' }} />
                                <div className="h-0.5 w-full bg-gray-200 rounded" />
                                <div className="h-0.5 w-4/5 bg-gray-200 rounded" />
                                <div className="h-0.5 w-3/4 bg-gray-200 rounded" />
                            </div>
                            <div className="mt-3 space-y-1">
                                <div className="h-1 w-8 rounded" style={{ backgroundColor: template.accentColor + '40' }} />
                                <div className="h-0.5 w-full bg-gray-200 rounded" />
                                <div className="h-0.5 w-2/3 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </>
                )}
                {template.layout === 'sidebar-right' && (
                    <>
                        <div className="absolute right-0 top-0 bottom-0 w-[35%]" style={{ backgroundColor: template.primaryColor }}>
                            <div className="w-5 h-5 rounded-full bg-white/50 mx-auto mt-4" />
                            <div className="h-1 w-10 bg-white/40 mx-auto mt-2 rounded" />
                            <div className="mt-4 mx-2 space-y-1">
                                <div className="h-0.5 w-full bg-white/30 rounded" />
                                <div className="h-0.5 w-3/4 bg-white/20 rounded" />
                            </div>
                        </div>
                        <div className="absolute left-0 right-[35%] top-0 bottom-0 p-3">
                            <div className="h-2.5 w-20 rounded mt-1" style={{ backgroundColor: template.accentColor }} />
                            <div className="h-0.5 w-24 bg-gray-300 mt-1.5 rounded" />
                            <div className="mt-4 space-y-1">
                                <div className="h-0.5 w-full bg-gray-200 rounded" />
                                <div className="h-0.5 w-4/5 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </>
                )}
                {template.layout === 'top-header' && (
                    <>
                        <div className="absolute left-0 right-0 top-0 h-[28%]" style={{ backgroundColor: template.primaryColor }}>
                            <div className="flex items-center justify-center h-full gap-2">
                                <div className="w-6 h-6 rounded-full bg-white/50" />
                                <div>
                                    <div className="h-2 w-16 bg-white/70 rounded" />
                                    <div className="h-1 w-12 bg-white/40 rounded mt-1" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute left-0 right-0 top-[28%] bottom-0 p-3">
                            <div className="h-1 w-14 rounded mt-1" style={{ backgroundColor: template.accentColor }} />
                            <div className="mt-2 space-y-0.5">
                                <div className="h-0.5 w-full bg-gray-200 rounded" />
                                <div className="h-0.5 w-4/5 bg-gray-200 rounded" />
                                <div className="h-0.5 w-full bg-gray-200 rounded" />
                            </div>
                        </div>
                    </>
                )}
                {template.layout === 'two-column' && (
                    <>
                        <div className="absolute inset-0 p-3">
                            <div className="h-2.5 w-18 rounded mx-auto" style={{ backgroundColor: template.primaryColor }} />
                            <div className="h-0.5 w-24 bg-gray-300 mx-auto mt-1.5 rounded" />
                            <div className="flex gap-3 mt-4">
                                <div className="flex-1 space-y-1">
                                    <div className="h-1 w-10 rounded" style={{ backgroundColor: template.accentColor + '60' }} />
                                    <div className="h-0.5 w-full bg-gray-200 rounded" />
                                    <div className="h-0.5 w-4/5 bg-gray-200 rounded" />
                                    <div className="h-0.5 w-full bg-gray-200 rounded" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="h-1 w-8 rounded" style={{ backgroundColor: template.accentColor + '60' }} />
                                    <div className="h-0.5 w-full bg-gray-200 rounded" />
                                    <div className="h-0.5 w-3/4 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-8 left-1/2 bottom-4 w-px" style={{ backgroundColor: template.accentColor + '30' }} />
                    </>
                )}
                {template.layout === 'centered' && (
                    <div className="absolute inset-0 p-3 flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full mt-3 flex items-center justify-center" style={{ backgroundColor: template.primaryColor + '20' }}>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: template.primaryColor }} />
                        </div>
                        <div className="h-2 w-18 rounded mt-2" style={{ backgroundColor: template.primaryColor }} />
                        <div className="h-0.5 w-20 bg-gray-300 mt-1.5 rounded" />
                        <div className="w-full mt-4 space-y-1 px-2">
                            <div className="h-1 w-12 mx-auto rounded" style={{ backgroundColor: template.accentColor + '60' }} />
                            <div className="h-0.5 w-full bg-gray-200 rounded" />
                            <div className="h-0.5 w-4/5 bg-gray-200 mx-auto rounded" />
                            <div className="h-0.5 w-full bg-gray-200 rounded" />
                        </div>
                    </div>
                )}
            </div>

            {/* Badge */}
            {badgeStyle && (
                <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full ${badgeStyle.bg} ${badgeStyle.text} text-[7px] font-bold flex items-center gap-0.5`}>
                    <badgeStyle.icon className="w-2 h-2" />
                    {badgeStyle.label}
                </div>
            )}

            {/* Hover Overlay with Choose Button */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                <Eye className="w-5 h-5 text-white/70" />
                <span className="px-3 py-1.5 bg-teal-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                    Choose Template
                </span>
            </div>

            {/* Template Name - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6">
                <p className="text-white text-[10px] font-bold truncate">{template.name}</p>
                <p className="text-white/60 text-[8px]">{template.category}</p>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 text-white" />
                </div>
            )}
        </div>
    );
};

export default function ResumeBuilder() {
    const [template, setTemplate] = useState<TemplateType>('modern');
    const [accentColor, setAccentColor] = useState('#2563eb');
    const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects'>('personal');
    const [isExporting, setIsExporting] = useState(false);
    const [templateCategory, setTemplateCategory] = useState<typeof TEMPLATE_CATEGORIES[number]>('All');

    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        website: '',
        summary: '',
        photo: null
    });

    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    // Wedding Biodata State
    const [weddingBiodata, setWeddingBiodata] = useState<WeddingBiodata>({
        fullName: '',
        dateOfBirth: '',
        timeOfBirth: '',
        placeOfBirth: '',
        rashi: '',
        nakshatra: '',
        religion: '',
        caste: '',
        subCaste: '',
        gotra: '',
        manglik: '',
        gan: '',
        height: '',
        weight: '',
        complexion: '',
        bloodGroup: '',
        education: '',
        occupation: '',
        income: '',
        photo: null,
        fatherName: '',
        fatherOccupation: '',
        motherName: '',
        motherOccupation: '',
        brothers: '',
        sisters: '',
        mamaDetails: '',
        familyType: '',
        familyStatus: '',
        phone: '',
        email: '',
        address: '',
        contactPerson: ''
    });

    // Check if current template is a wedding template
    const isWeddingTemplate = template.startsWith('wedding_');

    // Active section for wedding biodata
    const [weddingActiveSection, setWeddingActiveSection] = useState<'personal' | 'family' | 'contact'>('personal');

    const resumeRef = useRef<HTMLDivElement>(null);

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Add new experience
    const addExperience = () => {
        setExperiences([...experiences, {
            id: generateId(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        }]);
    };

    // Add new education
    const addEducation = () => {
        setEducation([...education, {
            id: generateId(),
            institution: '',
            degree: '',
            field: '',
            year: '',
            gpa: ''
        }]);
    };

    // Add new skill
    const addSkill = () => {
        setSkills([...skills, {
            id: generateId(),
            name: '',
            level: 'Intermediate'
        }]);
    };

    // Add new project
    const addProject = () => {
        setProjects([...projects, {
            id: generateId(),
            name: '',
            description: '',
            technologies: '',
            link: ''
        }]);
    };

    // Handle photo upload
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPersonalInfo({ ...personalInfo, photo: ev.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // Scaling for Preview
    const [scale, setScale] = useState(0.5);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateScale = () => {
            if (previewContainerRef.current) {
                const { width, height } = previewContainerRef.current.getBoundingClientRect();
                // Target A4 dimensions in pixels (approx)
                // 210mm x 297mm -> 794px x 1123px @ 96 DPI
                const A4_WIDTH = 794;
                const A4_HEIGHT = 1123;

                // Allow some padding
                const paddingCheck = 48;

                const availableWidth = width - paddingCheck;
                const availableHeight = height - paddingCheck;

                const scaleW = availableWidth / A4_WIDTH;
                const scaleH = availableHeight / A4_HEIGHT;

                // Fit fully visible
                const fitScale = Math.min(scaleW, scaleH);

                // Limit max scale to avoiding blurriness if screen is huge (optional, but good practice)
                // Limit min scale to avoid tiny ants
                setScale(Math.min(Math.max(fitScale, 0.3), 1.2));
            }
        };

        // Delay initial calculation slightly to allow layout to settle
        const timer = setTimeout(updateScale, 100);
        window.addEventListener('resize', updateScale);

        return () => {
            window.removeEventListener('resize', updateScale);
            clearTimeout(timer);
        };
    }, []);

    // Export to PDF
    const exportToPDF = async () => {
        if (!resumeRef.current) return;
        setIsExporting(true);

        try {
            const canvas = await html2canvas(resumeRef.current, {
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            } as any);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${personalInfo.fullName || 'resume'}_resume.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Render skill level bar
    const getSkillWidth = (level: Skill['level']) => {
        switch (level) {
            case 'Beginner': return '25%';
            case 'Intermediate': return '50%';
            case 'Advanced': return '75%';
            case 'Expert': return '100%';
        }
    };

    return (
        <div className="fixed inset-0 top-16 flex overflow-hidden bg-gray-50">
            {/* Left Panel - Editor */}
            <div className="w-[500px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full z-10 shadow-lg">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 scrollbar-thin scrollbar-thumb-gray-300">
                    <div className="mb-6">
                        <h1 className="text-2xl font-black text-gray-900">Resume Builder</h1>
                        <p className="text-gray-500 text-sm">Create your professional resume</p>
                    </div>
                    {/* Template & Color Selection */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Palette className="w-5 h-5 mr-2 text-teal-600" /> Choose Template
                        </h2>

                        {/* Category Filter Tabs */}
                        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                            {TEMPLATE_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setTemplateCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${templateCategory === cat ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Template Thumbnails Grid */}
                        <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                            {TEMPLATES
                                .filter(t => templateCategory === 'All' || t.category === templateCategory)
                                .map(t => (
                                    <TemplateThumbnail
                                        key={t.id}
                                        template={t}
                                        isSelected={template === t.id}
                                        onClick={() => {
                                            setTemplate(t.id);
                                            setAccentColor(t.primaryColor);
                                        }}
                                    />
                                ))}
                        </div>

                        {/* Accent Colors */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Accent Color</p>
                            <div className="flex gap-2 flex-wrap">
                                {ACCENT_COLORS.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => setAccentColor(color.hex)}
                                        className={`w-7 h-7 rounded-full transition-transform ${accentColor === color.hex ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section Tabs - Different for Wedding vs Professional */}
                    {isWeddingTemplate ? (
                        // Wedding Biodata Tabs
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-1">
                            {[
                                { id: 'personal', icon: User, label: 'Personal Details' },
                                { id: 'family', icon: User, label: 'Family Details' },
                                { id: 'contact', icon: Phone, label: 'Contact' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setWeddingActiveSection(tab.id as any)}
                                    className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${weddingActiveSection === tab.id ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        // Professional Resume Tabs
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-1">
                            {[
                                { id: 'personal', icon: User, label: 'Personal' },
                                { id: 'experience', icon: Briefcase, label: 'Experience' },
                                { id: 'education', icon: GraduationCap, label: 'Education' },
                                { id: 'skills', icon: Wrench, label: 'Skills' },
                                { id: 'projects', icon: FolderOpen, label: 'Projects' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id as any)}
                                    className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeSection === tab.id ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Form Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 max-h-[500px] overflow-y-auto">

                        {/* ===== WEDDING BIODATA FORMS ===== */}
                        {isWeddingTemplate && (
                            <>
                                {/* Wedding Personal Details */}
                                {weddingActiveSection === 'personal' && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center text-lg border-b pb-2">
                                            <User className="w-5 h-5 mr-2 text-rose-600" /> Personal Details (व्यक्तिगत जानकारी)
                                        </h3>

                                        {/* Photo Upload */}
                                        <div className="flex items-center gap-4 p-3 bg-rose-50 rounded-xl">
                                            <div className="w-24 h-24 rounded-lg bg-white overflow-hidden flex items-center justify-center border-2 border-dashed border-rose-300">
                                                {weddingBiodata.photo ? (
                                                    <img src={weddingBiodata.photo} className="w-full h-full object-cover" alt="Profile" />
                                                ) : (
                                                    <User className="w-10 h-10 text-rose-300" />
                                                )}
                                            </div>
                                            <label className="cursor-pointer px-4 py-2 bg-rose-100 rounded-lg text-sm font-medium text-rose-700 hover:bg-rose-200 transition-colors">
                                                <Upload className="w-4 h-4 inline mr-2" />
                                                Upload Photo
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => setWeddingBiodata({ ...weddingBiodata, photo: ev.target?.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="Full Name (पूरा नाम)" value={weddingBiodata.fullName}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, fullName: e.target.value })}
                                                className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="date" placeholder="Date of Birth" value={weddingBiodata.dateOfBirth}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, dateOfBirth: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="time" placeholder="Time of Birth" value={weddingBiodata.timeOfBirth}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, timeOfBirth: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Place of Birth (जन्म स्थान)" value={weddingBiodata.placeOfBirth}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, placeOfBirth: e.target.value })}
                                                className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <select value={weddingBiodata.rashi} onChange={(e) => setWeddingBiodata({ ...weddingBiodata, rashi: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500">
                                                <option value="">Select Rashi (राशि)</option>
                                                {RASHI_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>

                                            <select value={weddingBiodata.nakshatra} onChange={(e) => setWeddingBiodata({ ...weddingBiodata, nakshatra: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500">
                                                <option value="">Select Nakshatra (नक्षत्र)</option>
                                                {NAKSHATRA_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>

                                            <input type="text" placeholder="Religion (धर्म)" value={weddingBiodata.religion}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, religion: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Caste (जाति)" value={weddingBiodata.caste}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, caste: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Sub Caste" value={weddingBiodata.subCaste}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, subCaste: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Gotra (गोत्र)" value={weddingBiodata.gotra}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, gotra: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <select value={weddingBiodata.manglik} onChange={(e) => setWeddingBiodata({ ...weddingBiodata, manglik: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500">
                                                <option value="">Manglik (मांगलिक)</option>
                                                {MANGLIK_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>

                                            <select value={weddingBiodata.gan} onChange={(e) => setWeddingBiodata({ ...weddingBiodata, gan: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500">
                                                <option value="">Select Gan (गण)</option>
                                                {GAN_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>

                                            <input type="text" placeholder="Height (लम्बाई) e.g. 5'7&quot;" value={weddingBiodata.height}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, height: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Weight (वजन) e.g. 65 KG" value={weddingBiodata.weight}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, weight: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <select value={weddingBiodata.complexion} onChange={(e) => setWeddingBiodata({ ...weddingBiodata, complexion: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500">
                                                <option value="">Complexion (रंग)</option>
                                                {COMPLEXION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>

                                            <select value={weddingBiodata.bloodGroup} onChange={(e) => setWeddingBiodata({ ...weddingBiodata, bloodGroup: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500">
                                                <option value="">Blood Group (रक्त समूह)</option>
                                                {BLOOD_GROUP_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>

                                            <input type="text" placeholder="Education (शिक्षा)" value={weddingBiodata.education}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, education: e.target.value })}
                                                className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Occupation (नौकरी/व्यवसाय)" value={weddingBiodata.occupation}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, occupation: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Income (आय) e.g. ₹7 LPA" value={weddingBiodata.income}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, income: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />
                                        </div>
                                    </div>
                                )}

                                {/* Wedding Family Details */}
                                {weddingActiveSection === 'family' && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center text-lg border-b pb-2">
                                            <User className="w-5 h-5 mr-2 text-rose-600" /> Family Details (पारिवारिक विवरण)
                                        </h3>

                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="Father's Name (पिता का नाम)" value={weddingBiodata.fatherName}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, fatherName: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Father's Occupation (पिता का व्यवसाय)" value={weddingBiodata.fatherOccupation}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, fatherOccupation: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Mother's Name (माता का नाम)" value={weddingBiodata.motherName}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, motherName: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Mother's Occupation" value={weddingBiodata.motherOccupation}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, motherOccupation: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Brothers (भाई) e.g. 2 (1 Married)" value={weddingBiodata.brothers}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, brothers: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Sisters (बहन) e.g. 1 Unmarried" value={weddingBiodata.sisters}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, sisters: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Mama Details (मामा)" value={weddingBiodata.mamaDetails}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, mamaDetails: e.target.value })}
                                                className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <select value={weddingBiodata.familyType} onChange={(e) => setWeddingBiodata({ ...weddingBiodata, familyType: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500">
                                                <option value="">Family Type</option>
                                                <option value="Joint">Joint Family</option>
                                                <option value="Nuclear">Nuclear Family</option>
                                            </select>

                                            <select value={weddingBiodata.familyStatus} onChange={(e) => setWeddingBiodata({ ...weddingBiodata, familyStatus: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500">
                                                <option value="">Family Status</option>
                                                <option value="Middle Class">Middle Class</option>
                                                <option value="Upper Middle Class">Upper Middle Class</option>
                                                <option value="Rich">Rich</option>
                                                <option value="Affluent">Affluent</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Wedding Contact Details */}
                                {weddingActiveSection === 'contact' && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center text-lg border-b pb-2">
                                            <Phone className="w-5 h-5 mr-2 text-rose-600" /> Contact Details (संपर्क)
                                        </h3>

                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="tel" placeholder="Phone Number (फ़ोन नं.)" value={weddingBiodata.phone}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, phone: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="email" placeholder="Email" value={weddingBiodata.email}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, email: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <input type="text" placeholder="Contact Person" value={weddingBiodata.contactPerson}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, contactPerson: e.target.value })}
                                                className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />

                                            <textarea placeholder="Full Address (पता)" value={weddingBiodata.address}
                                                onChange={(e) => setWeddingBiodata({ ...weddingBiodata, address: e.target.value })}
                                                rows={3}
                                                className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 resize-none" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ===== PROFESSIONAL RESUME FORMS ===== */}
                        {!isWeddingTemplate && (
                            <>
                                {/* Personal Info Section */}
                                {activeSection === 'personal' && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center"><User className="w-4 h-4 mr-2 text-teal-600" /> Personal Information</h3>

                                        {/* Photo Upload */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                                                {personalInfo.photo ? (
                                                    <img src={personalInfo.photo} className="w-full h-full object-cover" alt="Profile" />
                                                ) : (
                                                    <User className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                            <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                                                <Upload className="w-4 h-4 inline mr-2" />
                                                Upload Photo
                                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={personalInfo.fullName}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                                                className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={personalInfo.email}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone"
                                                value={personalInfo.phone}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Address / Location"
                                                value={personalInfo.address}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                                                className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                            <input
                                                type="url"
                                                placeholder="LinkedIn URL"
                                                value={personalInfo.linkedin}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                            <input
                                                type="url"
                                                placeholder="Website / Portfolio"
                                                value={personalInfo.website}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Professional Summary (2-3 sentences about yourself)"
                                            value={personalInfo.summary}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                )}

                                {/* Experience Section */}
                                {activeSection === 'experience' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900 flex items-center"><Briefcase className="w-4 h-4 mr-2 text-teal-600" /> Work Experience</h3>
                                            <button onClick={addExperience} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm font-bold flex items-center hover:bg-teal-600">
                                                <Plus className="w-4 h-4 mr-1" /> Add
                                            </button>
                                        </div>

                                        {experiences.length === 0 ? (
                                            <p className="text-gray-400 text-sm text-center py-8">No experience added yet. Click "Add" to get started.</p>
                                        ) : (
                                            experiences.map((exp, index) => (
                                                <div key={exp.id} className="p-4 bg-gray-50 rounded-xl space-y-3 relative">
                                                    <button
                                                        onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))}
                                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Company"
                                                            value={exp.company}
                                                            onChange={(e) => {
                                                                const updated = [...experiences];
                                                                updated[index].company = e.target.value;
                                                                setExperiences(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Position"
                                                            value={exp.position}
                                                            onChange={(e) => {
                                                                const updated = [...experiences];
                                                                updated[index].position = e.target.value;
                                                                setExperiences(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Start Date"
                                                            value={exp.startDate}
                                                            onChange={(e) => {
                                                                const updated = [...experiences];
                                                                updated[index].startDate = e.target.value;
                                                                setExperiences(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="End Date"
                                                            value={exp.endDate}
                                                            onChange={(e) => {
                                                                const updated = [...experiences];
                                                                updated[index].endDate = e.target.value;
                                                                setExperiences(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                            disabled={exp.current}
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 text-sm text-gray-600">
                                                        <input
                                                            type="checkbox"
                                                            checked={exp.current}
                                                            onChange={(e) => {
                                                                const updated = [...experiences];
                                                                updated[index].current = e.target.checked;
                                                                if (e.target.checked) updated[index].endDate = 'Present';
                                                                setExperiences(updated);
                                                            }}
                                                            className="rounded"
                                                        />
                                                        Currently working here
                                                    </label>
                                                    <textarea
                                                        placeholder="Job description and achievements..."
                                                        value={exp.description}
                                                        onChange={(e) => {
                                                            const updated = [...experiences];
                                                            updated[index].description = e.target.value;
                                                            setExperiences(updated);
                                                        }}
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Education Section */}
                                {activeSection === 'education' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900 flex items-center"><GraduationCap className="w-4 h-4 mr-2 text-teal-600" /> Education</h3>
                                            <button onClick={addEducation} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm font-bold flex items-center hover:bg-teal-600">
                                                <Plus className="w-4 h-4 mr-1" /> Add
                                            </button>
                                        </div>

                                        {education.length === 0 ? (
                                            <p className="text-gray-400 text-sm text-center py-8">No education added yet. Click "Add" to get started.</p>
                                        ) : (
                                            education.map((edu, index) => (
                                                <div key={edu.id} className="p-4 bg-gray-50 rounded-xl space-y-3 relative">
                                                    <button
                                                        onClick={() => setEducation(education.filter(e => e.id !== edu.id))}
                                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Institution"
                                                            value={edu.institution}
                                                            onChange={(e) => {
                                                                const updated = [...education];
                                                                updated[index].institution = e.target.value;
                                                                setEducation(updated);
                                                            }}
                                                            className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Degree (e.g., Bachelor's)"
                                                            value={edu.degree}
                                                            onChange={(e) => {
                                                                const updated = [...education];
                                                                updated[index].degree = e.target.value;
                                                                setEducation(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Field of Study"
                                                            value={edu.field}
                                                            onChange={(e) => {
                                                                const updated = [...education];
                                                                updated[index].field = e.target.value;
                                                                setEducation(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Year (e.g., 2020-2024)"
                                                            value={edu.year}
                                                            onChange={(e) => {
                                                                const updated = [...education];
                                                                updated[index].year = e.target.value;
                                                                setEducation(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="GPA (optional)"
                                                            value={edu.gpa}
                                                            onChange={(e) => {
                                                                const updated = [...education];
                                                                updated[index].gpa = e.target.value;
                                                                setEducation(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Skills Section */}
                                {activeSection === 'skills' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900 flex items-center"><Wrench className="w-4 h-4 mr-2 text-teal-600" /> Skills</h3>
                                            <button onClick={addSkill} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm font-bold flex items-center hover:bg-teal-600">
                                                <Plus className="w-4 h-4 mr-1" /> Add
                                            </button>
                                        </div>

                                        {skills.length === 0 ? (
                                            <p className="text-gray-400 text-sm text-center py-8">No skills added yet. Click "Add" to get started.</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                {skills.map((skill, index) => (
                                                    <div key={skill.id} className="p-3 bg-gray-50 rounded-xl flex items-center gap-2 relative">
                                                        <button
                                                            onClick={() => setSkills(skills.filter(s => s.id !== skill.id))}
                                                            className="absolute top-1 right-1 text-red-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                        <input
                                                            type="text"
                                                            placeholder="Skill"
                                                            value={skill.name}
                                                            onChange={(e) => {
                                                                const updated = [...skills];
                                                                updated[index].name = e.target.value;
                                                                setSkills(updated);
                                                            }}
                                                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                                                        />
                                                        <select
                                                            value={skill.level}
                                                            onChange={(e) => {
                                                                const updated = [...skills];
                                                                updated[index].level = e.target.value as Skill['level'];
                                                                setSkills(updated);
                                                            }}
                                                            className="px-2 py-1 border border-gray-200 rounded text-xs"
                                                        >
                                                            <option value="Beginner">Beginner</option>
                                                            <option value="Intermediate">Intermediate</option>
                                                            <option value="Advanced">Advanced</option>
                                                            <option value="Expert">Expert</option>
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Projects Section */}
                                {activeSection === 'projects' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900 flex items-center"><FolderOpen className="w-4 h-4 mr-2 text-teal-600" /> Projects</h3>
                                            <button onClick={addProject} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm font-bold flex items-center hover:bg-teal-600">
                                                <Plus className="w-4 h-4 mr-1" /> Add
                                            </button>
                                        </div>

                                        {projects.length === 0 ? (
                                            <p className="text-gray-400 text-sm text-center py-8">No projects added yet. Click "Add" to get started.</p>
                                        ) : (
                                            projects.map((project, index) => (
                                                <div key={project.id} className="p-4 bg-gray-50 rounded-xl space-y-3 relative">
                                                    <button
                                                        onClick={() => setProjects(projects.filter(p => p.id !== project.id))}
                                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        placeholder="Project Name"
                                                        value={project.name}
                                                        onChange={(e) => {
                                                            const updated = [...projects];
                                                            updated[index].name = e.target.value;
                                                            setProjects(updated);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                    />
                                                    <textarea
                                                        placeholder="Project description..."
                                                        value={project.description}
                                                        onChange={(e) => {
                                                            const updated = [...projects];
                                                            updated[index].description = e.target.value;
                                                            setProjects(updated);
                                                        }}
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Technologies used"
                                                            value={project.technologies}
                                                            onChange={(e) => {
                                                                const updated = [...projects];
                                                                updated[index].technologies = e.target.value;
                                                                setProjects(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                        <input
                                                            type="url"
                                                            placeholder="Project link (optional)"
                                                            value={project.link}
                                                            onChange={(e) => {
                                                                const updated = [...projects];
                                                                updated[index].link = e.target.value;
                                                                setProjects(updated);
                                                            }}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={exportToPDF}
                        disabled={isExporting}
                        className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-5 h-5" />
                        {isExporting ? 'Generating PDF...' : 'Download Resume as PDF'}
                    </button>
                </div>
            </div>

            {/* Right Panel - Preview Stage */}
            <div ref={previewContainerRef} className="flex-1 bg-neutral-100 relative overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
                <div
                    className="bg-white shadow-2xl transition-transform duration-200 ease-out will-change-transform"
                    style={{
                        transform: `scale(${scale})`,
                        width: '210mm',
                        height: '297mm',
                        minWidth: '210mm',
                        minHeight: '297mm',
                    }}
                >
                    <div className="w-full h-full relative overflow-hidden">
                        {/* Resume Content */}
                        {!isWeddingTemplate && (
                            <div
                                ref={resumeRef}
                                className="bg-white h-full"
                                style={{ width: '100%', height: '100%', padding: template === 'modern' || template === 'creative' ? '0' : '15mm', fontSize: '10pt' }}
                            >
                                {/* Modern Template */}
                                {template === 'modern' && (
                                    <div className="flex min-h-full">
                                        {/* Sidebar */}
                                        <div className="w-[35%] p-6 text-white" style={{ backgroundColor: accentColor }}>
                                            {/* Photo */}
                                            {personalInfo.photo && (
                                                <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/30">
                                                    <img src={personalInfo.photo} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            )}

                                            {/* Contact */}
                                            <div className="space-y-2 text-sm mb-6">
                                                <h3 className="font-bold uppercase text-white/80 text-xs mb-2">Contact</h3>
                                                {personalInfo.email && <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {personalInfo.email}</p>}
                                                {personalInfo.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {personalInfo.phone}</p>}
                                                {personalInfo.address && <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {personalInfo.address}</p>}
                                                {personalInfo.linkedin && <p className="flex items-center gap-2"><Linkedin className="w-3 h-3" /> LinkedIn</p>}
                                                {personalInfo.website && <p className="flex items-center gap-2"><Globe className="w-3 h-3" /> Portfolio</p>}
                                            </div>

                                            {/* Skills */}
                                            {skills.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="font-bold uppercase text-white/80 text-xs mb-3">Skills</h3>
                                                    <div className="space-y-2">
                                                        {skills.map(skill => (
                                                            <div key={skill.id}>
                                                                <p className="text-sm mb-1">{skill.name}</p>
                                                                <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-white rounded-full" style={{ width: getSkillWidth(skill.level) }} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Education */}
                                            {education.length > 0 && (
                                                <div>
                                                    <h3 className="font-bold uppercase text-white/80 text-xs mb-3">Education</h3>
                                                    <div className="space-y-3">
                                                        {education.map(edu => (
                                                            <div key={edu.id} className="text-sm">
                                                                <p className="font-bold">{edu.degree}</p>
                                                                <p className="text-white/80">{edu.institution}</p>
                                                                <p className="text-white/60 text-xs">{edu.year}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Main Content */}
                                        <div className="w-[65%] p-6">
                                            {/* Header */}
                                            <div className="mb-6 pb-4 border-b-2" style={{ borderColor: accentColor }}>
                                                <h1 className="text-3xl font-black text-gray-900">{personalInfo.fullName || 'Your Name'}</h1>
                                                {personalInfo.summary && <p className="text-gray-600 mt-2 text-sm leading-relaxed">{personalInfo.summary}</p>}
                                            </div>

                                            {/* Experience */}
                                            {experiences.length > 0 && (
                                                <div className="mb-6">
                                                    <h2 className="text-sm font-bold uppercase mb-3" style={{ color: accentColor }}>Experience</h2>
                                                    <div className="space-y-4">
                                                        {experiences.map(exp => (
                                                            <div key={exp.id}>
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-bold text-gray-900">{exp.position}</p>
                                                                        <p className="text-gray-600 text-sm">{exp.company}</p>
                                                                    </div>
                                                                    <p className="text-gray-500 text-xs">{exp.startDate} - {exp.endDate}</p>
                                                                </div>
                                                                {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Projects */}
                                            {projects.length > 0 && (
                                                <div>
                                                    <h2 className="text-sm font-bold uppercase mb-3" style={{ color: accentColor }}>Projects</h2>
                                                    <div className="space-y-3">
                                                        {projects.map(project => (
                                                            <div key={project.id}>
                                                                <p className="font-bold text-gray-900">{project.name}</p>
                                                                {project.description && <p className="text-gray-600 text-sm">{project.description}</p>}
                                                                {project.technologies && <p className="text-xs mt-1" style={{ color: accentColor }}>{project.technologies}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Classic Template */}
                                {template === 'classic' && (
                                    <div>
                                        {/* Header */}
                                        <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
                                            <h1 className="text-3xl font-bold text-gray-900">{personalInfo.fullName || 'Your Name'}</h1>
                                            <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                                                {personalInfo.email && <span>{personalInfo.email}</span>}
                                                {personalInfo.phone && <span>| {personalInfo.phone}</span>}
                                                {personalInfo.address && <span>| {personalInfo.address}</span>}
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        {personalInfo.summary && (
                                            <div className="mb-6">
                                                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-2" style={{ color: accentColor }}>Summary</h2>
                                                <p className="text-gray-700 text-sm">{personalInfo.summary}</p>
                                            </div>
                                        )}

                                        {/* Experience */}
                                        {experiences.length > 0 && (
                                            <div className="mb-6">
                                                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3" style={{ color: accentColor }}>Experience</h2>
                                                {experiences.map(exp => (
                                                    <div key={exp.id} className="mb-3">
                                                        <div className="flex justify-between">
                                                            <p className="font-bold">{exp.position}</p>
                                                            <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                                                        </div>
                                                        <p className="text-gray-600 italic">{exp.company}</p>
                                                        {exp.description && <p className="text-gray-700 text-sm mt-1">{exp.description}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Education */}
                                        {education.length > 0 && (
                                            <div className="mb-6">
                                                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3" style={{ color: accentColor }}>Education</h2>
                                                {education.map(edu => (
                                                    <div key={edu.id} className="mb-2">
                                                        <div className="flex justify-between">
                                                            <p className="font-bold">{edu.degree} in {edu.field}</p>
                                                            <p className="text-sm text-gray-500">{edu.year}</p>
                                                        </div>
                                                        <p className="text-gray-600">{edu.institution}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {skills.length > 0 && (
                                            <div className="mb-6">
                                                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-2" style={{ color: accentColor }}>Skills</h2>
                                                <p className="text-gray-700 text-sm">{skills.map(s => s.name).join(' • ')}</p>
                                            </div>
                                        )}

                                        {/* Projects */}
                                        {projects.length > 0 && (
                                            <div>
                                                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3" style={{ color: accentColor }}>Projects</h2>
                                                {projects.map(project => (
                                                    <div key={project.id} className="mb-2">
                                                        <p className="font-bold">{project.name}</p>
                                                        {project.description && <p className="text-gray-700 text-sm">{project.description}</p>}
                                                        {project.technologies && <p className="text-xs text-gray-500 mt-0.5">Tech: {project.technologies}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Creative Template */}
                                {template === 'creative' && (
                                    <div>
                                        {/* Header with accent background */}
                                        <div className="p-8 text-white" style={{ backgroundColor: accentColor }}>
                                            <div className="flex items-center gap-6">
                                                {personalInfo.photo && (
                                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30">
                                                        <img src={personalInfo.photo} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h1 className="text-4xl font-black">{personalInfo.fullName || 'Your Name'}</h1>
                                                    {personalInfo.summary && <p className="text-white/80 mt-2 max-w-lg">{personalInfo.summary}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Bar */}
                                        <div className="bg-gray-100 px-8 py-3 flex gap-6 text-sm text-gray-600 flex-wrap">
                                            {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {personalInfo.email}</span>}
                                            {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {personalInfo.phone}</span>}
                                            {personalInfo.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {personalInfo.address}</span>}
                                        </div>

                                        {/* Content */}
                                        <div className="p-8 grid grid-cols-3 gap-8">
                                            {/* Main - 2 cols */}
                                            <div className="col-span-2 space-y-6">
                                                {experiences.length > 0 && (
                                                    <div>
                                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: accentColor }}>
                                                            <Briefcase className="w-5 h-5" /> Experience
                                                        </h2>
                                                        {experiences.map(exp => (
                                                            <div key={exp.id} className="mb-4 pl-4 border-l-3" style={{ borderColor: accentColor }}>
                                                                <p className="font-bold text-gray-900">{exp.position}</p>
                                                                <p className="text-sm text-gray-500">{exp.company} • {exp.startDate} - {exp.endDate}</p>
                                                                {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {projects.length > 0 && (
                                                    <div>
                                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: accentColor }}>
                                                            <FolderOpen className="w-5 h-5" /> Projects
                                                        </h2>
                                                        {projects.map(project => (
                                                            <div key={project.id} className="mb-3">
                                                                <p className="font-bold text-gray-900">{project.name}</p>
                                                                {project.description && <p className="text-gray-600 text-sm">{project.description}</p>}
                                                                {project.technologies && (
                                                                    <div className="flex gap-1 mt-1 flex-wrap">
                                                                        {project.technologies.split(',').map((tech, i) => (
                                                                            <span key={i} className="px-2 py-0.5 text-xs rounded-full text-white" style={{ backgroundColor: accentColor }}>{tech.trim()}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sidebar - 1 col */}
                                            <div className="space-y-6">
                                                {skills.length > 0 && (
                                                    <div>
                                                        <h2 className="text-xl font-bold mb-4" style={{ color: accentColor }}>Skills</h2>
                                                        <div className="flex flex-wrap gap-2">
                                                            {skills.map(skill => (
                                                                <span key={skill.id} className="px-3 py-1 text-sm rounded-full border" style={{ borderColor: accentColor, color: accentColor }}>
                                                                    {skill.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {education.length > 0 && (
                                                    <div>
                                                        <h2 className="text-xl font-bold mb-4" style={{ color: accentColor }}>Education</h2>
                                                        {education.map(edu => (
                                                            <div key={edu.id} className="mb-2">
                                                                <p className="font-bold text-gray-900">{edu.degree}</p>
                                                                <p className="text-sm text-gray-600">{edu.institution}</p>
                                                                <p className="text-xs text-gray-500">{edu.year}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Minimal Template */}
                                {template === 'minimal' && (
                                    <div className="max-w-2xl mx-auto">
                                        {/* Name */}
                                        <h1 className="text-4xl font-light text-gray-900 mb-2">{personalInfo.fullName || 'Your Name'}</h1>

                                        {/* Contact Line */}
                                        <div className="text-sm text-gray-500 mb-6">
                                            {[personalInfo.email, personalInfo.phone, personalInfo.address].filter(Boolean).join(' | ')}
                                        </div>

                                        {/* Summary */}
                                        {personalInfo.summary && (
                                            <p className="text-gray-700 mb-8 leading-relaxed">{personalInfo.summary}</p>
                                        )}

                                        {/* Experience */}
                                        {experiences.length > 0 && (
                                            <div className="mb-8">
                                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Experience</h2>
                                                {experiences.map(exp => (
                                                    <div key={exp.id} className="mb-4">
                                                        <div className="flex justify-between items-baseline">
                                                            <p className="font-medium text-gray-900">{exp.position}, <span className="font-normal">{exp.company}</span></p>
                                                            <p className="text-sm text-gray-400">{exp.startDate} - {exp.endDate}</p>
                                                        </div>
                                                        {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Education */}
                                        {education.length > 0 && (
                                            <div className="mb-8">
                                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h2>
                                                {education.map(edu => (
                                                    <div key={edu.id} className="mb-2 flex justify-between items-baseline">
                                                        <p className="text-gray-900">{edu.degree}, {edu.institution}</p>
                                                        <p className="text-sm text-gray-400">{edu.year}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {skills.length > 0 && (
                                            <div className="mb-8">
                                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Skills</h2>
                                                <p className="text-gray-700">{skills.map(s => s.name).join(', ')}</p>
                                            </div>
                                        )}

                                        {/* Projects */}
                                        {projects.length > 0 && (
                                            <div>
                                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Projects</h2>
                                                {projects.map(project => (
                                                    <div key={project.id} className="mb-3">
                                                        <p className="font-medium text-gray-900">{project.name}</p>
                                                        {project.description && <p className="text-gray-600 text-sm">{project.description}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== WEDDING BIODATA TEMPLATES ===== */}
                        {isWeddingTemplate && (
                            <div ref={resumeRef} className="relative min-h-full" style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#fdfbf7', border: `3px solid ${accentColor}` }}>
                                {/* Decorative Top Corners */}
                                <div className="absolute top-2 left-2 w-12 h-12" style={{ borderTop: `3px solid ${accentColor}`, borderLeft: `3px solid ${accentColor}` }} />
                                <div className="absolute top-2 right-2 w-12 h-12" style={{ borderTop: `3px solid ${accentColor}`, borderRight: `3px solid ${accentColor}` }} />

                                {/* Decorative Bottom Corners */}
                                <div className="absolute bottom-2 left-2 w-12 h-12" style={{ borderBottom: `3px solid ${accentColor}`, borderLeft: `3px solid ${accentColor}` }} />
                                <div className="absolute bottom-2 right-2 w-12 h-12" style={{ borderBottom: `3px solid ${accentColor}`, borderRight: `3px solid ${accentColor}` }} />

                                {/* Header with Ganesha */}
                                <div className="text-center py-6 border-b-2" style={{ borderColor: accentColor }}>

                                    {/* Ganesha Symbol */}
                                    <div className="text-4xl mb-2" style={{ color: accentColor }}>🙏</div>
                                    <p className="font-bold text-xl" style={{ color: accentColor, fontFamily: 'serif' }}>
                                        ॥ श्री गणेशाय नमः ॥
                                    </p>
                                    <p className="text-sm font-bold mt-1" style={{ color: accentColor }}>BIODATA</p>
                                </div>

                                <div className="p-6 flex gap-6">
                                    {/* Main Content */}
                                    <div className="flex-1">
                                        {/* Personal Details */}
                                        <h2 className="font-bold text-lg mb-3 pb-1 border-b-2" style={{ color: accentColor, borderColor: accentColor }}>
                                            Personal Details
                                        </h2>
                                        <div className="grid grid-cols-[140px_auto] gap-y-1 text-sm mb-6">
                                            {weddingBiodata.fullName && <><span className="text-gray-700">Name</span><span className="font-medium">: {weddingBiodata.fullName}</span></>}
                                            {weddingBiodata.dateOfBirth && <><span className="text-gray-700">Date of Birth</span><span className="font-medium">: {new Date(weddingBiodata.dateOfBirth).toLocaleDateString('en-IN')}</span></>}
                                            {weddingBiodata.timeOfBirth && <><span className="text-gray-700">Time of Birth</span><span className="font-medium">: {weddingBiodata.timeOfBirth}</span></>}
                                            {weddingBiodata.placeOfBirth && <><span className="text-gray-700">Place of Birth</span><span className="font-medium">: {weddingBiodata.placeOfBirth}</span></>}
                                            {weddingBiodata.rashi && <><span className="text-gray-700">Rashi</span><span className="font-medium">: {weddingBiodata.rashi}</span></>}
                                            {weddingBiodata.nakshatra && <><span className="text-gray-700">Nakshatra</span><span className="font-medium">: {weddingBiodata.nakshatra}</span></>}
                                            {weddingBiodata.manglik && <><span className="text-gray-700">Manglik</span><span className="font-medium">: {weddingBiodata.manglik}</span></>}
                                            {weddingBiodata.religion && <><span className="text-gray-700">Religion</span><span className="font-medium">: {weddingBiodata.religion}</span></>}
                                            {weddingBiodata.caste && <><span className="text-gray-700">Caste</span><span className="font-medium">: {weddingBiodata.caste}</span></>}
                                            {weddingBiodata.gotra && <><span className="text-gray-700">Gotra</span><span className="font-medium">: {weddingBiodata.gotra}</span></>}
                                            {weddingBiodata.height && <><span className="text-gray-700">Height</span><span className="font-medium">: {weddingBiodata.height}</span></>}
                                            {weddingBiodata.weight && <><span className="text-gray-700">Weight</span><span className="font-medium">: {weddingBiodata.weight}</span></>}
                                            {weddingBiodata.complexion && <><span className="text-gray-700">Complexion</span><span className="font-medium">: {weddingBiodata.complexion}</span></>}
                                            {weddingBiodata.bloodGroup && <><span className="text-gray-700">Blood Group</span><span className="font-medium">: {weddingBiodata.bloodGroup}</span></>}
                                            {weddingBiodata.education && <><span className="text-gray-700">Education</span><span className="font-medium">: {weddingBiodata.education}</span></>}
                                            {weddingBiodata.occupation && <><span className="text-gray-700">Occupation</span><span className="font-medium">: {weddingBiodata.occupation}</span></>}
                                            {weddingBiodata.income && <><span className="text-gray-700">Income</span><span className="font-medium">: {weddingBiodata.income}</span></>}
                                        </div>

                                        {/* Family Details */}
                                        <h2 className="font-bold text-lg mb-3 pb-1 border-b-2" style={{ color: accentColor, borderColor: accentColor }}>
                                            Family Details
                                        </h2>
                                        <div className="grid grid-cols-[140px_auto] gap-y-1 text-sm mb-6">
                                            {weddingBiodata.fatherName && <><span className="text-gray-700">Father's Name</span><span className="font-medium">: {weddingBiodata.fatherName}</span></>}
                                            {weddingBiodata.fatherOccupation && <><span className="text-gray-700">Occupation</span><span className="font-medium">: {weddingBiodata.fatherOccupation}</span></>}
                                            {weddingBiodata.motherName && <><span className="text-gray-700">Mother's Name</span><span className="font-medium">: {weddingBiodata.motherName}</span></>}
                                            {weddingBiodata.motherOccupation && <><span className="text-gray-700">Occupation</span><span className="font-medium">: {weddingBiodata.motherOccupation}</span></>}
                                            {weddingBiodata.brothers && <><span className="text-gray-700">Brothers</span><span className="font-medium">: {weddingBiodata.brothers}</span></>}
                                            {weddingBiodata.sisters && <><span className="text-gray-700">Sisters</span><span className="font-medium">: {weddingBiodata.sisters}</span></>}
                                            {weddingBiodata.mamaDetails && <><span className="text-gray-700">Mama</span><span className="font-medium">: {weddingBiodata.mamaDetails}</span></>}
                                        </div>

                                        {/* Contact Details */}
                                        <h2 className="font-bold text-lg mb-3 pb-1 border-b-2" style={{ color: accentColor, borderColor: accentColor }}>
                                            Contact Details
                                        </h2>
                                        <div className="grid grid-cols-[140px_auto] gap-y-1 text-sm">
                                            {weddingBiodata.phone && <><span className="text-gray-700">Phone No.</span><span className="font-medium">: {weddingBiodata.phone}</span></>}
                                            {weddingBiodata.email && <><span className="text-gray-700">Email</span><span className="font-medium">: {weddingBiodata.email}</span></>}
                                            {weddingBiodata.address && <><span className="text-gray-700">Address</span><span className="font-medium">: {weddingBiodata.address}</span></>}
                                        </div>
                                    </div>

                                    {/* Photo Section */}
                                    {weddingBiodata.photo && (
                                        <div className="w-36 flex-shrink-0">
                                            <div className="w-full aspect-[3/4] border-2 overflow-hidden" style={{ borderColor: accentColor }}>
                                                <img src={weddingBiodata.photo} className="w-full h-full object-cover" alt="Profile" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

