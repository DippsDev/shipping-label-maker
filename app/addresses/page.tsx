"use client";

import Link from "next/link";
import { Package, LayoutDashboard, Tag, History, Wallet, MapPin, Search, Settings, Plus, Edit, Trash2, Star, Clock, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Address {
    id: number;
    name: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isSaved: boolean;
    lastUsed?: string;
    usageCount: number;
}

export default function AddressesPage() {
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "saved" | "recent">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

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

    const addresses: Address[] = [
        {
            id: 1,
            name: "John Smith",
            phone: "555-0123",
            addressLine1: "123 Main Street",
            addressLine2: "Apt 4B",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "United States",
            isSaved: true,
            lastUsed: "2026-03-03",
            usageCount: 15
        },
        {
            id: 2,
            name: "HELOO",
            phone: "01230230",
            addressLine1: "WHDI R",
            addressLine2: "LASTOURS",
            city: "NAHKSD",
            state: "NE",
            zipCode: "10001",
            country: "United States",
            isSaved: false,
            lastUsed: "2026-03-03",
            usageCount: 1
        },
        {
            id: 3,
            name: "Sarah Johnson",
            phone: "555-0456",
            addressLine1: "456 Oak Avenue",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90001",
            country: "United States",
            isSaved: true,
            lastUsed: "2026-03-01",
            usageCount: 8
        },
        {
            id: 4,
            name: "Mike Wilson",
            addressLine1: "789 Pine Road",
            city: "Chicago",
            state: "IL",
            zipCode: "60601",
            country: "United States",
            isSaved: false,
            lastUsed: "2026-02-28",
            usageCount: 3
        },
        {
            id: 5,
            name: "Emily Davis",
            phone: "555-0789",
            addressLine1: "321 Elm Street",
            addressLine2: "Suite 200",
            city: "Houston",
            state: "TX",
            zipCode: "77001",
            country: "United States",
            isSaved: true,
            lastUsed: "2026-02-25",
            usageCount: 12
        }
    ];

    const filteredAddresses = addresses.filter(address => {
        const matchesSearch = searchQuery === "" ||
            address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            address.addressLine1.toLowerCase().includes(searchQuery.toLowerCase()) ||
            address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            address.zipCode.includes(searchQuery);

        if (activeTab === "saved") return address.isSaved && matchesSearch;
        if (activeTab === "recent") return !address.isSaved && matchesSearch;
        return matchesSearch;
    });

    const toggleSaveAddress = (id: number) => {
        // In a real app, this would update the backend
        console.log("Toggle save for address:", id);
    };

    const deleteAddress = (id: number) => {
        // In a real app, this would delete from backend
        console.log("Delete address:", id);
    };

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
                            <Link href="/addresses" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 transition-colors">
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
                            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Addresses</h1>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">Manage your saved and recent shipping addresses</p>
                        </div>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowAccountMenu(!showAccountMenu)}
                            className="flex items-center gap-3 -ml-[3px] hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-900">PA</span>
                            </div>
                            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">Platform Admin</span>
                        </button>

                        {showAccountMenu && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-200">
                                    <p className="text-xs text-gray-500 uppercase font-medium">Switch Account</p>
                                </div>
                                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-900">PA</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Platform Admin</p>
                                        <p className="text-xs text-gray-500">admin@labelapp.com</p>
                                    </div>
                                </button>
                                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-900">JD</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">John Doe</p>
                                        <p className="text-xs text-gray-500">john@example.com</p>
                                    </div>
                                </button>
                                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-green-900">SM</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Sarah Miller</p>
                                        <p className="text-xs text-gray-500">sarah@example.com</p>
                                    </div>
                                </button>
                                <div className="border-t border-gray-200 mt-2 pt-2">
                                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700">
                                        Add Account
                                    </button>
                                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-red-600">
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    {/* Stats Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Addresses</p>
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 mb-1">{addresses.length}</p>
                            <p className="text-xs text-gray-500">All stored addresses</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Saved Addresses</p>
                                <Star className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 mb-1">{addresses.filter(a => a.isSaved).length}</p>
                            <p className="text-xs text-gray-500">In address book</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Recent Addresses</p>
                                <Clock className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 mb-1">{addresses.filter(a => !a.isSaved).length}</p>
                            <p className="text-xs text-gray-500">From recent labels</p>
                        </div>
                    </div>

                    {/* Add Address Button */}
                    <div className="bg-gray-900 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Add New Address</h2>
                                <p className="text-sm text-gray-300">Save frequently used addresses to your address book</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Add Address
                            </button>
                        </div>
                    </div>

                    {/* Address List */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Address Book</h2>
                            </div>

                            {/* Search and Filter */}
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search addresses..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTab("all")}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "all"
                                            ? "bg-gray-900 text-white"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("saved")}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "saved"
                                            ? "bg-gray-900 text-white"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        Saved
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("recent")}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "recent"
                                            ? "bg-gray-900 text-white"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        Recent
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Address Cards */}
                        <div className="p-6">
                            {filteredAddresses.length === 0 ? (
                                <div className="text-center py-12">
                                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No addresses found</p>
                                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {filteredAddresses.map((address) => (
                                        <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">{address.name}</h3>
                                                    {address.isSaved && (
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => toggleSaveAddress(address.id)}
                                                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                                        title={address.isSaved ? "Remove from saved" : "Save to address book"}
                                                    >
                                                        <Star className={`h-4 w-4 ${address.isSaved ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                                                        <Edit className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteAddress(address.id)}
                                                        className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                {address.phone && <p>{address.phone}</p>}
                                                <p>{address.addressLine1}</p>
                                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                                <p>{address.city}, {address.state} {address.zipCode}</p>
                                                <p>{address.country}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                                <p className="text-xs text-gray-500">
                                                    Used {address.usageCount} {address.usageCount === 1 ? "time" : "times"}
                                                </p>
                                                {address.lastUsed && (
                                                    <p className="text-xs text-gray-500">
                                                        Last used: {address.lastUsed}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Address Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
                        <p className="text-sm text-gray-600 mb-4">Save a new address to your address book</p>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Recipient Name <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone (Optional)</label>
                                    <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Address Line 2 (Optional)</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">City <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Country <span className="text-red-500">*</span></label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900">
                                        <option>United States</option>
                                        <option>Canada</option>
                                        <option>Mexico</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">State/Province <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">ZIP/Postal Code <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
