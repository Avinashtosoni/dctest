import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function LegalPage() {
    const { pathname } = useLocation();
    const type = pathname.includes('privacy') ? 'privacy' : 'terms';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const content = {
        privacy: {
            title: 'Privacy Policy',
            lastUpdated: 'December 13, 2024',
            sections: [
                {
                    heading: '1. Information We Collect',
                    body: 'We collect information you provide directly to us, such as when you fill out a form, request a quote, or communicate with us. This may include your name, email address, phone number, and company details.'
                },
                {
                    heading: '2. How We Use Your Information',
                    body: 'We use the information we collect to provide, maintain, and improve our services, to respond to your comments and questions, and to send you related information, including invoices, technical notices, and support messages.'
                },
                {
                    heading: '3. Data Security',
                    body: 'We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.'
                }
            ]
        },
        terms: {
            title: 'Terms of Service',
            lastUpdated: 'December 13, 2024',
            sections: [
                {
                    heading: '1. Acceptance of Terms',
                    body: 'By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services.'
                },
                {
                    heading: '2. Services',
                    body: 'Digital Comrade provides digital marketing services including but not limited to SEO, social media marketing, and web development. Specific deliverables are outlined in your service agreement.'
                },
                {
                    heading: '3. Intellectual Property',
                    body: 'Unless otherwise agreed, all materials produced during the course of the project remain the property of Digital Comrade until full payment is received.'
                }
            ]
        }
    };

    const currentContent = type === 'privacy' ? content.privacy : content.terms;

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{currentContent.title}</h1>
                <p className="text-gray-500 mb-12 text-sm">Last Updated: {currentContent.lastUpdated}</p>

                <div className="prose prose-blue max-w-none space-y-8">
                    {currentContent.sections.map((section, index) => (
                        <div key={index}>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{section.heading}</h2>
                            <p className="text-gray-600 leading-relaxed">{section.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
