import Link from "next/link";
import { Package, Check } from "lucide-react";

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
            <nav className="border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <Package className="h-8 w-8 text-gray-700" />
                            <span className="text-xl font-bold text-gray-900">LabelApp</span>
                        </Link>
                        <div className="flex gap-6">
                            <Link href="/" className="text-gray-700 hover:text-gray-900">
                                Home
                            </Link>
                            <Link href="/features" className="text-gray-900 font-medium">
                                Features
                            </Link>
                            <Link href="/download" className="text-gray-700 hover:text-gray-900">
                                Download
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Powerful Features
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to create professional labels and barcodes for your business.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-lg border border-gray-200">
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

                <div className="mt-16 text-center">
                    <Link
                        href="/download"
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium"
                    >
                        Get Started Now
                    </Link>
                </div>
            </main>

            <footer className="border-t border-gray-200 mt-20 py-8 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
                    <p>&copy; 2026 LabelApp. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
