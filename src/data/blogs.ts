import { Search, Share2, Target, Mail, Megaphone, Globe, CheckCircle, BarChart2, PieChart, TrendingUp } from 'lucide-react';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  category: string;
  icon: any;
  color: string;
  bgColor: string;
  tableOfContents: { title: string; id: string }[];
}

export const blogs: BlogPost[] = [
  {
    id: 'future-of-seo-2025',
    title: 'The Future of SEO in 2025: Beyond Keywords and Backlinks',
    excerpt: 'The SEO landscape is undergoing a seismic shift. From AI-driven Search Generative Experience (SGE) to the dominance of E-E-A-T, discover the 7 key trends that will define search in 2025.',
    tableOfContents: [
      { title: 'The Death of Old SEO', id: 'intro' },
      { title: 'The Rise of SGE', id: 'sge' },
      { title: 'E-E-A-T & Authority', id: 'eeat' },
      { title: 'Visual Search Takeover', id: 'visual' },
      { title: 'UX as a Ranking Factor', id: 'ux' },
      { title: 'Voice Search & NLP', id: 'voice' },
      { title: 'Technical SEO', id: 'technical' },
      { title: 'Conclusion', id: 'conclusion' }
    ],
    content: `
      <h2 id="intro">Introduction: The Death of "Old SEO"</h2>
      <p>If you are still optimizing for "10 blue links," you are already behind. The world of Search Engine Optimization (SEO) is facing its most significant transformation since the invention of the PageRank algorithm. As we approach 2025, the convergence of Artificial Intelligence, voice search, and hyper-personalized user experiences is rewriting the rulebook.</p>
      <p>For over a decade, SEOs have focused on technical checklists: keyword density, backlink quantity, and meta tags. While these fundamentals haven't disappeared, they have been relegated to "table stakes." The new frontier is <strong>Semantic Authority</strong> and <strong>User Satisfaction</strong>.</p>
      
      <div class="bg-blue-50 p-6 rounded-xl border border-blue-100 my-8">
        <h4 class="text-blue-900 font-bold text-lg mb-2">Key Statistics for 2025</h4>
        <ul class="space-y-2">
            <li class="flex items-start"><span class="text-blue-600 mr-2">✓</span> <strong>84%</strong> of searches now result in zero clicks due to AI snippets.</li>
            <li class="flex items-start"><span class="text-blue-600 mr-2">✓</span> <strong>50%</strong> of Gen Z prefers TikTok/Instagram over Google for search.</li>
            <li class="flex items-start"><span class="text-blue-600 mr-2">✓</span> Voice commerce is expected to hit <strong>$80 Billion</strong> by 2025.</li>
        </ul>
      </div>

      <h2 id="sge">1. The Rise of Search Generative Experience (SGE)</h2>
      <p>Google's integration of generative AI into search results—known as SGE—is the biggest disruptor. Instead of directing users to websites immediately, Google is now answering queries directly on the search results page (SERP) with AI-synthesized summaries.</p>
      
      <h3 class="text-xl font-bold mt-6 mb-3">Impact on Click-Through Rates (CTR)</h3>
      <p>The traditional funnel is breaking. Users are getting answers without leaving Google. This means traffic volume may drop, but <em>intent</em> will increase.</p>

      <!-- CSS Bar Chart -->
      <div class="my-8 p-6 bg-gray-50 rounded-xl">
        <h4 class="text-center font-bold mb-6">projected CTR Decline by Position (2023 vs 2025)</h4>
        <div class="space-y-4">
            <div>
                <div class="flex justify-between text-xs mb-1"><span>Position 1</span><span>-20% Drop</span></div>
                <div class="w-full bg-gray-200 rounded-full h-4">
                    <div class="bg-blue-600 h-4 rounded-full" style="width: 60%"></div>
                </div>
            </div>
             <div>
                <div class="flex justify-between text-xs mb-1"><span>Position 2</span><span>-35% Drop</span></div>
                <div class="w-full bg-gray-200 rounded-full h-4">
                    <div class="bg-blue-500 h-4 rounded-full" style="width: 45%"></div>
                </div>
            </div>
             <div>
                <div class="flex justify-between text-xs mb-1"><span>Position 3</span><span>-50% Drop</span></div>
                <div class="w-full bg-gray-200 rounded-full h-4">
                    <div class="bg-blue-400 h-4 rounded-full" style="width: 30%"></div>
                </div>
            </div>
        </div>
        <p class="text-xs text-center mt-4 text-gray-500">Source: Industry Projections</p>
      </div>

      <h2 id="eeat">2. E-E-A-T Is No Longer Optional</h2>
      <p>Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) has evolved from a guideline to a core ranking signal. In a world flooded with AI-generated content, Google is desperate for signals of humanity.</p>
      
      <table class="w-full border-collapse border border-gray-200 my-8 text-sm">
        <thead class="bg-gray-100">
            <tr>
                <th class="border border-gray-200 p-3 text-left">Factor</th>
                <th class="border border-gray-200 p-3 text-left">Description</th>
                <th class="border border-gray-200 p-3 text-left">How to Optimize</th>
            </tr>
        </thead>
        <tbody>
             <tr>
                <td class="border border-gray-200 p-3 font-bold">Experience</td>
                <td class="border border-gray-200 p-3">First-hand usage of product/topic.</td>
                <td class="border border-gray-200 p-3">Use "I implemented this..." or share case studies.</td>
            </tr>
             <tr>
                <td class="border border-gray-200 p-3 font-bold">Expertise</td>
                <td class="border border-gray-200 p-3">Formal knowledge or credentials.</td>
                <td class="border border-gray-200 p-3">Display author bios, degrees, and certifications.</td>
            </tr>
            <tr>
                <td class="border border-gray-200 p-3 font-bold">Authority</td>
                <td class="border border-gray-200 p-3">Reputation in the industry.</td>
                <td class="border border-gray-200 p-3">Get cited by other reputable sites (Backlinks).</td>
            </tr>
        </tbody>
      </table>

      <h2 id="visual">3. The Video and Visual Search Takeover</h2>
      <p>Gen Z does not "Google" everything. They search on TikTok, Instagram, and Pinterest. In 2025, a robust SEO strategy is a <strong>multi-modal</strong> strategy.</p>
      <p>Google is increasingly indexing TikTok videos and Instagram Reels in SERPs. If your brand doesn't have a video presense, you are invisible to 40% of the younger demographic.</p>

      <h2 id="ux">4. User Experience (UX) as a Ranking Factor</h2>
      <p>Core Web Vitals are now a mature ranking signal. But in 2025, UX goes beyond load speed. It's about <strong>Information Gain</strong> and <strong>Frustration-Free Browsing</strong>.</p>
      <p>Google's "Helpful Content System" actively punishes sites that provide a poor experience—intrusive pop-ups, confusing navigation, or "fluff" content that forces users to scroll endlessly to find the answer.</p>

      <h2 id="voice">5. Voice Search and Natural Language Processing (NLP)</h2>
      <p>With the proliferation of smart speakers and improved voice assistants (like ChatGPT Voice), the way we search is becoming more conversational. Keywords are out; questions are in.</p>
      <p>Users don't search for "weather NY." They ask, "Should I bring an umbrella to Central Park today?"</p>

      <h2 id="technical">6. Technical SEO: The Foundation Remains</h2>
      <p>While content is king, technical SEO is the castle walls. If Google's spiders cannot crawl your site efficiently, your amazing content will never be seen.</p>

      <h2 id="conclusion">Conclusion: Adapt or Die</h2>
      <p>The SEO landscape of 2025 is unforgiving to those who refuse to adapt. The days of gaming the system are over. The algorithm is now smart enough to detect quality, relevance, and expertise.</p>
    `,
    author: 'Sarah Johnson',
    role: 'CEO & Founder',
    date: 'Dec 12, 2025',
    readTime: '15 min read',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['SEO', 'Digital Trends', 'AI', 'Voice Search'],
    category: 'SEO',
    icon: Search,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'social-media-roi',
    title: 'Measuring Social Media ROI: Metrics That Matter',
    excerpt: 'Stop chasing vanity metrics. Learn how to track the numbers that actually impact your bottom line: Conversions, CAC, and LTV.',
    tableOfContents: [
      { title: 'Vanity vs. Sanity', id: 'intro' },
      { title: 'The ROI Formula', id: 'formula' },
      { title: 'Key Metrics defined', id: 'metrics' },
      { title: 'Attribution Models', id: 'attribution' },
      { title: 'Tools of the Trade', id: 'tools' },
      { title: 'Case Study', id: 'case-study' }
    ],
    content: `
      <h2 id="intro">Vanity vs. Sanity Metrics</h2>
      <p>Likes and shares feel good, but they don't pay the bills. In the boardroom, your CMO doesn't care about "Engagement Rate" as much as they care about <strong>Revenue Attributed</strong>. If you want to prove the value of social media to stakeholders, you need to speak the language of business: <strong>Return on Investment (ROI)</strong>.</p>
      
      <div class="flex items-center justify-center my-8">
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-2xl shadow-xl text-center max-w-lg">
            <h3 class="text-2xl font-bold mb-2">The Golden Rule</h3>
            <p class="font-medium">"If you can't measure it, you can't manage it."</p>
        </div>
      </div>

      <h2 id="formula">The ROI Formula</h2>
      <p>Calculating ROI is deceivingly simple, yet many marketers get it wrong. The core formula is:</p>
      
      <div class="bg-gray-100 p-6 rounded-lg text-center font-mono text-lg border border-gray-300 my-6">
        (Profit from Social - Cost of Social) / Cost of Social x 100
      </div>

      <p>The variable that trips everyone up is <strong>Cost of Social</strong>. This isn't just your ad spend. It includes:</p>
      <ul class="list-disc pl-6 space-y-2 mb-6">
        <li>Agency fees or salaries.</li>
        <li>Content creation costs (video production, design).</li>
        <li>Software subscriptions (Sprout Social, Buffer).</li>
        <li>Ad Spend.</li>
      </ul>

      <h2 id="metrics">Key Metrics Defined</h2>
      
      <div class="grid md:grid-cols-3 gap-4 my-8">
        <div class="bg-white p-4 rounded-lg shadow border border-gray-100 text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">CAC</div>
            <div class="text-sm font-bold text-gray-800">Customer Acquisition Cost</div>
            <p class="text-xs text-gray-500 mt-2">Total Spend / New Customers</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border border-gray-100 text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">LTV</div>
            <div class="text-sm font-bold text-gray-800">Lifetime Value</div>
            <p class="text-xs text-gray-500 mt-2">Avg Purchase x Frequency x Lifespan</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border border-gray-100 text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">CR</div>
            <div class="text-sm font-bold text-gray-800">Conversion Rate</div>
            <p class="text-xs text-gray-500 mt-2">Conversions / Clicks x 100</p>
        </div>
      </div>

      <h2 id="attribution">Attribution Models</h2>
      <p>The biggest challenge is attribution. Did they buy because of the Facebook ad or the email they got later? Using tools like <strong>Google Analytics 4 (GA4)</strong> and UTM parameters is essential to untangle the user journey.</p>
      
      <h3 class="text-lg font-bold">Common Models:</h3>
      <ol class="list-decimal pl-6 space-y-2 mb-6">
        <li><strong>Last Click:</strong> 100% credit goes to the last touchpoint. (Easiest, but inaccurate).</li>
        <li><strong>First Click:</strong> 100% credit goes to how they found you. (Good for awareness campaigns).</li>
        <li><strong>Data-Driven:</strong> GA4 uses AI to distribute credit across the entire journey. (Most accurate).</li>
      </ol>

      <h2 id="case-study">Case Study: eCommerce Brand</h2>
      <p>Let's look at a real-world example. Brand X spent $10,000 on Instagram Ads. They generated $35,000 in revenue directly attributed to those ads.</p>
      <p><strong>Net Profit:</strong> $25,000</p>
      <p><strong>ROI:</strong> 250%</p>
      <p>This simple math allows you to ask for more budget. "For every $1 you give me, I give you back $2.50. How many dollars do you want to give me?"</p>
    `,
    author: 'Michael Chen',
    role: 'Head of Strategy',
    date: 'Dec 10, 2025',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Social Media', 'Analytics', 'Growth'],
    category: 'Social Media',
    icon: Share2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 'ai-digital-marketing',
    title: 'How AI is Reshaping Paid Advertising (PPC)',
    excerpt: 'From automated bidding to generative ad copy, AI is making PPC smarter. Here is how to leverage machine learning for lower CPA.',
    tableOfContents: [
      { title: 'The Automation Era', id: 'automation' },
      { title: 'Smart Bidding Explained', id: 'bidding' },
      { title: 'Generative Creative', id: 'creative' },
      { title: 'Predictive Audiences', id: 'audiences' },
      { title: 'The Human Role', id: 'human' }
    ],
    content: `
      <h2 id="automation">The Automation Revolution</h2>
      <p>Artificial Intelligence is no longer a buzzword in PPC; it's the engine. Platforms like Google Ads (Performance Max) and Meta (Advantage+) are moving towards "black box" automation where algorithms make real-time bidding decisions.</p>
      
      <div class="bg-red-50 p-6 border-l-4 border-red-500 my-6 italic">
        "Automation is not about replacing the marketer. It's about replacing the mundane tasks so the marketer can focus on strategy."
      </div>
      
      <h2 id="bidding">1. Smart Bidding</h2>
      <p>Manual bidding is effectively dead. AI analyzes millions of signals—time of day, device, user location, browsing history—to adjust bids in milliseconds. Your job is to feed the AI correct data (conversions).</p>
      
      <h3 class="font-bold mt-4">Types of Smart Bidding:</h3>
      <ul class="space-y-2 mt-2">
        <li><strong>tCPA (Target Cost Per Acquisition):</strong> You tell Google "I want leads for $50," and it finds them.</li>
        <li><strong>tROAS (Target Return on Ad Spend):</strong> "I want 4x return," and it optimizes for valuable transactions.</li>
      </ul>

      <h2 id="creative">2. Generative Creative</h2>
      <p>Tools are now capable of generating hundreds of ad variations—headlines, descriptions, and even images—to test what resonates best. This allows for rapid A/B testing at scale.</p>
      
      <!-- Comparison Table -->
      <table class="w-full border my-8 text-sm">
        <thead>
            <tr class="bg-gray-800 text-white">
                <th class="p-3">Feature</th>
                <th class="p-3">Traditional PPC</th>
                <th class="p-3">AI-Driven PPC</th>
            </tr>
        </thead>
        <tbody>
            <tr class="border-b">
                <td class="p-3 font-bold">Copywriting</td>
                <td class="p-3">Manual writing</td>
                <td class="p-3">Generative AI (thousands of variations)</td>
            </tr>
            <tr class="border-b">
                <td class="p-3 font-bold">Audience</td>
                <td class="p-3">Manual Targeting</td>
                <td class="p-3">Predictive Lookalikes</td>
            </tr>
             <tr class="border-b">
                <td class="p-3 font-bold">Optimization</td>
                <td class="p-3">Weekly reviews</td>
                <td class="p-3">Real-time (ms)</td>
            </tr>
        </tbody>
      </table>

      <h2 id="audiences">3. Predictive Audiences</h2>
      <p>Instead of targeting "Men, 25-34, Likes Sports," AI analyzes historical conversion data to predict who is *likely* to convert next, even if they don't match your traditional profile.</p>

      <h2 id="human">The Human Element</h2>
      <p>Does this mean media buyers are obsolete? No. The role has shifted from "lever puller" to "strategy architect". You need to guide the AI, set the guardrails, and interpret the data.</p>
    `,
    author: 'David Kim',
    role: 'PPC Lead',
    date: 'Dec 08, 2025',
    readTime: '14 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['PPC', 'AI', 'Advertising'],
    category: 'PPC',
    icon: Target,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    id: 'email-marketing-automation',
    title: 'The Power of Email Automation: Engage & Retain',
    excerpt: 'Email is still the king of ROI. Learn how to set up automated flows that nurture leads and generate revenue 24/7.',
    tableOfContents: [
      { title: 'ROI King', id: 'roi' },
      { title: 'The Welcome Series', id: 'welcome' },
      { title: 'Abandoned Cart', id: 'cart' },
      { title: 'Post-Purchase', id: 'post-purchase' },
      { title: 'Segmentation', id: 'segmentation' }
    ],
    content: `
      <h2 id="roi">Why Email?</h2>
      <p>With an average ROI of $36 for every $1 spent, email marketing remains the most profitable channel. But sending manual newsletters isn't enough. You need <strong>Automation</strong>.</p>
      
      <div class="p-6 bg-yellow-50 rounded-xl my-6">
        <h4 class="font-bold text-yellow-800 mb-2">Did You Know?</h4>
        <p class="text-sm text-yellow-900">Automated emails generate <strong>320% more revenue</strong> than non-automated emails.</p>
      </div>

      <h2 id="welcome">1. The Welcome Series</h2>
      <p>This is your first date. Introduce your brand, set expectations, and offer a first-purchase incentive. Open rates here are often 50%+. Do not waste this real estate.</p>

      <h2 id="cart">2. Abandoned Cart</h2>
      <p>The average cart abandonment rate is 70%. Imagine recovering just 10% of that revenue. A simple 3-email sequence can do exactly that.</p>
      
      <div class="my-6 space-y-2">
        <div class="flex items-center p-3 bg-white shadow rounded border-l-4 border-yellow-500">
            <Mail size={20} class="text-yellow-500 mr-3" />
            <div>
                <strong>Email 1 (1 hour later):</strong> "Did you forget something?" (Service focus)
            </div>
        </div>
        <div class="flex items-center p-3 bg-white shadow rounded border-l-4 border-yellow-500">
            <Mail size={20} class="text-yellow-500 mr-3" />
            <div>
                <strong>Email 2 (24 hours later):</strong> "Still thinking about it?" (Social Proof)
            </div>
        </div>
        <div class="flex items-center p-3 bg-white shadow rounded border-l-4 border-yellow-500">
             <Mail size={20} class="text-yellow-500 mr-3" />
            <div>
                <strong>Email 3 (48 hours later):</strong> "Last chance for 10% off." (Urgency)
            </div>
        </div>
      </div>

      <h2 id="post-purchase">3. Post-Purchase</h2>
      <p>Turn buyers into loyalists. Ask for reviews, suggest related products, and say thank you. The sale is the beginning of the relationship, not the end.</p>

      <h2 id="segmentation">Personalization at Scale</h2>
      <p>Automation allows you to send the right message to the right person at the right time. Use segmentation (e.g., "Non-buyers", "VIPs") to tailor your messaging.</p>
    `,
    author: 'Emily White',
    role: 'Email Marketing Specialist',
    date: 'Dec 05, 2025',
    readTime: '13 min read',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Email', 'Automation', 'CRM'],
    category: 'Email Marketing',
    icon: Mail,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    id: 'building-brand-identity',
    title: 'More Than a Logo: Building a Brand Identity',
    excerpt: 'Your brand is your promise. Explore the elements of a strong brand identity and how to create consistency across all touchpoints.',
    tableOfContents: [
      { title: 'Brand vs Logo', id: 'definition' },
      { title: 'The Prism of Identity', id: 'prism' },
      { title: 'Tone of Voice', id: 'voice' },
      { title: 'Visual Systems', id: 'visuals' },
      { title: 'Consistency', id: 'consistency' }
    ],
    content: `
      <h2 id="definition">The DNA of a Brand</h2>
      <p>A logo is just a mark. A brand is a feeling. It's what people say about you when you're not in the room. Building a strong identity requires a deep understanding of your <strong>Core Values</strong> and <strong>Archetype</strong>.</p>
      
      <blockquote class="border-l-4 border-orange-500 pl-4 py-2 my-8 text-xl font-light italic text-gray-700">
        "Products are made in a factory but brands are created in the mind." – Walter Landor
      </blockquote>

      <h2 id="prism">The Prism of Identity</h2>
      <p>Successful brands are not accidental. They are architected. We use the Brand Identity Prism to define the 6 facets of a brand:</p>
      <ul class="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Physique:</strong> The visual characteristics (Apple = Sleek, Minimal).</li>
        <li><strong>Personality:</strong> Tone and character (Nike = Heroic).</li>
        <li><strong>Culture:</strong> Values and behavior (Google = Innovation).</li>
        <li><strong>Relationship:</strong> Interactions with customers (Disney = Magic).</li>
        <li><strong>Reflection:</strong> Who the user wants to be (Tesla = Eco-conscious visionary).</li>
        <li><strong>Self-Image:</strong> How the user feels (Rolex = Successful).</li>
      </ul>

      <h2 id="visuals">Visual Identity Systems</h2>
      <p>Logo, color palette, typography, and imagery style. These need to be consistent to build recognition. A disconnected visual system confuses the customer.</p>

      <h2 id="voice">Tone of Voice</h2>
      <p>Are you professional and authoritative? Or playful and witty? Your copy should reflect this personality. Wendy's Twitter account is a masterclass in distinct Tone of Voice.</p>

      <h2 id="consistency">Brand Guidelines (The Bible)</h2>
      <p>Document everything. A Brand Bible ensures that every freelancer, agency, or employee creates work that looks and feels like YOU. Consistency breeds trust.</p>
    `,
    author: 'Robert Lee',
    role: 'Creative Director',
    date: 'Dec 03, 2025',
    readTime: '16 min read',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Branding', 'Design', 'Strategy'],
    category: 'Branding',
    icon: Megaphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    id: 'web-vitals-2025',
    title: 'Core Web Vitals: The Speed Factor in 2025',
    excerpt: 'Website speed is a direct ranking factor. Understand LCP, INP, and CLS to ensure your site is fast, stable, and user-friendly.',
    tableOfContents: [
      { title: 'Speed Kills', id: 'speed' },
      { title: 'The Big Three', id: 'metrics' },
      { title: 'LCP Optimization', id: 'lcp' },
      { title: 'INP Optimization', id: 'inp' },
      { title: 'CLS Optimization', id: 'cls' }
    ],
    content: `
      <h2 id="speed">Speed Kills (If You Don't Have It)</h2>
      <p>Users expect websites to load instantly. If it takes more than 3 seconds, 53% of mobile users will bounce. Google knows this, which is why <strong>Core Web Vitals</strong> are crucial.</p>
      
      <div class="flex justify-around items-center my-8 bg-black text-white p-6 rounded-xl">
        <div class="text-center">
            <div class="text-4xl font-bold text-green-400">2.5s</div>
            <div class="text-sm">Good LCP</div>
        </div>
        <div class="text-center">
            <div class="text-4xl font-bold text-yellow-400">200ms</div>
            <div class="text-sm">Good INP</div>
        </div>
        <div class="text-center">
            <div class="text-4xl font-bold text-green-400">0.1</div>
            <div class="text-sm">Good CLS</div>
        </div>
      </div>

      <h2 id="metrics">The Big Three</h2>
      <ul>
        <li><strong>LCP (Largest Contentful Paint):</strong> How long does it take for the main content to load?</li>
        <li><strong>INP (Interaction to Next Paint):</strong> How responsive is the page? Does it freeze when clicked?</li>
        <li><strong>CLS (Cumulative Layout Shift):</strong> Does the layout jump around as it loads?</li>
      </ul>

      <h2 id="lcp">Optimizing LCP</h2>
      <p>This is usually your Hero image. Ensure it's preloaded. Use WebP formats. Put critical CSS inline.</p>

      <h2 id="inp">Optimizing INP</h2>
      <p>Minimize main thread work. Break up long tasks. Use Web Workers for heavy JavaScript.</p>
      
      <h2 id="cls">Optimizing CLS</h2>
      <p>Always include width and height attributes on images and video. Reserve space for ads. Don't insert content above existing content.</p>
    `,
    author: 'Jessica Chen',
    role: 'Lead Developer',
    date: 'Nov 28, 2025',
    readTime: '11 min read',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['Web Dev', 'Performance', 'Technical SEO'],
    category: 'Web Development',
    icon: Globe,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100'
  }
];
