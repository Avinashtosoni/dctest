import { Search, Share2, Target, FileText, Mail, BarChart3, Megaphone, Globe, Facebook, Instagram, Linkedin, Twitter, MessageCircle, Send, Link, Code, Zap, Image, Edit3, Monitor, PenTool, Layout, PieChart, TrendingUp, Users, Database, Server, Smartphone, Video, Camera, Mic, Shield, HelpCircle, ChevronRight, Award, Star, Plus, Minus, Wrench, CheckCircle, ArrowLeft, ArrowUpRight } from 'lucide-react';

export const servicesData = [
    {
        id: 'seo-optimization',
        icon: Search,
        title: 'SEO Optimization',
        subtitle: 'Dominate Search Results & Drive Organic Traffic',
        description: 'Rank higher on Google with our proven SEO strategies and get organic traffic.',
        longDescription: 'Our comprehensive SEO services are designed to improve your website\'s visibility and drive high-quality organic traffic. We use data-driven strategies to optimize your on-page and off-page elements, ensuring sustainable long-term growth. We don\'t just chase rankings; we chase revenue.',
        features: ['Keyword Research & Strategy', 'On-Page Optimization', 'Technical SEO', 'Link Building', 'Local SEO', 'SEO Audits'],
        impactStats: [
            { label: 'Avg. Traffic Increase', value: '300', suffix: '%' },
            { label: 'Keyword Rankings', value: '150', suffix: '+' },
            { label: 'Lead Growth', value: '3.5', suffix: 'x' }
        ],
        tools: ['Semrush', 'Ahrefs', 'Google Search Console', 'Screaming Frog', 'Moz'],
        floatingIcons: [Search, TrendingUp, Link, Globe],
        testimonials: [
            { quote: "Our organic traffic tripled in just 6 months. The ROI has been incredible.", author: "Mike Ross", role: "CMO", company: "Pearson Specter" },
            { quote: "Finally an agency that understands technical SEO. Our site speed and rankings have never been better.", author: "Rachel Zane", role: "Founder", company: "Zane Legal" }
        ],
        subServices: [
            { title: "Technical SEO Audit", desc: "A 50-point inspection of your website's code and structure." },
            { title: "Content Strategy", desc: "Topic clusters and keyword mapping to dominate your niche." },
            { title: "Link Outreach", desc: "White-hat backlink acquisition from high-authority domains." }
        ],
        process: [
            { title: 'Audit & Analysis', desc: 'We perform a deep dive into your current website performance and market position.' },
            { title: 'Strategy Development', desc: 'Customizing a roadmap to target high-value keywords and opportunities.' },
            { title: 'Optimization & Tech Fixes', desc: 'Implementing technical improvements and optimizing content for search engines.' },
            { title: 'Authority Building', desc: 'Acquiring high-quality backlinks to boost your domain authority.' },
        ],
        faqs: [
            { q: "How long does SEO take to show results?", a: "Typically, noticeable improvements can be seen within 3-6 months, but SEO is a long-term investment that compounds over time." },
            { q: "Do you guarantee #1 rankings?", a: "No ethical agency can guarantee specific rankings due to algorithm volatility, but we guarantee improving your visibility and traffic." },
            { q: "Is Local SEO included?", a: "Yes, for businesses serving specific geographic areas, we include Google Business Profile optimization and local citations." }
        ],
        color: 'bg-blue-100 text-blue-600',
        gradient: 'from-blue-500 to-cyan-500',
        blobColor: 'bg-blue-300'
    },
    {
        id: 'social-media-marketing',
        icon: Share2,
        title: 'Social Media Marketing',
        subtitle: 'Build a Community & Amplify Your Brand',
        description: 'Build your brand presence across all social platforms with engaging content.',
        longDescription: 'In today\'s digital-first world, your social media presence is often your first impression. We don\'t just post content; we build communities. Our data-driven social media strategies are designed to amplify your brand voice, engage your target audience, and drive meaningful business results across all major platforms.',
        features: ['Social Media Strategy', 'Content Creation', 'Community Management', 'Paid Social Advertising', 'Influencer Marketing', 'Analytics & Reporting'],
        impactStats: [
            { label: 'Follower Growth', value: '50', suffix: 'k+' },
            { label: 'Engagement Rate', value: '12', suffix: '%' },
            { label: 'Viral Campaigns', value: '25', suffix: '+' }
        ],
        tools: ['Buffer', 'Canva', 'Hootsuite', 'Meta Business Suite', 'TikTok Creative Center'],
        floatingIcons: [Facebook, Instagram, Linkedin, Twitter, MessageCircle],
        testimonials: [
            { quote: "Our brand voice has never been clearer. They just 'get' us.", author: "Donna Paulsen", role: "COO", company: "Specter Litt" }
        ],
        subServices: [
            { title: "Content Production", desc: "High-quality reels, posts, and stories tailored to each platform." },
            { title: "Community Management", desc: "Replying to comments and DMs to foster real relationships." },
            { title: "Influencer Outreach", desc: "Connecting your brand with voices that matter." }
        ],
        // New Enhanced Fields
        brandIcons: [
            { icon: Facebook, name: 'Facebook', color: '#1877F2', desc: 'Community Building & Ads' },
            { icon: Instagram, name: 'Instagram', color: '#E4405F', desc: 'Visual Storytelling' },
            { icon: Linkedin, name: 'LinkedIn', color: '#0A66C2', desc: 'B2B Authority' },
            { icon: Twitter, name: 'X (Twitter)', color: '#000000', desc: 'Real-time Engagement' },
            { icon: MessageCircle, name: 'TikTok', color: '#00F2EA', desc: 'Viral Video Content' }
        ],
        whyMatters: [
            { title: 'Trust & Credibility', desc: '75% of consumers use social media to research products. An inactive profile is a red flag.' },
            { title: 'Direct Access', desc: 'Speak directly to your customers without intermediaries. Get instant feedback and build loyalty.' },
            { title: 'Viral Potential', desc: 'Social media is the only channel where one piece of content can reach millions overnight for free.' }
        ],
        // New Data for Charts
        graphData: [
            { month: 'Month 1', followers: 1200, engagement: 200 },
            { month: 'Month 2', followers: 1800, engagement: 450 },
            { month: 'Month 3', followers: 3200, engagement: 980 },
            { month: 'Month 4', followers: 4500, engagement: 1500 },
            { month: 'Month 5', followers: 6800, engagement: 2800 },
            { month: 'Month 6', followers: 9500, engagement: 4200 },
        ],
        strategySteps: [
            { id: 1, title: 'Audit & Analysis', desc: 'We stress-test your current profile against 50+ data points.' },
            { id: 2, title: 'Persona Development', desc: 'Building profiles of your ideal superfans.' },
            { id: 3, title: 'Content Matrix', desc: '30 days of content planned in advance.' },
            { id: 4, title: 'Execution & Engagement', desc: 'Daily posting and real-time community management.' },
            { id: 5, title: 'Scale & Optimization', desc: 'Doubling down on what works based on data.' }
        ],
        seoContent: {
            intro: "Social media is no longer just a broadcasting channel; it's a two-way street for customer service, brand building, and sales acceleration. In 2025, algorithms favor authenticity and high-engagement video content.",
            sections: [
                {
                    title: "The ROI of Social Media",
                    content: "Many businesses struggle to measure the Return on Investment (ROI) of social media. We change that. By setting clear KPIs—whether that's Cost Per Acquisition (CPA) on Facebook Ads or organically driven traffic from LinkedIn—we ensure every post serves a purpose. Our clients typically see a 3x increase in qualified leads within the first 90 days."
                },
                {
                    title: "Platform-Specific Strategies",
                    content: "One size does not fit all. LinkedIn requires professional thought leadership, while TikTok demands raw, authentic behind-the-scenes content. We tailor your message to fit the native language of each platform, ensuring maximum reach and resonance."
                },
                {
                    title: "Community Management: The Hidden Gem",
                    content: "Posting is only half the battle. The magic happens in the comments. Our community managers actively engage with your audience, turning passive viewers into vocal brand advocates. We handle crisis management, customer support questions, and general engagement 7 days a week."
                }
            ]
        },
        caseStudies: [
            {
                title: "Scale to $1M ARR",
                client: "TechFlow SaaS",
                result: "+400% Leads",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
                tags: ["LinkedIn", "B2B"]
            },
            {
                title: "Viral Brand Launch",
                client: "Urban Wear",
                result: "2M+ Views",
                image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
                tags: ["TikTok", "Instagram"]
            },
            {
                title: "Community Growth",
                client: "EcoLife",
                result: "50k Members",
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
                tags: ["Facebook", "Community"]
            }
        ],
        process: [
            { title: 'Audience Research', desc: 'Understanding who your customers are and where they spend their time online.' },
            { title: 'Content Calendar', desc: 'Planning a month of engaging content aligned with your brand goals.' },
            { title: 'Engagement & Growth', desc: 'Actively managing comments, messages, and growing your follower base.' },
            { title: 'Performance Review', desc: 'Monthly deep-dives into engagement metrics to refine our approach.' },
        ],
        faqs: [
            { q: "Which platforms should I be on?", a: "It depends on your target audience. B2B often thrives on LinkedIn, while lifestyle brands excel on Instagram and TikTok." },
            { q: "Do you create the graphics?", a: "Yes, our team handles all creative assets including graphics, captions, and video editing." }
        ],
        color: 'bg-purple-100 text-purple-600',
        gradient: 'from-purple-500 to-pink-500',
        blobColor: 'bg-purple-300'
    },
    {
        id: 'ppc-advertising',
        icon: Target,
        title: 'PPC Advertising',
        subtitle: 'Instant Traffic & High-Converting Leads',
        description: 'Get instant results with targeted Google Ads and Facebook Ads campaigns.',
        longDescription: 'Maximize your ROI with our precision-targeted PPC campaigns. We manage your ad spend efficiently to ensure you get the best possible results from Google Ads, Facebook Ads, and more. Stop wasting budget on clicks that don\'t convert.',
        features: ['Campaign Strategy', 'Ad Copywriting', 'Landing Page Optimization', 'Bid Management', 'A/B Testing', 'Conversion Tracking'],
        impactStats: [
            { label: 'Ad ROI', value: '450', suffix: '%' },
            { label: 'New Leads', value: '500', suffix: '/mo' },
            { label: 'Cost Per Lead', value: '40', suffix: '% Less' }
        ],
        tools: ['Google Ads', 'Facebook Ads Manager', 'SpyFu', 'Unbounce', 'Google Tag Manager'],
        floatingIcons: [Target, Zap, PieChart, Users],
        testimonials: [
            { quote: "The leads started coming in day one. Best money we've spent on marketing.", author: "Harvey Specter", role: "Managing Partner", company: "Pearson Specter Litt" }
        ],
        subServices: [
            { title: "Search Ads", desc: "Capture intent when customers are ready to buy." },
            { title: "Social Ads", desc: "Generate demand with visually stunning display ads." },
            { title: "Retargeting", desc: "Bring back visitors who didn't convert the first time." }
        ],
        process: [
            { title: 'Competitor Analysis', desc: 'Analyzing what your competitors are bidding on to find gaps.' },
            { title: 'Campaign Setup', desc: 'Structuring campaigns for maximum relevance and Quality Score.' },
            { title: 'Landing Page Optimization', desc: 'Ensuring your destination pages are built to convert traffic.' },
            { title: 'Ongoing Management', desc: 'Daily adjustments to bids and negative keywords to save budget.' },
        ],
        faqs: [
            { q: "What is the minimum budget?", a: "We recommend a starting media budget of at least $1,000/month to gather enough data for meaningful optimization." },
            { q: "Do I pay Google/Facebook directly?", a: "Yes, ad spend is paid directly to the platform. Our fee covers management and optimization." }
        ],
        color: 'bg-red-100 text-red-600',
        gradient: 'from-red-500 to-orange-500',
        blobColor: 'bg-red-300'
    },
    {
        id: 'content-marketing',
        icon: FileText,
        title: 'Content Marketing',
        subtitle: 'Tell Your Story & Establish Authority',
        description: 'Create compelling content that converts visitors into loyal customers.',
        longDescription: 'Our content marketing services help you tell your brand story and establish authority in your industry. We create high-quality content that resonates with your target audience and solves their problems, positioning you as the go-to expert.',
        features: ['Content Strategy', 'Blog Writing', 'Ebooks & Whitepapers', 'Infographics', 'Video Scripts', 'Content Distribution'],
        impactStats: [
            { label: 'Read Time', value: '4.5', suffix: 'min' },
            { label: 'Traffic Growth', value: '200', suffix: '%' },
            { label: 'Articles Published', value: '500', suffix: '+' }
        ],
        tools: ['Grammarly', 'SurferSEO', 'WordPress', 'HubSpot', 'BuzzSumo'],
        floatingIcons: [FileText, PenTool, Edit3, MessageCircle],
        testimonials: [
            { quote: "The blog posts are well-researched and actually interesting to read. Huge difference.", author: "Louis Litt", role: "Partner", company: "Pearson Specter Litt" }
        ],
        subServices: [
            { title: "Blog Management", desc: "Consistent, SEO-optimized articles for your site." },
            { title: "Whitepapers", desc: "In-depth resources to capture high-value ledes." },
            { title: "Video Scripts", desc: "Engaging narratives for your YouTube or social channels." }
        ],
        process: [
            { title: 'Topic Research', desc: 'Finding questions your audience is asking.' },
            { title: 'Content Creation', desc: 'Writing high-quality, SEO-optimized articles and resources.' },
            { title: 'Distribution', desc: 'Promoting content via email, social media, and partners.' },
            { title: 'Lead Nurturing', desc: 'Using content to move prospects down the sales funnel.' },
        ],
        faqs: [
            { q: "How often do you post?", a: "We typically recommend 2-4 high-quality blog posts per month, but this varies by strategy." }
        ],
        color: 'bg-green-100 text-green-600',
        gradient: 'from-green-500 to-emerald-500',
        blobColor: 'bg-green-300'
    },
    {
        id: 'email-marketing',
        icon: Mail,
        title: 'Email Marketing',
        subtitle: 'Direct Communication that Drives Sales',
        description: 'Nurture leads and boost sales with personalized email campaigns.',
        longDescription: 'Stay top-of-mind with your customers through personalized email marketing automation. We design and execute campaigns that drive engagement and retention, turning one-time buyers into lifelong customers.',
        features: ['Email Strategy', 'List Building', 'Newsletter Design', 'Automated Flows', 'A/B Testing', 'Performance Tracking'],
        impactStats: [
            { label: 'Open Rate', value: '45', suffix: '%' },
            { label: 'Click Rate', value: '8.5', suffix: '%' },
            { label: 'Revenue/Email', value: '2500', suffix: '$' }
        ],
        tools: ['Klaviyo', 'Mailchimp', 'ActiveCampaign', 'Litmus', 'Figma'],
        floatingIcons: [Mail, Send, Users, Zap],
        testimonials: [
            { quote: "Their automated flows generate 30% of our revenue while we sleep.", author: "Jessica Pearson", role: "Managing Partner", company: "Pearson Specter" }
        ],
        subServices: [
            { title: "Flow Automation", desc: "Welcome series, abandoned cart, and post-purchase flows." },
            { title: "Newsletter Campaigns", desc: "Regular updates to keep your audience engaged." },
            { title: "List Cleaning", desc: "Ensuring your emails actually land in the inbox." }
        ],
        process: [
            { title: 'List Segmentation', desc: 'Grouping your audience to send hyper-relevant messages.' },
            { title: 'Automation Setup', desc: 'Creating welcome series, abandoned cart flows, and more.' },
            { title: 'Campaign Design', desc: 'Designing beautiful, mobile-responsive email templates.' },
            { title: 'Testing & optimization', desc: 'Testing subject lines and send times.' },
        ],
        faqs: [
            { q: "What platform do you use?", a: "We are experts in Klaviyo, Mailchimp, HubSpot, and ActiveCampaign." }
        ],
        color: 'bg-yellow-100 text-yellow-600',
        gradient: 'from-yellow-400 to-orange-500',
        blobColor: 'bg-yellow-300'
    },
    {
        id: 'analytics-reporting',
        icon: BarChart3,
        title: 'Analytics & Reporting',
        subtitle: 'Data-Driven Decisions for Growth',
        description: 'Track your success with detailed reports and actionable insights.',
        longDescription: 'Make informed decisions with our in-depth analytics and reporting services. We monitor your KPIs and provide actionable insights to improve your marketing performance, removing the guesswork from growth.',
        features: ['Google Analytics Setup', 'Custom Dashboards', 'Conversion Tracking', 'User Behavior Analysis', 'Monthly Reporting', 'Strategy Recommendations'],
        impactStats: [
            { label: 'Data Accuracy', value: '99.9', suffix: '%' },
            { label: 'Insights Generated', value: '200', suffix: '+' },
            { label: 'Time Saved', value: '40', suffix: 'hrs/mo' }
        ],
        tools: ['Google Analytics 4', 'Looker Studio', 'Mixpanel', 'Hotjar', 'Supermetrics'],
        floatingIcons: [BarChart3, PieChart, TrendingUp, Search],
        testimonials: [
            { quote: "Finally, reports that actually make sense and tell us what to do next.", author: "Katrina Bennett", role: "Senior Partner", company: "Randall & Associates" }
        ],
        subServices: [
            { title: "Dashboard Creation", desc: "Live, 24/7 views of your most critical metrics." },
            { title: "Conversion Setup", desc: "Tracking every click, form fill, and purchase accurately." },
            { title: "Deep-Dive Analysis", desc: "Quarterly reviews to find hidden opportunities." }
        ],
        process: [
            { title: 'Goal Setting', desc: 'Defining what "success" looks like for your business.' },
            { title: 'Tracking Setup', desc: 'Implementing pixel and event tracking.' },
            { title: 'Dashboard Creation', desc: 'Building custom views for your team.' },
            { title: 'Insight Analysis', desc: 'Turning raw numbers into business recommendations.' },
        ],
        faqs: [
            { q: "How often do I get reports?", a: "We provide monthly comprehensive PDF reports and provide 24/7 access to a live dashboard." }
        ],
        color: 'bg-teal-100 text-teal-600',
        gradient: 'from-teal-400 to-cyan-500',
        blobColor: 'bg-teal-300'
    },
    {
        id: 'brand-strategy',
        icon: Megaphone,
        title: 'Brand Strategy',
        subtitle: 'Stand Out in a Crowded Market',
        description: 'Build a powerful brand identity that resonates with your audience.',
        longDescription: 'Differentiate your business with a strong brand identity. We help you define your voice, values, and visual identity to connect meaningfully with your customers and build lasting equity.',
        features: ['Brand Positioning', 'Visual Identity Design', 'Voice & Tone Guidelines', 'Competitor Analysis', 'Rebranding', 'Brand Messaging'],
        impactStats: [
            { label: 'Brand Recall', value: '85', suffix: '%' },
            { label: 'Customer Loyalty', value: '2.5', suffix: 'x' },
            { label: 'Market Share', value: '15', suffix: '%+' }
        ],
        tools: ['Adobe Creative Cloud', 'Figma', 'Miro', 'Typeform', 'Brand24'],
        floatingIcons: [Megaphone, Layout, PenTool, Image],
        testimonials: [
            { quote: "They took our messy ideas and turned them into a world-class brand identity.", author: "Robert Zane", role: "Managing Partner", company: "Zane Specter" }
        ],
        subServices: [
            { title: "Identity Design", desc: "Logo, color palette, and typography systems." },
            { title: "Brand Voice", desc: "Defining how your brand speaks to the world." },
            { title: "Brand Guidelines", desc: "A comprehensive manual to ensure consistency everywhere." }
        ],
        process: [
            { title: 'Discovery Workshop', desc: 'Uncovering your core values and mission.' },
            { title: 'Market Positioning', desc: 'Identifying your unique space in the market.' },
            { title: 'Visual Identity', desc: 'Designing your logo, colors, and typography.' },
            { title: 'Brand Guidelines', desc: 'Creating the rulebook for your brand.' },
        ],
        faqs: [
            { q: "Is this just a logo design?", a: "No, branding includes your strategy, voice, messaging, and visual system." }
        ],
        color: 'bg-orange-100 text-orange-600',
        gradient: 'from-orange-500 to-red-500',
        blobColor: 'bg-orange-300'
    },
    {
        id: 'web-development',
        icon: Globe,
        title: 'Web Development',
        subtitle: 'High-Performance Websites that Convert',
        description: 'Create stunning, conversion-optimized websites that drive results.',
        longDescription: 'Your website is your digital storefront. We build responsive, fast, and SEO-friendly websites that look great and convert visitors into customers, built on modern scalable tech stacks.',
        features: ['Custom Website Design', 'E-commerce Development', 'CMS Integration', 'Mobile Optimization', 'Website Maintenance', 'Speed Optimization'],
        impactStats: [
            { label: 'Load Time', value: '0.8', suffix: 's' },
            { label: 'Conversion Rate', value: '5.2', suffix: '%' },
            { label: 'Uptime', value: '99.99', suffix: '%' }
        ],
        tools: ['React', 'Next.js', 'Tailwind CSS', 'WordPress', 'Shopify', 'Vercel'],
        floatingIcons: [Code, Database, Server, Smartphone, Monitor],
        testimonials: [
            { quote: "Our new site is lightning fast and our conversion rate doubled overnight.", author: "Alex Williams", role: "CTO", company: "TechStart Inc" }
        ],
        subServices: [
            { title: "Custom Development", desc: "Bespoke web apps built with React and Next.js." },
            { title: "E-Commerce", desc: "High-converting Shopify and WooCommerce stores." },
            { title: "Maintenance", desc: "24/7 security monitoring and updates." }
        ],
        process: [
            { title: 'Wireframing', desc: 'Planning the structure and user flow.' },
            { title: 'UI Design', desc: 'Creating high-fidelity visuals.' },
            { title: 'Development', desc: 'Coding your site with modern tech.' },
            { title: 'Launch', desc: 'Testing, deploying, and training your team.' },
        ],
        faqs: [
            { q: "What platform do you build on?", a: "We specialize in WordPress, Shopify, and custom React/Next.js builds depending on your needs." }
        ],
        color: 'bg-cyan-100 text-cyan-600',
        gradient: 'from-cyan-500 to-blue-600',
        blobColor: 'bg-cyan-300'
    }
];
