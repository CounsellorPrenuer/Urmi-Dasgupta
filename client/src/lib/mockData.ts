import type { Package, Blog, MentoriaPackage, Testimonial } from '@shared/schema';

export const mockPackages: Package[] = [
    {
        id: "pkg-1",
        name: "Discover",
        description: "A foundational session to discover your potential.",
        price: 5500,
        duration: "60 mins",
        features: ["One-on-one session", "Clarity roadmap"],
        paymentButtonId: "pl_RwDuOx96VYrsyN",
        createdAt: new Date()
    },
    {
        id: "pkg-2",
        name: "Discovery Plus",
        description: "Extended discovery with deeper insights.",
        price: 15000,
        duration: "3 Sessions",
        features: ["3 Deep dive sessions", "Personalized action plan", "Email support"],
        paymentButtonId: "pl_RwDq8XpK76OhB3",
        createdAt: new Date()
    },
    {
        id: "pkg-3",
        name: "Achieve",
        description: "Structured coaching for achieving goals.",
        price: 5999,
        duration: "1 Session",
        features: ["Goal setting", "Blockage identification", "Strategy formulation"],
        paymentButtonId: "pl_RwDxvLPQP7j4rG",
        createdAt: new Date()
    },
    {
        id: "pkg-4",
        name: "Achieve Plus",
        description: "Intensive coaching for sustained achievement.",
        price: 10599,
        duration: "4 Sessions",
        features: ["Weekly coaching", "Accountability check-ins", "Resource access"],
        paymentButtonId: "pl_RwDzfVkQYEdAIf",
        createdAt: new Date()
    },
    {
        id: "pkg-5",
        name: "Ascend",
        description: "Elevate your life to the next level.",
        price: 25000, // Price inferred/placeholder
        duration: "3 Months",
        features: ["Transformational journey", "Priority support", "Exclusive tools"],
        paymentButtonId: "pl_RwE1evNHrHWJDW",
        createdAt: new Date()
    },
    {
        id: "pkg-6",
        name: "Ascend Plus",
        description: "The ultimate mastery program.",
        price: 50000, // Price inferred/placeholder
        duration: "6 Months",
        features: ["Full mentorship", "VIP access", "Life mastery curriculum"],
        paymentButtonId: "pl_RwE3WEILWB9WeJ",
        createdAt: new Date()
    }
];

export const mockBlogs: Blog[] = [
    {
        id: "blog-1",
        title: "Finding Stillness in Chaos",
        excerpt: "In a world that never stops moving, finding your inner center is not just a luxury, it's a necessity. Learn simple techniques to ground yourself.",
        content: "<p>Chaos is often external, but peace is internal. By practicing daily grounding techniques, you can navigate life's storms with grace...</p><p>Start by observing your breath for just 5 minutes a day.</p>",
        author: "Urmi Dasgupta",
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        createdAt: new Date("2024-01-10")
    },
    {
        id: "blog-2",
        title: "The Art of Letting Go",
        excerpt: "Holding on to the past prevents new energy from entering your life. Discover the freedom that comes with release.",
        content: "<p>Letting go is not about forgetting; it's about releasing the emotional charge attached to memories...</p><p>When we release, we create space for the new.</p>",
        author: "Urmi Dasgupta",
        imageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        createdAt: new Date("2024-01-05")
    },
    {
        id: "blog-3",
        title: "Navigating Career Transitions",
        excerpt: "Changing careers can be daunting. Here is how to align your professional path with your soul's purpose.",
        content: "<p>Your career is an extension of your energy. When you feel drained, it's a sign of misalignment...</p>",
        author: "Urmi Dasgupta",
        imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        createdAt: new Date("2023-12-28")
    }
];

export const mockMentoriaPackages: MentoriaPackage[] = [
    {
        id: "mp-1",
        name: "Foundation",
        description: "Start your journey with clear guidance.",
        price: 4999,
        category: "8-9 Students",
        features: ["Career Assessment", "1 Counseling Session", "Basic Roadmap"],
        isPopular: false,
        isActive: true,
        createdAt: new Date()
    },
    {
        id: "mp-2",
        name: "Advanced",
        description: "Deep dive into career options.",
        price: 9999,
        category: "10-12 Students",
        features: ["Psychometric Test", "3 Counseling Sessions", "Detailed Roadmap", "College Selection Support"],
        isPopular: true,
        isActive: true,
        createdAt: new Date()
    },
    {
        id: "mp-3",
        name: "Pro",
        description: "For professionals seeking change.",
        price: 14999,
        category: "Working Professionals",
        features: ["Skill Gap Analysis", "Resume Review", "Interview Prep", "LinkedIn Optimization"],
        isPopular: false,
        isActive: true,
        createdAt: new Date()
    }
];

export const mockTestimonials: Testimonial[] = [
    {
        id: "test-1",
        name: "Sarah Jenkins",
        content: "Urmi's guidance helped me navigate a very difficult career transition. Her insights were spot on.",
        rating: 5,
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        createdAt: new Date()
    },
    {
        id: "test-2",
        name: "Michael Chen",
        content: "The clarity session was truly transformative. I felt a huge weight lifted off my shoulders.",
        rating: 5,
        imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        createdAt: new Date()
    },
    {
        id: "test-3",
        name: "Emily Davis",
        content: "I've been to many therapists, but Urmi's approach is unique. She combines spiritual wisdom with practical advice.",
        rating: 5,
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        createdAt: new Date()
    }
];
