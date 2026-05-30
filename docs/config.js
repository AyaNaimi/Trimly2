// Configuration file for easy customization
// Edit these values to customize your landing page

const CONFIG = {
    // App Information
    app: {
        name: "Trimly",
        tagline: "Smart Expense Tracker",
        description: "Take control of your finances with smart budgeting, real-time tracking, and insightful reports.",
        logo: "💰" // Can be emoji or path to image
    },
    
    // Download Links
    downloads: {
        appStore: "https://apps.apple.com/app/your-app-id",
        googlePlay: "https://play.google.com/store/apps/details?id=your.package.name",
        // Optional: Direct APK download
        apk: null
    },
    
    // Social Media Links
    social: {
        facebook: "https://facebook.com/yourpage",
        twitter: "https://twitter.com/yourhandle",
        instagram: "https://instagram.com/yourhandle",
        linkedin: "https://linkedin.com/company/yourcompany",
        youtube: null,
        tiktok: null
    },
    
    // Contact Information
    contact: {
        email: "ayanaimi.trimly@gmail.com",
        phone: "+1 (555) 123-4567",
        address: "123 Finance Street, Money City, FC 12345"
    },
    
    // Statistics (shown in hero section)
    stats: {
        downloads: 50000,
        rating: 4.9,
        countries: 100,
        users: 10000
    },
    
    // Pricing Plans
    pricing: {
        free: {
            price: 0,
            currency: "$",
            period: "month",
            features: [
                "Up to 50 transactions/month",
                "Basic reports",
                "3 budget categories",
                "Mobile app access"
            ]
        },
        pro: {
            price: 9.99,
            currency: "$",
            period: "month",
            popular: true,
            features: [
                "Unlimited transactions",
                "Advanced analytics",
                "Unlimited categories",
                "Cloud sync",
                "Export reports",
                "Priority support"
            ]
        },
        family: {
            price: 14.99,
            currency: "$",
            period: "month",
            features: [
                "Everything in Pro",
                "Up to 5 family members",
                "Shared budgets",
                "Family insights",
                "Parental controls"
            ]
        }
    },
    
    // Features
    features: [
        {
            icon: "fa-chart-pie",
            title: "Smart Analytics",
            description: "Visualize your spending patterns with beautiful charts and detailed reports"
        },
        {
            icon: "fa-wallet",
            title: "Budget Planning",
            description: "Set budgets for different categories and track your progress in real-time"
        },
        {
            icon: "fa-bell",
            title: "Smart Notifications",
            description: "Get alerts when you're close to your budget limits or unusual spending detected"
        },
        {
            icon: "fa-sync",
            title: "Cloud Sync",
            description: "Access your data from any device with automatic cloud synchronization"
        },
        {
            icon: "fa-lock",
            title: "Bank-Level Security",
            description: "Your financial data is protected with 256-bit encryption and biometric authentication"
        },
        {
            icon: "fa-file-export",
            title: "Export Reports",
            description: "Generate and export detailed financial reports in PDF or Excel format"
        }
    ],
    
    // Testimonials
    testimonials: [
        {
            name: "Sarah Johnson",
            role: "Marketing Manager",
            avatar: "https://i.pravatar.cc/150?img=1",
            rating: 5,
            text: "This app completely changed how I manage my finances. I've saved over $500 in just 3 months!"
        },
        {
            name: "Michael Chen",
            role: "Software Engineer",
            avatar: "https://i.pravatar.cc/150?img=12",
            rating: 5,
            text: "Simple, intuitive, and powerful. The best expense tracker I've ever used!"
        },
        {
            name: "Emma Williams",
            role: "Entrepreneur",
            avatar: "https://i.pravatar.cc/150?img=5",
            rating: 5,
            text: "The insights and reports help me make better financial decisions every day."
        }
    ],
    
    // Theme Colors (CSS variables)
    colors: {
        light: {
            primary: "#6366f1",
            secondary: "#8b5cf6",
            accent: "#ec4899",
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444"
        },
        dark: {
            primary: "#6366f1",
            secondary: "#8b5cf6",
            accent: "#ec4899",
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444"
        }
    },
    
    // Animation Settings
    animations: {
        enableScrollReveal: true,
        enableParallax: true,
        enableLottie: true,
        enableCounters: true,
        enableParticles: false, // Set to true for particle background
        enableCustomCursor: false, // Set to true for custom cursor (desktop only)
        scrollRevealDelay: 100, // milliseconds between elements
        parallaxSpeed: 0.5
    },
    
    // SEO Settings
    seo: {
        title: "Trimly - Smart Expense Tracker | Manage Your Finances",
        description: "Track your expenses effortlessly with Trimly. Smart budgeting, real-time tracking, and insightful reports. Download now!",
        keywords: "expense tracker, budget app, finance management, money tracker, spending tracker",
        author: "Trimly Team",
        ogImage: "assets/og-image.jpg",
        twitterHandle: "@trimlyapp"
    },
    
    // Analytics
    analytics: {
        googleAnalytics: null, // "G-XXXXXXXXXX"
        facebookPixel: null,
        hotjar: null
    },
    
    // Legal Links
    legal: {
        privacyPolicy: "https://trimly.app/privacy.html",
        termsOfService: "https://trimly.app/terms.html",
        cookiePolicy: "https://trimly.app/cookies.html"
    },
    
    // Newsletter
    newsletter: {
        enabled: false,
        provider: "mailchimp", // mailchimp, convertkit, etc.
        actionUrl: "https://your-newsletter-signup-url.com"
    },
    
    // Language Settings
    languages: {
        default: "en",
        available: ["en", "fr", "es", "ar"],
        rtl: ["ar"] // Right-to-left languages
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
