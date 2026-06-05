"use client";

import Link from "next/link";
import { Package, Check, Zap, CreditCard, Repeat } from "lucide-react";

export default function Features() {
    const features = [
        {
            title: "Multiple Barcode Formats",
            items: [
                "Code 128 - High-density linear barcode",
                "EAN-13 / EAN-8 - European Article Numbers",
                "UPC-A / UPC-E - Universal Product Codes",
                "Code 39 - Alphanumeric barcode",
                "ITF - Interleaved 2 of 5",
                "Codabar - Numeric barcode for logistics"
            ]
        },
        {
            title: "Label Customization",
            items: [
                "Custom text and fonts",
                "Logo and image insertion",
                "Adjustable label sizes",
                "Color customization",
                "Multiple label templates",
                "USPS-compatible headers"
            ]
        },
        {
            title: "Output Options",
            items: [
                "Direct printer support",
                "PDF export",
                "PNG/SVG image export",
                "Batch processing",
                "High-resolution output",
                "Print preview"
            ]
        },
        {
            title: "User Experience",
            items: [
                "Intuitive GUI interface",
                "Drag-and-drop design",
                "Real-time preview",
                "Save and load projects",
                "Keyboard shortcuts",
                "Modern interface"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/90 safe-top-add">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-gray-900" />
                            <span className="text-sm md:text-lg font-semibold text-gray-900">Label Maker Pro</span>
                        </Link>
                        <div className="flex gap-6">
                            <Link href="/" className="text-gray-700 hover:text-gray-900 hover:scale-110 transition-all duration-200">
                                Home
                            </Link>
                            <Link href="/features" className="text-gray-900 font-medium hover:scale-110 transition-all duration-200">
                                Features
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
                {/* Pricing Section */}
                <div className="mb-12 md:mb-24">
                    <div className="text-center mb-8 md:mb-16 animate-fade-in">
                        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 animate-slide-down">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up">
                            Choose the plan that works best for your business
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Pay-per-label */}
                        <div className="bg-white p-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 transform flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="h-8 w-8 text-gray-700" />
                                <h3 className="text-2xl font-bold text-gray-900">Pay-per-Label</h3>
                            </div>
                            <div className="mb-6 space-y-2">
                                <div className="flex items-baseline justify-between border border-gray-100 rounded-lg px-4 py-2 bg-gray-50">
                                    <span className="text-2xl font-bold text-gray-900">$5</span>
                                    <span className="text-gray-500 text-sm">per label</span>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Perfect for occasional use. Pay only for what you need.
                            </p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">No commitment</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Pay as you go</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">All features included</span>
                                </li>
                            </ul>
                            <Link
                                href="/signup"
                                className="block w-full text-center bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Subscription */}
                        <div className="bg-white p-8 rounded-lg border-2 border-gray-900 hover:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform relative flex flex-col">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <Repeat className="h-8 w-8 text-gray-900" />
                                <h3 className="text-2xl font-bold text-gray-900">Subscription</h3>
                            </div>
                            <div className="mb-6 space-y-2">
                                <div className="flex items-baseline justify-between border border-gray-800 rounded-lg px-4 py-2 bg-gray-50">
                                    <span className="text-2xl font-bold text-gray-900">$120</span>
                                    <span className="text-gray-500 text-sm">per month</span>
                                </div>
                                <div className="flex items-baseline justify-between border border-gray-800 rounded-lg px-4 py-2 bg-gray-50">
                                    <span className="text-2xl font-bold text-gray-900">$1,450</span>
                                    <span className="text-gray-500 text-sm">per year &mdash; save $90</span>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Best value for regular users. Generate up to 150 labels monthly.
                            </p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-900 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Up to 150 labels/month</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-900 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Priority support</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-900 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">All features included</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-900 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Cancel anytime</span>
                                </li>
                            </ul>
                            <Link
                                href="/signup"
                                className="block w-full text-center bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                            >
                                Subscribe Now
                            </Link>
                        </div>

                        {/* Prepaid Credits */}
                        <div className="bg-white p-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 transform flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="h-8 w-8 text-gray-700" />
                                <h3 className="text-2xl font-bold text-gray-900">Prepaid Credits</h3>
                            </div>
                            <div className="mb-6 space-y-2">
                                <div className="flex items-baseline justify-between border border-gray-100 rounded-lg px-4 py-2 bg-gray-50">
                                    <span className="text-2xl font-bold text-gray-900">$50</span>
                                    <span className="text-gray-500 text-sm">10 labels &mdash; $5 each</span>
                                </div>
                                <div className="flex items-baseline justify-between border border-gray-100 rounded-lg px-4 py-2 bg-gray-50">
                                    <span className="text-2xl font-bold text-gray-900">$500</span>
                                    <span className="text-gray-500 text-sm">100 labels &mdash; $5 each</span>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Buy in bulk and use credits whenever you need them.
                            </p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Credits never expire</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">Flexible usage</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">All features included</span>
                                </li>
                            </ul>
                            <Link
                                href="/signup"
                                className="block w-full text-center bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                            >
                                Buy Credits
                            </Link>
                        </div>
                    </div>
                </div>


                {/* Features Section */}
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-slide-down">
                        Powerful Features
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up">
                        Everything you need to create professional labels and barcodes for your business.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-lg border border-gray-200"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                {feature.title}
                            </h2>
                            <ul className="space-y-3">
                                {feature.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="flex items-start gap-3">
                                        <Check className="h-6 w-6 text-gray-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center animate-fade-in">
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
                    >
                        Get Started Now
                    </Link>
                </div>
            </main>

            <footer className="border-t border-gray-200 mt-20 py-8 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 animate-fade-in">
                    <p>&copy; 2026 Label Maker Pro. All rights reserved.</p>
                </div>
            </footer>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out;
                }

                .animate-slide-down {
                    animation: slideDown 0.6s ease-out;
                }

                .animate-slide-up {
                    animation: slideUp 0.6s ease-out;
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}
