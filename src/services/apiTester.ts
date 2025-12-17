
export const testGoogleSearchConsole = async (accessToken: string) => {
    try {
        const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to connect to Google Search Console');
        }

        const data = await response.json();
        return {
            success: true,
            message: `Connected! Found ${data.siteEntry?.length || 0} verified sites.`,
            data: data
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Network Error or Invalid Token'
        };
    }
};

export const testGooglePageSpeed = async (apiKey: string, url: string = 'https://google.com') => {
    try {
        const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to connect to PageSpeed API');
        }

        const data = await response.json();
        return {
            success: true,
            message: `Connected! Lighthouse Score: ${data.lighthouseResult?.categories?.performance?.score * 100 || 'N/A'}`,
            data: data
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        };
    }
};
