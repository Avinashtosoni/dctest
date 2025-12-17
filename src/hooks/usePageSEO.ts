import { useEffect } from 'react';

export const usePageSEO = ({ title, description, keywords }: { title: string, description: string, keywords?: string[] }) => {
    useEffect(() => {
        // Update Title
        document.title = `${title} | Digital Comrade`;

        // Update Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

        // Update Meta Keywords (Optional)
        if (keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute('content', keywords.join(', '));
        }

        // Cleanup (Optional - revert to default?) 
        // For SPA it's usually fine to just let the next page overwrite it.
    }, [title, description, keywords]);
};
