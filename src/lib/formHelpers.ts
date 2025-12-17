import Swal from 'sweetalert2';

// Inspirational quotes for form submissions
const successQuotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "The secret of getting ahead is getting started. - Mark Twain",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The future depends on what you do today. - Mahatma Gandhi",
    "Quality is not an act, it is a habit. - Aristotle",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "I find that the harder I work, the more luck I seem to have. - Thomas Jefferson",
    "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
    "The way to get started is to quit talking and begin doing. - Walt Disney"
];

/**
 * Get a random inspirational quote
 */
export const getRandomQuote = (): string => {
    return successQuotes[Math.floor(Math.random() * successQuotes.length)];
};

/**
 * Show a professional success message with a random quote
 */
export const showFormSuccessMessage = (formType: string = 'submission') => {
    const quote = getRandomQuote();

    return Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        html: `
            <div style="text-align: left; padding: 10px;">
                <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
                    Your ${formType} has been received successfully! Our team will review it and 
                    get back to you as soon as possible.
                </p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            padding: 20px; 
                            border-radius: 12px; 
                            margin: 20px 0;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);">
                    <p style="color: white; 
                               font-style: italic; 
                               font-size: 15px; 
                               line-height: 1.6; 
                               margin: 0;
                               text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        "${quote}"
                    </p>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                    <strong>What's next?</strong><br/>
                    • Our team will review your request within 24 hours<br/>
                    • We'll contact you via email or phone<br/>
                    • Keep an eye on your inbox for our response
                </p>
            </div>
        `,
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#01478c',
        width: '600px',
        customClass: {
            popup: 'animated-popup',
            confirmButton: 'confirm-btn-custom'
        }
    });
};

/**
 * Show error message for form submission
 */
export const showFormErrorMessage = (errorMessage?: string) => {
    return Swal.fire({
        icon: 'error',
        title: 'Oops!',
        html: `
            <p style="font-size: 16px; color: #333;">
                ${errorMessage || 'Something went wrong while submitting your form. Please try again.'}
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">
                If the problem persists, please contact us directly at 
                <a href="mailto:info@digitalcomrade.in" style="color: #01478c;">info@digitalcomrade.in</a>
            </p>
        `,
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#01478c'
    });
};
