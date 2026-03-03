"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TrackingEvent {
    date: string;
    time: string;
    location: string;
    status: string;
    description: string;
}

interface TrackingInfo {
    trackingNumber: string;
    status: "in-transit" | "delivered" | "exception" | "pending";
    carrier: string;
    estimatedDelivery: string;
    origin: string;
    destination: string;
    weight: string;
    service: string;
    events: TrackingEvent[];
}

const mockTrackingData: Record<string, TrackingInfo> = {
    "9400111899223033005025": {
        trackingNumber: "9400111899223033005025",
        status: "in-transit",
        carrier: "USPS",
        estimatedDelivery: "March 5, 2026",
        origin: "New York, NY 10001",
        destination: "Los Angeles, CA 90001",
        weight: "2.5 lbs",
        service: "Priority Mail",
        events: [
            {
                date: "March 3, 2026",
                time: "2:30 PM",
                location: "Phoenix, AZ 85001",
                status: "In Transit",
                description: "Your package is on its way",
            },
            {
                date: "March 2, 2026",
                time: "8:15 AM",
                location: "Dallas, TX 75201",
                status: "Departed Facility",
                description: "Left USPS distribution center",
            },
            {
                date: "March 1, 2026",
                time: "5:45 PM",
                location: "New York, NY 10001",
                status: "Accepted",
                description: "USPS in possession of item",
            },
        ],
    },
};

export default function Tracking() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [trackingResult, setTrackingResult] = useState<TrackingInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) {
            setError("Please enter a tracking number");
            return;
        }

        setLoading(true);
        setError("");
        setTrackingResult(null);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const result = mockTrackingData[trackingNumber];
        if (result) {
            setTrackingResult(result);
        } else {
            setError("Tracking number not found. Please check and try again.");
        }

        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-green-100 text-green-800";
            case "in-transit":
                return "bg-blue-100 text-blue-800";
            case "exception":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">Track Package</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleTrack} className="mb-8">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter tracking number (e.g., 9400111899223033005025)"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Tracking...
                                </span>
                            ) : (
                                "Track"
                            )}
                        </button>
                    </div>
                    {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
                </form>

                {trackingResult && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                                    <p className="font-mono text-lg font-medium">{trackingResult.trackingNumber}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingResult.status)}`}>
                                    {trackingResult.status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Carrier</p>
                                    <p className="font-medium">{trackingResult.carrier}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Service</p>
                                    <p className="font-medium">{trackingResult.service}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Weight</p>
                                    <p className="font-medium">{trackingResult.weight}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Est. Delivery</p>
                                    <p className="font-medium">{trackingResult.estimatedDelivery}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">From:</span>
                                    <span className="font-medium">{trackingResult.origin}</span>
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="h-0.5 bg-gray-200 relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">To:</span>
                                    <span className="font-medium">{trackingResult.destination}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Tracking History</h2>
                            <div className="space-y-0">
                                {trackingResult.events.map((event, index) => (
                                    <div key={index} className="flex gap-4 pb-6 last:pb-0">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-blue-500" : "bg-gray-300"}`}></div>
                                            {index < trackingResult.events.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1"></div>}
                                        </div>
                                        <div className="flex-1 pt-0">
                                            <p className="font-medium text-gray-900">{event.status}</p>
                                            <p className="text-gray-600 text-sm mt-0.5">{event.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span>{event.date}</span>
                                                <span>•</span>
                                                <span>{event.time}</span>
                                                <span>•</span>
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !trackingResult && !error && (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Enter a tracking number to see package details</p>
                    </div>
                )}
            </main>
        </div>
    );
}