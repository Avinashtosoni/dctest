

import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Linkedin, Twitter, Mail, Github, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import SEO from './SEO';


interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    image: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    github?: string | null;
    email?: string | null;
}

export default function TeamDetail() {
    const { id } = useParams<{ id: string }>();
    const [member, setMember] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetchTeamMember();
    }, [id]);

    const fetchTeamMember = async () => {
        if (!id) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('id', id)
                .eq('visible', true)
                .single();

            if (error || !data) {
                setNotFound(true);
            } else {
                setMember(data);
            }
        } catch (error) {
            console.error('Error fetching team member:', error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (notFound || !member) {
        return <Navigate to="/about" replace />;
    }

    return (
        <div className="bg-white min-h-screen">
            <SEO
                title={`${member.name} - ${member.role} | Digital Comrade`}
                description={`Meet ${member.name}, our ${member.role} at Digital Comrade. ${member.bio?.substring(0, 150) || ''}...`}
            />

            {/* Back Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link to="/about" className="inline-flex items-center text-gray-500 hover:text-[#01478c] transition-colors font-medium">
                    <ArrowLeft size={20} className="mr-2" /> Back to Team
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="grid md:grid-cols-12 gap-0">

                        {/* Image Section */}
                        <div className="md:col-span-5 relative h-96 md:h-auto">
                            <img
                                src={member.image}
                                alt={member.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#01478c]/80 to-transparent md:hidden"></div>
                            <div className="absolute bottom-0 left-0 p-8 md:hidden text-white">
                                <h1 className="text-3xl font-bold mb-1">{member.name}</h1>
                                <p className="text-blue-100 font-medium opacity-90">{member.role}</p>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="md:col-span-7 p-8 md:p-12 lg:p-16">
                            <div className="hidden md:block mb-8">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">{member.name}</h1>
                                <p className="text-xl text-[#01478c] font-medium">{member.role}</p>
                            </div>

                            <div className="mb-10">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-100 pb-2">About</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {member.bio || 'No bio available.'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-100 pb-2">Connect</h3>
                                <div className="flex space-x-4">
                                    {member.linkedin && (
                                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#0077b5] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                                            <Linkedin size={22} />
                                        </a>
                                    )}
                                    {member.twitter && (
                                        <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#1DA1F2] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                                            <Twitter size={22} />
                                        </a>
                                    )}
                                    {member.github && (
                                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                                            <Github size={22} />
                                        </a>
                                    )}
                                    {member.email && (
                                        <a href={`mailto:${member.email}`} className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                                            <Mail size={22} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
