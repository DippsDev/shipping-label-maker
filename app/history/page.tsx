"use client";

import Link from "next/link";
import { Package, LayoutDashboard, Tag, History, Wallet, MapPin, Search, Settings, Download, Eye, Printer, Filter, Calendar, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Label {
    id: number;
    trackingNumber: string;
    carrier: string;
    service: string;
    recipientName: string;
    recipientAddress: string;
    recipientCity: string;
    recipientState: string;
    recipientZip: string;
    weight: number;
    cost: number;
    status: "completed" | "pending" | "failed";
    createdDate: string;
    createdTime: string;
}

export default function HistoryPage() {
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [selectedCarrier, setSelectedCarrier] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const menuRef = useRef<HTMLDivElement>(null);
    const { data: session, isPending } = useSession();
    const router = useRouter();

    // Redirect to login if not authenticated
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

    const userInitials = session?.user?.user_metadata?.name
        ? getInitials(session.user.user_metadata.name)
        : session?.user?.email
            ? session.user.email.substring(0, 2).toUpperCase()
            : "T";

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

    const labels: Label[] = [];

    const filteredLabels = labels.filter(label => {
        const matchesCarrier = selectedCarrier === "all" || label.carrier === selectedCarrier;
        const matchesSearch = searchQuery === "" ||
            label.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            label.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            label.recipientCity.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesDate = true;
        if (dateFilter === "today") {
            matchesDate = label.createdDate === "2026-03-03";
        } else if (dateFilter === "week") {
            const labelDate = new Date(label.createdDate);
            const weekAgo = new Date("2026-02-24");
            matchesDate = labelDate >= weekAgo;
        } else if (dateFilter === "month") {
            matchesDate = label.createdDate.startsWith("2026-03") || label.createdDate.startsWith("2026-02");
        }

        return matchesCarrier && matchesSearch && matchesDate;
    });

    const totalLabels = labels.length;
    const totalSpent = labels.reduce((sum, label) => sum + label.cost, 0);
    const thisMonthLabels = labels.filter(l => l.createdDate.startsWith("2026-03")).length;

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
                            <Link href="/history" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 transition-colors">
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
                            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Label History</h1>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">View and manage all your created labels</p>
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
                            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
                                {session?.user?.user_metadata?.name || session?.user?.email || "Test User"}
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
                                                {session?.user?.user_metadata?.name || "Test User"}
                                            </p>
                                            <p className="text-xs text-gray-500">{session?.user?.email || "test@example.com"}</p>
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
                                <p className="text-sm text-gray-600">Total Labels</p>
                                <Tag className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 mb-1">{totalLabels}</p>
                            <p className="text-xs text-gray-500">All time</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">This Month</p>
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 mb-1">{thisMonthLabels}</p>
                            <p className="text-xs text-gray-500">Labels created</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Spent</p>
                                <Wallet className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 mb-1">${totalSpent.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">On all labels</p>
                        </div>
                    </div>

                    {/* Labels List */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">All Labels</h2>
                                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by tracking number, recipient, or city..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedCarrier}
                                        onChange={(e) => setSelectedCarrier(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    >
                                        <option value="all">All Carriers</option>
                                        <option value="UPS">UPS</option>
                                        <option value="FedEx">FedEx</option>
                                        <option value="USPS">USPS</option>
                                        <option value="Purolator">Purolator</option>
                                        <option value="Canada Post">Canada Post</option>
                                    </select>
                                    <select
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">This Month</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Labels Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredLabels.map((label) => (
                                        <tr key={label.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-medium text-gray-900">{label.trackingNumber}</p>
                                                <p className="text-xs text-gray-500">{label.service}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                    {label.carrier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-900">{label.recipientName}</p>
                                                <p className="text-xs text-gray-500">{label.weight} lbs</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{label.recipientCity}, {label.recipientState}</p>
                                                <p className="text-xs text-gray-500">{label.recipientZip}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-900">{label.createdDate}</p>
                                                <p className="text-xs text-gray-500">{label.createdTime}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-medium text-gray-900">${label.cost.toFixed(2)}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="View Label">
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Download Label">
                                                        <Download className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Print Label">
                                                        <Printer className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredLabels.length === 0 && (
                            <div className="p-12 text-center">
                                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No labels yet</p>
                                <p className="text-sm text-gray-500 mt-1">Create your first shipping label to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
