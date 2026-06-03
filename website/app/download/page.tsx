import Link from "next/link";
import { Package, Download, Monitor, Apple, Github } from "lucide-react";

export default function DownloadPage() {
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
                            <Link href="/features" className="text-gray-700 hover:text-gray-900">
                                Features
                            </Link>
                            <Link href="/download" className="text-gray-900 font-medium">
                                Download
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Download LabelApp
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Get started with professional label and barcode generation. Choose your platform below.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white p-8 rounded-lg border-2 border-gray-900">
                        <div className="flex items-center gap-3 mb-4">
                            <Monitor className="h-10 w-10 text-gray-700" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Windows</h2>
                                <p className="text-sm text-gray-600">Windows 10 or later</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Full-featured desktop application with all capabilities.
                        </p>
                        <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                            <Download className="h-5 w-5" />
                            Download for Windows
                        </button>
                        <p className="text-sm text-gray-500 mt-3 text-center">
                            Version 1.0.0 • 45 MB
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Apple className="h-10 w-10 text-gray-700" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">macOS</h2>
                                <p className="text-sm text-gray-600">macOS 11 or later</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Native macOS application with full feature support.
                        </p>
                        <button className="w-full flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                            <Download className="h-5 w-5" />
                            Download for macOS
                        </button>
                        <p className="text-sm text-gray-500 mt-3 text-center">
                            Version 1.0.0 • 52 MB
                        </p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <Github className="h-8 w-8 text-gray-700" />
                        <h2 className="text-2xl font-bold text-gray-900">Open Source</h2>
                    </div>
                    <p className="text-gray-700 mb-4">
                        LabelApp is open source! View the code, contribute, or build from source.
                    </p>
                    <a
                        href="#"
                        className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-700 font-medium"
                    >
                        View on GitHub →
                    </a>
                </div>

                <div className="mt-12 bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">System Requirements</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                            <p className="font-medium mb-2">Windows:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Windows 10 or later</li>
                                <li>4 GB RAM minimum</li>
                                <li>100 MB free disk space</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium mb-2">macOS:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>macOS 11 (Big Sur) or later</li>
                                <li>4 GB RAM minimum</li>
                                <li>100 MB free disk space</li>
                            </ul>
                        </div>
                    </div>
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
