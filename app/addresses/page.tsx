"use client";

import Link from "next/link";
import { Package, LayoutDashboard, Tag, History, Wallet, MapPin, Search, Settings, Plus, Edit, Trash2, Star, Clock, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

interface Address {
    id: string;
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
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States"
    });
    const menuRef = useRef<HTMLDivElement>(null);
    const [session, setSession] = useState<any>(null);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoadingSession(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

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

    useEffect(() => {
        if (!isLoadingSession && !session) {
            router.push("/login");
        }
    }, [session, isLoadingSession, router]);

    useEffect(() => {
        if (session) {
            fetchAddresses();
        }
    }, [session]);

    const fetchAddresses = async () => {
        try {
            const response = await fetch("/api/addresses");
            if (response.ok) {
                const data = await response.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (isLoadingSession || isLoading) {
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

    const userInitials = session?.user?.user_metadata?.name
        ? session.user.user_metadata.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : session?.user?.email?.[0].toUpperCase() || "U";

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

    const handleAddAddress = async () => {
        try {
            console.log("Submitting address:", formData);
            const response = await fetch("/api/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, isSaved: true })
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers.get("content-type"));

            const text = await response.text();
            console.log("Response text:", text);

            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error("Failed to parse JSON:", e);
                alert("Server returned invalid response. Check console for details.");
                return;
            }

            if (response.ok) {
                await fetchAddresses();
                setShowAddModal(false);
                setFormData({
                    name: "",
                    phone: "",
                    addressLine1: "",
                    addressLine2: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "United States"
                });
                alert("Address saved successfully!");
            } else {
                alert(`Failed to save address: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Failed to add address:", error);
            alert("Failed to save address. Check console for details.");
        }
    };

    const toggleSaveAddress = async (id: string) => {
        try {
            const address = addresses.find(a => a.id === id);
            if (!address) return;

            const response = await fetch(`/api/addresses/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isSaved: !address.isSaved })
            });

            if (response.ok) {
                await fetchAddresses();
            }
        } catch (error) {
            console.error("Failed to toggle save address:", error);
        }
    };

    const deleteAddress = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            const response = await fetch(`/api/addresses/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                await fetchAddresses();
            }
        } catch (error) {
            console.error("Failed to delete address:", error);
        }
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
                                <span className="text-sm font-medium text-gray-900">{userInitials}</span>
                            </div>
                            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">{session?.user?.user_metadata?.name || session?.user?.email}</span>
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
                                            <p className="text-sm font-medium text-gray-900">{session?.user?.user_metadata?.name || "User"}</p>
                                            <p className="text-xs text-gray-500">{session?.user?.email}</p>
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
                                    <p className="text-gray-600">No addresses yet</p>
                                    <p className="text-sm text-gray-500 mt-1">Add your first address to get started</p>
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
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.addressLine1}
                                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.addressLine2}
                                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">City <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Country <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    >
                                        <option>United States</option>
                                        <option>Canada</option>
                                        <option>Mexico</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">State/Province <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">ZIP/Postal Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    />
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
                            <button
                                onClick={handleAddAddress}
                                disabled={!formData.name || !formData.addressLine1 || !formData.city || !formData.state || !formData.zipCode}
                                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
