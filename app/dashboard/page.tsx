"use client";

import Link from "next/link";
import { Package, LayoutDashboard, Tag, History, Wallet, MapPin, Search, Settings, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowAccountMenu(false);
            }
        }

        if (showAccountMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAccountMenu]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login");
        }
    }, [session, isPending, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    // Show loading state while checking authentication
    if (isPending) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!session) {
        return null;
    }

    const userInitials = session.user?.name
        ? session.user.name.split(" ").map(n => n[0]).join("").toUpperCase()
        : session.user?.email?.[0].toUpperCase() || "U";

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
                    onClick={() => setShowMobileMenu(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed xl:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Package className="h-6 w-6 text-gray-700" />
                        <span className="text-lg font-semibold text-gray-900">Label Maker</span>
                    </Link>
                    <button
                        onClick={() => setShowMobileMenu(false)}
                        className="xl:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 transition-colors">
                                <LayoutDashboard className="h-5 w-5" />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/create-label" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                <Tag className="h-5 w-5" />
                                <span>Create Label</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/history" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                <History className="h-5 w-5" />
                                <span>Label History</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/wallet" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                <Wallet className="h-5 w-5" />
                                <span>Wallet</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/addresses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                <MapPin className="h-5 w-5" />
                                <span>Addresses</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors w-full">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full xl:w-auto">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <button
                            onClick={() => setShowMobileMenu(true)}
                            className="xl:hidden p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                        >
                            <Menu className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="flex-1 xl:flex-initial">
                            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Welcome to Label Maker</h1>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">Professional shipping label and barcode generation</p>
                        </div>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowAccountMenu(!showAccountMenu)}
                            className="flex items-center gap-3 -ml-[3px] hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-900">{userInitials}</span>
                            </div>
                            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">{session.user?.name || session.user?.email}</span>
                        </button>

                        {showAccountMenu && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="text-xs text-gray-500 uppercase font-medium mb-2">Account</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-900">{userInitials}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{session.user?.name || "User"}</p>
                                            <p className="text-xs text-gray-500">{session.user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-2">
                                    <Link href="/settings" className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-red-600"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Total Labels</h3>
                                <Tag className="h-8 w-8 text-gray-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">1,234</p>
                            <p className="text-sm text-gray-600 mt-2">Generated this month</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Active Shipments</h3>
                                <Package className="h-8 w-8 text-gray-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">89</p>
                            <p className="text-sm text-gray-600 mt-2">In transit</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
                                <MapPin className="h-8 w-8 text-gray-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">45</p>
                            <p className="text-sm text-gray-600 mt-2">Quick access</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h2>
                        <div className="grid md:grid-cols-1 gap-4">
                            <Link href="/create-label" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                                <Tag className="h-8 w-8 text-gray-600 mb-2" />
                                <h3 className="font-semibold text-gray-900 mb-1">Create New Label</h3>
                                <p className="text-sm text-gray-600">Generate a shipping label for your package</p>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-2">Need Help Getting Started?</h2>
                        <p className="mb-4 opacity-90">Learn how to create your first shipping label in minutes</p>
                        <Link href="/features" className="inline-block bg-white text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                            View Tutorial
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
