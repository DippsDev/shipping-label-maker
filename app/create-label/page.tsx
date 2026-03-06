"use client";

import Link from "next/link";
import { Package, LayoutDashboard, Tag, History, Wallet, MapPin, Search, Settings, Download, Printer, BookOpen, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function CreateLabel() {
    const [selectedCarrier, setSelectedCarrier] = useState("UPS");
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login");
        }
    }, [session, isPending, router]);

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

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const userInitials = session?.user?.name
        ? getInitials(session.user.name)
        : session?.user?.email
            ? session.user.email.substring(0, 2).toUpperCase()
            : "U";

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

    if (!session) {
        return null;
    }

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
                            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                <LayoutDashboard className="h-5 w-5" />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/create-label" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 transition-colors">
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
                        <div className="flex-1 text-center xl:text-left pr-16 xl:pr-0">
                            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Create Label</h1>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">Generate a shipping label for your package</p>
                        </div>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowAccountMenu(!showAccountMenu)}
                            className="flex items-center gap-2 md:gap-3 -ml-[3px] hover:bg-gray-50 px-2 md:px-3 py-2 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-900">{userInitials}</span>
                            </div>
                            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
                                {session.user?.name || session.user?.email}
                            </span>
                        </button>

                        {showAccountMenu && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-200">
                                    <p className="text-xs text-gray-500 uppercase font-medium mb-2">Account</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-900">{userInitials}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {session.user?.name || "User"}
                                            </p>
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
                <div className="p-4 md:p-8">
                    <div className="grid xl:grid-cols-3 gap-6">
                        {/* Form Section */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Carrier & Service */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Carrier & Service</h2>
                                <p className="text-xs md:text-sm text-gray-600 mb-4">Select your shipping carrier and service type</p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 mb-4">
                                    <button
                                        onClick={() => setSelectedCarrier("UPS")}
                                        className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${selectedCarrier === "UPS"
                                            ? "border-2 border-gray-900 bg-gray-50 text-gray-900"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        UPS
                                    </button>
                                    <button
                                        onClick={() => setSelectedCarrier("FedEx")}
                                        className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${selectedCarrier === "FedEx"
                                            ? "border-2 border-gray-900 bg-gray-50 text-gray-900"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        FedEx
                                    </button>
                                    <button
                                        onClick={() => setSelectedCarrier("USPS")}
                                        className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${selectedCarrier === "USPS"
                                            ? "border-2 border-gray-900 bg-gray-50 text-gray-900"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        USPS
                                    </button>
                                    <button
                                        onClick={() => setSelectedCarrier("Purolator")}
                                        className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${selectedCarrier === "Purolator"
                                            ? "border-2 border-gray-900 bg-gray-50 text-gray-900"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        Purolator
                                    </button>
                                    <button
                                        onClick={() => setSelectedCarrier("Canada Post")}
                                        className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors col-span-2 sm:col-span-1 ${selectedCarrier === "Canada Post"
                                            ? "border-2 border-gray-900 bg-gray-50 text-gray-900"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        Canada Post
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Service Type <span className="text-red-500">*</span></label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900">
                                            <option>UPS Ground</option>
                                            <option>UPS Next Day Air</option>
                                            <option>UPS 2nd Day Air</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Tracking Number <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter tracking number"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                            />
                                            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Original Label & Package */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Original Label & Package</h2>
                                <p className="text-xs md:text-sm text-gray-600 mb-4">Upload an existing label to copy data, and enter package dimensions</p>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Original Label (Optional)</label>
                                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full justify-center">
                                            <Download className="h-4 w-4" />
                                            Select File
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Weight (lbs)</label>
                                        <input type="number" defaultValue="70" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Length (in)</label>
                                        <input type="number" defaultValue="19" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Width (in)</label>
                                        <input type="number" defaultValue="17" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Height (in)</label>
                                        <input type="number" defaultValue="13" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                    </div>
                                </div>
                            </div>

                            {/* Ship To */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">Ship To</h2>
                                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs md:text-sm">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="hidden sm:inline">Address Book</span>
                                    </button>
                                </div>
                                <p className="text-xs md:text-sm text-gray-600 mb-4">Enter the recipient's address</p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Recipient Name <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Enter recipient name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Phone (Optional)</label>
                                        <input type="tel" placeholder="Enter phone number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Street address" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Address Line 2 (Optional)</label>
                                        <input type="text" placeholder="Apartment, suite, etc." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">City <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Enter city" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900">
                                            <option>United States</option>
                                            <option>Canada</option>
                                            <option>Mexico</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">State/Province (Optional)</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900">
                                            <option>NE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">ZIP/Postal Code <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Enter ZIP code" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900" />
                                            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                                📍
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Options */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Additional Options</h2>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded" />
                                        <span className="text-sm text-gray-700">Use custom return address</span>
                                    </label>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">UPS Zone (Optional)</label>
                                            <input type="text" placeholder="Enter zone code" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                            <p className="text-xs text-gray-500 mt-1">3-digit zone code from original label</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Sorting Code (Optional)</label>
                                            <input type="text" placeholder="Enter sorting code" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                            <p className="text-xs text-gray-500 mt-1">Sorting code from original label</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Output File Name (Optional)</label>
                                        <input type="text" placeholder="Leave blank for auto-generated name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                        <p className="text-xs text-gray-500 mt-1">Custom filename for the generated label</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Label Options</label>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm text-gray-700">LIT Mode</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm text-gray-700">Remove Weight</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm text-gray-700">Remove RG</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm text-gray-700">Custom Maxicode</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm text-gray-700">Custom Phone Number</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm text-gray-700">Scramble Tracking #</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm text-gray-700">Custom Reference</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm md:text-base">
                                    🔄 Reset Form
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 font-medium text-sm md:text-base">
                                    <Package className="h-5 w-5" />
                                    Generate Label
                                </button>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 xl:sticky xl:top-8">
                                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Label Preview</h2>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
                                    <div className="bg-white p-4 rounded shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="text-xs text-gray-900">
                                                <p className="font-bold">UPS</p>
                                                <p>UPS GROUND</p>
                                            </div>
                                            <div className="text-right text-xs text-gray-900">
                                                <p>KY-6-21</p>
                                                <p className="font-bold">959</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-b py-2 my-2">
                                            <svg className="w-full h-12" viewBox="0 0 200 40">
                                                <rect width="2" height="40" x="10" fill="black" />
                                                <rect width="1" height="40" x="15" fill="black" />
                                                <rect width="3" height="40" x="20" fill="black" />
                                                <rect width="2" height="40" x="26" fill="black" />
                                                <rect width="1" height="40" x="31" fill="black" />
                                                <rect width="2" height="40" x="35" fill="black" />
                                                <rect width="3" height="40" x="40" fill="black" />
                                                <rect width="1" height="40" x="46" fill="black" />
                                                <rect width="2" height="40" x="50" fill="black" />
                                                <rect width="1" height="40" x="55" fill="black" />
                                                <rect width="3" height="40" x="60" fill="black" />
                                            </svg>
                                        </div>

                                        <div className="text-xs space-y-1 text-gray-900">
                                            <p className="font-bold">SHIP TO:</p>
                                            <p>Recipient Name</p>
                                            <p>Address Line 1</p>
                                            <p>Address Line 2</p>
                                            <p>City, State ZIP</p>
                                            <p>Country</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Fill out the form to see a live preview of your label
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


