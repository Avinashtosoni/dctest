-- =============================================
-- Blog Management System Database Schema
-- =============================================

-- =============================================
-- BLOG CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text UNIQUE NOT NULL,
    description text,
    color text DEFAULT '#01478c',
    icon text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- BLOG POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    excerpt text,
    content text NOT NULL,
    
    -- Author Info
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name text NOT NULL,
    author_role text,
    
    -- Category (denormalized for performance)
    category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    category_name text,
    
    -- Media
    featured_image text,
    
    -- Status
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at timestamptz,
    
    -- Metadata
    read_time text,
    views_count integer DEFAULT 0,
    
    -- SEO
    seo_title text,
    meta_description text,
    keywords text,
    canonical_url text,
    
    -- Additional Data
    table_of_contents jsonb DEFAULT '[]',
    tags text[] DEFAULT '{}',
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Categories: Everyone can view active, Admins can manage
DROP POLICY IF EXISTS "Anyone can view active blog categories" ON public.blog_categories;
CREATE POLICY "Anyone can view active blog categories"
    ON public.blog_categories FOR SELECT
    USING (is_active = true OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

DROP POLICY IF EXISTS "Admins can manage blog categories" ON public.blog_categories;
CREATE POLICY "Admins can manage blog categories"
    ON public.blog_categories FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- Blog Posts: Everyone can view published, Admins can manage all
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published blog posts"
    ON public.blog_posts FOR SELECT
    USING (status = 'published' OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts"
    ON public.blog_posts FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    ));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blog_categories_updated_at ON public.blog_categories;
CREATE TRIGGER trigger_blog_categories_updated_at
    BEFORE UPDATE ON public.blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_updated_at();

DROP TRIGGER IF EXISTS trigger_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trigger_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_updated_at();

-- =============================================
-- SEED DATA - Blog Categories
-- =============================================
INSERT INTO public.blog_categories (name, slug, description, color, icon) VALUES
    ('SEO', 'seo', 'Search Engine Optimization strategies and trends', '#3B82F6', 'Search'),
    ('Social Media', 'social-media', 'Social media marketing and engagement', '#8B5CF6', 'Share2'),
    ('PPC', 'ppc', 'Pay-per-click advertising and campaigns', '#EF4444', 'Target'),
    ('Email Marketing', 'email-marketing', 'Email campaigns and automation', '#F59E0B', 'Mail'),
    ('Branding', 'branding', 'Brand identity and strategy', '#F97316', 'Megaphone'),
    ('Web Development', 'web-development', 'Website performance and development', '#06B6D4', 'Globe')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- SEED DATA - Blog Posts (from existing blogs.ts)
-- =============================================

-- Blog 1: Future of SEO
INSERT INTO public.blog_posts (
    slug, title, excerpt, content, author_name, author_role,
    category_name, featured_image, status, published_at,
    read_time, tags, seo_title, meta_description, keywords,
    table_of_contents
) VALUES (
    'future-of-seo-2025',
    'The Future of SEO in 2025: Beyond Keywords and Backlinks',
    'The SEO landscape is undergoing a seismic shift. From AI-driven Search Generative Experience (SGE) to the dominance of E-E-A-T, discover the 7 key trends that will define search in 2025.',
    '<h2 id="intro">Introduction: The Death of "Old SEO"</h2>
<p>If you are still optimizing for "10 blue links," you are already behind. The world of Search Engine Optimization (SEO) is facing its most significant transformation since the invention of the PageRank algorithm. As we approach 2025, the convergence of Artificial Intelligence, voice search, and hyper-personalized user experiences is rewriting the rulebook.</p>
<p>For over a decade, SEOs have focused on technical checklists: keyword density, backlink quantity, and meta tags. While these fundamentals haven''t disappeared, they have been relegated to "table stakes." The new frontier is <strong>Semantic Authority</strong> and <strong>User Satisfaction</strong>.</p>

<div class="bg-blue-50 p-6 rounded-xl border border-blue-100 my-8">
  <h4 class="text-blue-900 font-bold text-lg mb-2">Key Statistics for 2025</h4>
  <ul class="space-y-2">
      <li class="flex items-start"><span class="text-blue-600 mr-2">✓</span> <strong>84%</strong> of searches now result in zero clicks due to AI snippets.</li>
      <li class="flex items-start"><span class="text-blue-600 mr-2">✓</span> <strong>50%</strong> of Gen Z prefers TikTok/Instagram over Google for search.</li>
      <li class="flex items-start"><span class="text-blue-600 mr-2">✓</span> Voice commerce is expected to hit <strong>$80 Billion</strong> by 2025.</li>
  </ul>
</div>

<h2 id="sge">1. The Rise of Search Generative Experience (SGE)</h2>
<p>Google''s integration of generative AI into search results—known as SGE—is the biggest disruptor. Instead of directing users to websites immediately, Google is now answering queries directly on the search results page (SERP) with AI-synthesized summaries.</p>

<h3 class="text-xl font-bold mt-6 mb-3">Impact on Click-Through Rates (CTR)</h3>
<p>The traditional funnel is breaking. Users are getting answers without leaving Google. This means traffic volume may drop, but <em>intent</em> will increase.</p>

<h2 id="eeat">2. E-E-A-T Is No Longer Optional</h2>
<p>Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) has evolved from a guideline to a core ranking signal. In a world flooded with AI-generated content, Google is desperate for signals of humanity.</p>

