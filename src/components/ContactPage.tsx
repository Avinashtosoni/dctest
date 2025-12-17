import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';
import { showFormSuccessMessage, showFormErrorMessage } from '../lib/formHelpers';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('form_submissions')
                .insert([{
                    form_type: 'contact',
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    status: 'new'
                }]);

            if (error) throw error;

            await showFormSuccessMessage('contact form');

            // Reset form
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                subject: 'General Inquiry',
                message: ''
            });
        } catch (error: any) {
            await showFormErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-0 pb-16 overflow-hidden">
            <SEO
                title="Contact Us"
                description="Get in touch with Digital Comrade for a free consultation. Offices in Muzaffarpur, Bihar."
            />
            {/* Hero */}
            <div className="relative bg-gray-900 text-white py-20 mb-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in-up">Get In Touch</h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto fade-in-up delay-100 font-light">
                        Ready to take your digital presence to the next level? We're here to help.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16">

                    {/* Contact Info */}
                    <div className="space-y-12 fade-in-up delay-200">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                            <p className="text-gray-600 text-lg mb-8">
                                Have a question or want to discuss a project? Reach out to us via phone, email, or visit our office.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-blue-100 text-[#01478c] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-bold text-gray-900 text-lg">Our Office</h3>
                                        <p className="text-gray-600">Ma Gayatri Nagar, Bhagwanpur,<br />Muzaffarpur Bihar 842001</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-blue-100 text-[#01478c] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <Phone size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-bold text-gray-900 text-lg">Phone</h3>
                                        <p className="text-gray-600">+91 7654807244</p>
                                        <p className="text-gray-500 text-sm">Mon-Fri from 8am to 5pm.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-blue-100 text-[#01478c] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <Mail size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-bold text-gray-900 text-lg">Email</h3>
                                        <p className="text-gray-600">info@digitalcomrade.in</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Location */}
                        <div className="bg-gray-200 w-full h-80 rounded-2xl overflow-hidden shadow-inner relative">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14348.673894860228!2d85.3905541!3d26.1264374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed10e8a3191317%3A0xc3cb10900985293c!2sBhagwanpur%2C%20Muzaffarpur%2C%20Bihar%20842001!5e0!3m2!1sen!2sin!4v1703248325605!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Digital Comrade Office Location"
                            ></iframe>
                            <a
                                href="https://maps.app.goo.gl/JMcUWNtCR5AqRcH47"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg font-bold text-[#01478c] text-sm hover:bg-[#01478c] hover:text-white transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                Open in Google Maps
                            </a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 fade-in-up delay-300">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">First Name *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#01478c]"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Last Name *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#01478c]"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#01478c]"
                                    placeholder="john@company.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Subject *</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#01478c]"
                                >
                                    <option>General Inquiry</option>
                                    <option>Request a Quote</option>
                                    <option>Partnership</option>
                                    <option>Careers</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Message *</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#01478c]"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#ff6b35] text-white py-4 rounded-lg font-bold hover:bg-[#e55a2b] transition-all hover-grow flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={20} className="ml-2" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
