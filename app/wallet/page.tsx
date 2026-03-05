"use client";

import Link from "next/link";
import { Package, LayoutDashboard, Tag, History, Wallet, MapPin, Settings, Plus, Download, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function WalletPage() {
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
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

    const transactions = [
        { id: 1, type: "debit", description: "UPS Ground Label", amount: -8.50, date: "2026-03-03", time: "10:30 AM", status: "completed" },
        { id: 2, type: "credit", description: "Wallet Top-up", amount: 100.00, date: "2026-03-01", time: "2:15 PM", status: "completed" },
        { id: 3, type: "debit", description: "FedEx Express Label", amount: -15.75, date: "2026-02-28", time: "4:45 PM", status: "completed" },
        { id: 4, type: "debit", description: "USPS Priority Mail", amount: -6.25, date: "2026-02-27", time: "11:20 AM", status: "completed" },
        { id: 5, type: "credit", description: "Wallet Top-up", amount: 50.00, date: "2026-02-25", time: "9:00 AM", status: "completed" },
    ];

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
                            <Link href="/wallet" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 transition-colors">
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
                            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Wallet</h1>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">Manage your balance and transactions</p>
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
                    {/* Balance Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                        {/* Current Balance */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Current Balance</p>
                                <Wallet className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 mb-1">$100.00</p>
                            <p className="text-xs text-gray-500">Available for labels</p>
                        </div>

                        {/* This Month Spent */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">This Month</p>
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 mb-1">$30.50</p>
                            <p className="text-xs text-gray-500">Total spent</p>
                        </div>

                        {/* Total Transactions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Transactions</p>
                                <CreditCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-3xl font-semibold text-gray-900 mb-1">5</p>
                            <p className="text-xs text-gray-500">This month</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-900 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Add Funds</h2>
                                <p className="text-sm text-gray-300">Top up your wallet to create more labels</p>
                            </div>
                            <button
                                onClick={() => setShowTopUpModal(true)}
                                className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Top Up
                            </button>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                                    <p className="text-sm text-gray-600 mt-1">Your recent wallet activity</p>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                                                    }`}>
                                                    {transaction.type === "credit" ? (
                                                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-600">{transaction.date}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-600">{transaction.time}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <p className={`text-sm font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                    {transaction.type === "credit" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    {transaction.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {transactions.length === 0 && (
                            <div className="p-12 text-center">
                                <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No transactions yet</p>
                                <p className="text-sm text-gray-500 mt-1">Your transaction history will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Top Up Modal */}
            {showTopUpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Up Wallet</h3>
                        <p className="text-sm text-gray-600 mb-4">Add funds to your wallet</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">$25</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">$50</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">$100</button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Payment Method</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900">
                                    <option>Credit Card ending in 4242</option>
                                    <option>PayPal</option>
                                    <option>Add new payment method</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowTopUpModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                                Add Funds
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