<h2 id="visual">3. The Video and Visual Search Takeover</h2>
<p>Gen Z does not "Google" everything. They search on TikTok, Instagram, and Pinterest. In 2025, a robust SEO strategy is a <strong>multi-modal</strong> strategy.</p>

<h2 id="ux">4. User Experience (UX) as a Ranking Factor</h2>
<p>Core Web Vitals are now a mature ranking signal. But in 2025, UX goes beyond load speed. It''s about <strong>Information Gain</strong> and <strong>Frustration-Free Browsing</strong>.</p>

<h2 id="voice">5. Voice Search and Natural Language Processing (NLP)</h2>
<p>With the proliferation of smart speakers and improved voice assistants, the way we search is becoming more conversational. Keywords are out; questions are in.</p>

<h2 id="technical">6. Technical SEO: The Foundation Remains</h2>
<p>While content is king, technical SEO is the castle walls. If Google''s spiders cannot crawl your site efficiently, your amazing content will never be seen.</p>

<h2 id="conclusion">Conclusion: Adapt or Die</h2>
<p>The SEO landscape of 2025 is unforgiving to those who refuse to adapt. The days of gaming the system are over. The algorithm is now smart enough to detect quality, relevance, and expertise.</p>',
    'Sarah Johnson',
    'CEO & Founder',
    'SEO',
    'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'published',
    '2025-12-12 00:00:00+00',
    '15 min read',
    ARRAY['SEO', 'Digital Trends', 'AI', 'Voice Search'],
    'Best SEO Strategies 2024',
    'Learn the top SEO strategies for 2025',
    'seo, 2024, marketing, AI, voice search',
    '[
        {"title": "The Death of Old SEO", "id": "intro"},
        {"title": "The Rise of SGE", "id": "sge"},
        {"title": "E-E-A-T & Authority", "id": "eeat"},
        {"title": "Visual Search Takeover", "id": "visual"},
        {"title": "UX as a Ranking Factor", "id": "ux"},
        {"title": "Voice Search & NLP", "id": "voice"},
        {"title": "Technical SEO", "id": "technical"},
        {"title": "Conclusion", "id": "conclusion"}
    ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Blog 2: Social Media ROI
INSERT INTO public.blog_posts (
    slug, title, excerpt, content, author_name, author_role,
    category_name, featured_image, status, published_at,
    read_time, tags, table_of_contents
) VALUES (
    'social-media-roi',
    'Measuring Social Media ROI: Metrics That Matter',
    'Stop chasing vanity metrics. Learn how to track the numbers that actually impact your bottom line: Conversions, CAC, and LTV.',
    '<h2 id="intro">Vanity vs. Sanity Metrics</h2>
<p>Likes and shares feel good, but they don''t pay the bills. In the boardroom, your CMO doesn''t care about "Engagement Rate" as much as they care about <strong>Revenue Attributed</strong>. If you want to prove the value of social media to stakeholders, you need to speak the language of business: <strong>Return on Investment (ROI)</strong>.</p>

<div class="flex items-center justify-center my-8">
  <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-2xl shadow-xl text-center max-w-lg">
      <h3 class="text-2xl font-bold mb-2">The Golden Rule</h3>
      <p class="font-medium">"If you can''t measure it, you can''t manage it."</p>
  </div>
</div>

<h2 id="formula">The ROI Formula</h2>
<p>Calculating ROI is deceivingly simple, yet many marketers get it wrong. The core formula is:</p>

<div class="bg-gray-100 p-6 rounded-lg text-center font-mono text-lg border border-gray-300 my-6">
  (Profit from Social - Cost of Social) / Cost of Social x 100
</div>

<h2 id="metrics">Key Metrics Defined</h2>
<p>Understanding CAC (Customer Acquisition Cost), LTV (Lifetime Value), and CR (Conversion Rate) is essential.</p>

<h2 id="attribution">Attribution Models</h2>
<p>The biggest challenge is attribution. Did they buy because of the Facebook ad or the email they got later? Using tools like <strong>Google Analytics 4 (GA4)</strong> and UTM parameters is essential.</p>

<h2 id="case-study">Case Study: eCommerce Brand</h2>
<p>Let''s look at a real-world example. Brand X spent $10,000 on Instagram Ads. They generated $35,000 in revenue directly attributed to those ads.</p>',
    'Michael Chen',
    'Head of Strategy',
    'Social Media',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'published',
    '2025-12-10 00:00:00+00',
    '12 min read',
    ARRAY['Social Media', 'Analytics', 'Growth'],
    '[
        {"title": "Vanity vs. Sanity", "id": "intro"},
        {"title": "The ROI Formula", "id": "formula"},
        {"title": "Key Metrics defined", "id": "metrics"},
        {"title": "Attribution Models", "id": "attribution"},
        {"title": "Case Study", "id": "case-study"}
    ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Blog 3: AI Digital Marketing
INSERT INTO public.blog_posts (
    slug, title, excerpt, content, author_name, author_role,
    category_name, featured_image, status, published_at,
    read_time, tags, table_of_contents
) VALUES (
    'ai-digital-marketing',
    'How AI is Reshaping Paid Advertising (PPC)',
    'From automated bidding to generative ad copy, AI is making PPC smarter. Here is how to leverage machine learning for lower CPA.',
    '<h2 id="automation">The Automation Revolution</h2>
<p>Artificial Intelligence is no longer a buzzword in PPC; it''s the engine. Platforms like Google Ads (Performance Max) and Meta (Advantage+) are moving towards "black box" automation where algorithms make real-time bidding decisions.</p>

<div class="bg-red-50 p-6 border-l-4 border-red-500 my-6 italic">
  "Automation is not about replacing the marketer. It''s about replacing the mundane tasks so the marketer can focus on strategy."
</div>

<h2 id="bidding">1. Smart Bidding</h2>
<p>Manual bidding is effectively dead. AI analyzes millions of signals—time of day, device, user location, browsing history—to adjust bids in milliseconds.</p>

<h2 id="creative">2. Generative Creative</h2>
<p>Tools are now capable of generating hundreds of ad variations—headlines, descriptions, and even images—to test what resonates best.</p>

<h2 id="audiences">3. Predictive Audiences</h2>
<p>Instead of targeting "Men, 25-34, Likes Sports," AI analyzes historical conversion data to predict who is likely to convert next.</p>

<h2 id="human">The Human Element</h2>
<p>Does this mean media buyers are obsolete? No. The role has shifted from "lever puller" to "strategy architect".</p>',
    'David Kim',
    'PPC Lead',
    'PPC',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'published',
    '2025-12-08 00:00:00+00',
    '14 min read',
    ARRAY['PPC', 'AI', 'Advertising'],
    '[
        {"title": "The Automation Era", "id": "automation"},
        {"title": "Smart Bidding Explained", "id": "bidding"},
        {"title": "Generative Creative", "id": "creative"},
        {"title": "Predictive Audiences", "id": "audiences"},
        {"title": "The Human Role", "id": "human"}
    ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Blog 4: Email Marketing
INSERT INTO public.blog_posts (
    slug, title, excerpt, content, author_name, author_role,
    category_name, featured_image, status, published_at,
    read_time, tags, table_of_contents
) VALUES (
    'email-marketing-automation',
    'The Power of Email Automation: Engage & Retain',
    'Email is still the king of ROI. Learn how to set up automated flows that nurture leads and generate revenue 24/7.',
    '<h2 id="roi">Why Email?</h2>
<p>With an average ROI of $36 for every $1 spent, email marketing remains the most profitable channel. But sending manual newsletters isn''t enough. You need <strong>Automation</strong>.</p>

<h2 id="welcome">1. The Welcome Series</h2>
<p>This is your first date. Introduce your brand, set expectations, and offer a first-purchase incentive.</p>

<h2 id="cart">2. Abandoned Cart</h2>
<p>The average cart abandonment rate is 70%. Imagine recovering just 10% of that revenue.</p>

<h2 id="post-purchase">3. Post-Purchase</h2>
<p>Turn buyers into loyalists. Ask for reviews, suggest related products, and say thank you.</p>

<h2 id="segmentation">Personalization at Scale</h2>
<p>Automation allows you to send the right message to the right person at the right time.</p>',
    'Emily White',
    'Email Marketing Specialist',
    'Email Marketing',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'published',
    '2025-12-05 00:00:00+00',
    '13 min read',
    ARRAY['Email', 'Automation', 'CRM'],
    '[
        {"title": "ROI King", "id": "roi"},
        {"title": "The Welcome Series", "id": "welcome"},
        {"title": "Abandoned Cart", "id": "cart"},
        {"title": "Post-Purchase", "id": "post-purchase"},
        {"title": "Segmentation", "id": "segmentation"}
    ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Blog 5: Brand Identity
INSERT INTO public.blog_posts (
    slug, title, excerpt, content, author_name, author_role,
    category_name, featured_image, status, published_at,
    read_time, tags, table_of_contents
) VALUES (
    'building-brand-identity',
    'More Than a Logo: Building a Brand Identity',
    'Your brand is your promise. Explore the elements of a strong brand identity and how to create consistency across all touchpoints.',
    '<h2 id="definition">The DNA of a Brand</h2>
<p>A logo is just a mark. A brand is a feeling. It''s what people say about you when you''re not in the room.</p>

<blockquote class="border-l-4 border-orange-500 pl-4 py-2 my-8 text-xl font-light italic text-gray-700">
  "Products are made in a factory but brands are created in the mind." – Walter Landor
</blockquote>

<h2 id="prism">The Prism of Identity</h2>
<p>Successful brands are not accidental. They are architected using the Brand Identity Prism.</p>

<h2 id="voice">Tone of Voice</h2>
<p>Are you professional and authoritative? Or playful and witty?</p>

<h2 id="visuals">Visual Identity Systems</h2>
<p>Logo, color palette, typography, and imagery style must be consistent.</p>

<h2 id="consistency">Brand Guidelines (The Bible)</h2>
<p>Document everything. A Brand Bible ensures consistency.</p>',
    'Robert Lee',
    'Creative Director',
    'Branding',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'published',
    '2025-12-03 00:00:00+00',
    '16 min read',
    ARRAY['Branding', 'Design', 'Strategy'],
    '[
        {"title": "Brand vs Logo", "id": "definition"},
        {"title": "The Prism of Identity", "id": "prism"},
        {"title": "Tone of Voice", "id": "voice"},
        {"title": "Visual Systems", "id": "visuals"},
        {"title": "Consistency", "id": "consistency"}
    ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Blog 6: Web Vitals
INSERT INTO public.blog_posts (
    slug, title, excerpt, content, author_name, author_role,
    category_name, featured_image, status, published_at,
    read_time, tags, table_of_contents
) VALUES (
    'web-vitals-2025',
    'Core Web Vitals: The Speed Factor in 2025',
    'Website speed is a direct ranking factor. Understand LCP, INP, and CLS to ensure your site is fast, stable, and user-friendly.',
    '<h2 id="speed">Speed Kills (If You Don''t Have It)</h2>
<p>Users expect websites to load instantly. If it takes more than 3 seconds, 53% of mobile users will bounce.</p>

<h2 id="metrics">The Big Three</h2>
<ul>
  <li><strong>LCP (Largest Contentful Paint):</strong> How long does it take for the main content to load?</li>
  <li><strong>INP (Interaction to Next Paint):</strong> How responsive is the page?</li>
  <li><strong>CLS (Cumulative Layout Shift):</strong> Does the layout jump around?</li>
</ul>

<h2 id="lcp">Optimizing LCP</h2>
<p>Ensure your hero image is preloaded. Use WebP formats.</p>

<h2 id="inp">Optimizing INP</h2>
<p>Minimize main thread work. Break up long tasks.</p>

<h2 id="cls">Optimizing CLS</h2>
<p>Always include width and height attributes on images.</p>',
    'Jessica Chen',
    'Lead Developer',
    'Web Development',
    'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'published',
    '2025-11-28 00:00:00+00',
    '11 min read',
    ARRAY['Web Dev', 'Performance', 'Technical SEO'],
    '[
        {"title": "Speed Kills", "id": "speed"},
        {"title": "The Big Three", "id": "metrics"},
        {"title": "LCP Optimization", "id": "lcp"},
        {"title": "INP Optimization", "id": "inp"},
        {"title": "CLS Optimization", "id": "cls"}
    ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Update category_id for all posts
UPDATE public.blog_posts bp
SET category_id = bc.id
FROM public.blog_categories bc
WHERE bp.category_name = bc.name;
