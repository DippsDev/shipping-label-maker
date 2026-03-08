"use client";

import Link from "next/link";
import { Package, LayoutDashboard, Tag, History, Wallet, MapPin, Search, Settings, Download, Printer, BookOpen, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function CreateLabel() {
    const [selectedCarrier, setSelectedCarrier] = useState("UPS");
    const [selectedService, setSelectedService] = useState("");
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState("");
    const [generationSuccess, setGenerationSuccess] = useState("");
    const [uploadedLabel, setUploadedLabel] = useState<File | null>(null);
    const [isProcessingLabel, setIsProcessingLabel] = useState(false);
    const [lastGeneratedLabel, setLastGeneratedLabel] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form data
    const [trackingNumber, setTrackingNumber] = useState("");
    const [shipToName, setShipToName] = useState("");
    const [shipToAddress, setShipToAddress] = useState("");
    const [shipToAddress2, setShipToAddress2] = useState("");
    const [shipToCity, setShipToCity] = useState("");
    const [shipToState, setShipToState] = useState("");
    const [shipToZip, setShipToZip] = useState("");
    const [weight, setWeight] = useState("");
    const [fileName, setFileName] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("United States");
    const [length, setLength] = useState("");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [upsZone, setUpsZone] = useState("");
    const [sortingCode, setSortingCode] = useState("");

    const menuRef = useRef<HTMLDivElement>(null);
    const { data: session, isPending } = useSession();
    const router = useRouter();

    // Carrier-specific service options
    const serviceOptions: Record<string, string[]> = {
        "UPS": ["UPS Ground", "UPS Next Day Air", "UPS 2nd Day Air", "UPS 3 Day Select", "UPS Ground Return Service"],
        "FedEx": ["FedEx Ground", "FedEx Home Delivery", "FedEx Express Saver", "FedEx 2Day", "FedEx Standard Overnight", "FedEx Priority Overnight", "Smart Post", "Ground Return Service"],
        "USPS": ["Priority Mail", "Priority Mail Express", "First Class Package", "Parcel Select", "Ground Advantage", "Priority Mail Return", "First Class Package Return", "UPS Mail Innovations", "Smart Label / Pitney Bowes"],
        "Purolator": ["Purolator Ground", "Purolator Express"],
        "Canada Post": ["Regular Parcel", "Expedited Parcel", "Regular Parcel Return", "Expedited Parcel Return"]
    };

    // Helper functions to determine which fields to show
    const isCanadianCarrier = selectedCarrier === "Purolator" || selectedCarrier === "Canada Post";
    const showWeight = selectedCarrier === "UPS" || selectedCarrier === "FedEx" || selectedCarrier === "Purolator";
    const showUPSFields = selectedCarrier === "UPS";
    const showDimensions = selectedCarrier === "USPS" && (selectedService === "Priority Mail" || selectedService === "Priority Mail Express");
    const showVCode = selectedCarrier === "USPS" && selectedService === "UPS Mail Innovations";
    const showMCode = selectedCarrier === "USPS" && selectedService === "Smart Label / Pitney Bowes";
    const showSortingCode = selectedCarrier === "UPS" || selectedCarrier === "Purolator";

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

    const handleResetForm = () => {
        // Reset carrier and service
        setSelectedCarrier("UPS");
        setSelectedService("");

        // Reset form fields
        setTrackingNumber("");
        setShipToName("");
        setShipToAddress("");
        setShipToAddress2("");
        setShipToCity("");
        setShipToState("");
        setShipToZip("");
        setWeight("");
        setFileName("");
        setPhone("");
        setCountry("United States");
        setLength("");
        setWidth("");
        setHeight("");
        setUpsZone("");
        setSortingCode("");

        // Clear uploaded label
        setUploadedLabel(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // Clear generated label
        setLastGeneratedLabel(null);

        // Clear messages
        setGenerationError("");
        setGenerationSuccess("");
    };

    const handleLabelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setGenerationError("Please upload an image file (PNG, JPG, etc.)");
            return;
        }

        setUploadedLabel(file);
        setIsProcessingLabel(true);
        setGenerationError("");
        setGenerationSuccess("");

        try {
            // Create FormData to send the image
            const formData = new FormData();
            formData.append('label', file);

            // Send to OCR/processing endpoint
            const response = await fetch('/api/process-label', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to process label');
            }

            const data = await response.json();

            // Auto-fill form fields with extracted data
            if (data.carrier) setSelectedCarrier(data.carrier);
            if (data.service) setSelectedService(data.service);
            if (data.trackingNumber) setTrackingNumber(data.trackingNumber);
            if (data.shipToName) setShipToName(data.shipToName);
            if (data.shipToAddress) setShipToAddress(data.shipToAddress);
            if (data.shipToAddress2) setShipToAddress2(data.shipToAddress2);
            if (data.shipToCity) setShipToCity(data.shipToCity);
            if (data.shipToState) setShipToState(data.shipToState);
            if (data.shipToZip) setShipToZip(data.shipToZip);
            if (data.weight) setWeight(data.weight);
            if (data.phone) setPhone(data.phone);

            setGenerationSuccess("Label processed successfully! Review the auto-filled information.");
        } catch (error) {
            console.error('Label processing error:', error);
            setGenerationError(
                'Could not automatically extract data from the label. ' +
                'The OCR service may not be configured yet. Please fill in the form manually.'
            );
        } finally {
            setIsProcessingLabel(false);
        }
    };

    const handleSelectFile = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveLabel = () => {
        setUploadedLabel(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDownloadLabel = () => {
        if (!lastGeneratedLabel) {
            setGenerationError("No label has been generated yet. Please generate a label first.");
            return;
        }

        try {
            const url = window.URL.createObjectURL(lastGeneratedLabel);
            const a = document.createElement('a');
            a.href = url;
            a.download = `label_${trackingNumber || 'output'}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setGenerationSuccess("Label downloaded successfully!");
        } catch (error) {
            console.error('Download error:', error);
            setGenerationError("Failed to download label. Please try again.");
        }
    };

    const handlePrintLabel = () => {
        if (!lastGeneratedLabel) {
            setGenerationError("No label has been generated yet. Please generate a label first.");
            return;
        }

        try {
            const url = window.URL.createObjectURL(lastGeneratedLabel);
            const printWindow = window.open(url, '_blank');

            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                    // Clean up after a delay to allow print dialog to open
                    setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                    }, 1000);
                };
            } else {
                setGenerationError("Pop-up blocked. Please allow pop-ups to print labels.");
            }
        } catch (error) {
            console.error('Print error:', error);
            setGenerationError("Failed to print label. Please try again.");
        }
    };

    const handleGenerateLabel = async () => {
        setGenerationError("");
        setGenerationSuccess("");

        // Validate required fields
        if (!selectedService) {
            setGenerationError("Please select a service type");
            return;
        }
        if (!trackingNumber) {
            setGenerationError("Please enter a tracking number");
            return;
        }
        if (!shipToName) {
            setGenerationError("Please enter recipient name");
            return;
        }
        if (!shipToAddress) {
            setGenerationError("Please enter recipient address");
            return;
        }
        if (!shipToCity) {
            setGenerationError("Please enter recipient city");
            return;
        }
        if (!shipToZip) {
            setGenerationError("Please enter ZIP/postal code");
            return;
        }

        setIsGenerating(true);

        try {
            const labelData = {
                carrier: selectedCarrier,
                service: selectedService,
                trackingNumber,
                shipToName,
                shipToAddress,
                shipToAddress2,
                shipToCity,
                shipToState: shipToState || shipToZip.substring(0, 2), // For Canadian carriers
                shipToProvince: shipToState || shipToZip.substring(0, 2),
                shipToZip,
                shipToPostal: shipToZip,
                weight,
                fileName: fileName || `label_${trackingNumber}`,
                hasOriginalLabel: uploadedLabel !== null,
            };

            const response = await fetch('/api/generate-label', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(labelData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate label');
            }

            // Check if response is JSON (setup instructions) or image
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                const result = await response.json();
                setGenerationError(
                    result.message || 'Label generation backend not configured. ' +
                    'Please see LABEL_SETUP.md in the website folder for setup instructions.'
                );
                console.log('Setup Instructions:', result.instructions);
                console.log('📋 See website/LABEL_SETUP.md for detailed setup guide');
            } else {
                // It's an image - save it and download it
                const blob = await response.blob();

                // Store the blob for download/print buttons
                setLastGeneratedLabel(blob);

                // Auto-download
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `label_${trackingNumber}.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setGenerationSuccess("Label generated successfully! Use Download or Print buttons below.");
            }
        } catch (error) {
            console.error('Label generation error:', error);
            setGenerationError(error instanceof Error ? error.message : 'Failed to generate label');
        } finally {
            setIsGenerating(false);
        }
    };

    const userInitials = session?.user?.user_metadata?.name
        ? getInitials(session.user.user_metadata.name)
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
                                {session.user?.user_metadata?.name || session.user?.email}
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
                                                {session.user?.user_metadata?.name || "User"}
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
                                        <select
                                            value={selectedService}
                                            onChange={(e) => setSelectedService(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        >
                                            <option value="">Select a service...</option>
                                            {serviceOptions[selectedCarrier]?.map((service) => (
                                                <option key={service} value={service}>{service}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Tracking Number <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter tracking number"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                            />
                                            <button
                                                onClick={() => setTrackingNumber("")}
                                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                                            >
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
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLabelUpload}
                                            className="hidden"
                                        />
                                        {!uploadedLabel ? (
                                            <button
                                                onClick={handleSelectFile}
                                                disabled={isProcessingLabel}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full justify-center text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Download className="h-4 w-4" />
                                                {isProcessingLabel ? "Processing..." : "Select File"}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-2 border border-green-300 bg-green-50 rounded-lg">
                                                <span className="text-sm text-green-700 flex-1 truncate">{uploadedLabel.name}</span>
                                                <button
                                                    onClick={handleRemoveLabel}
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Upload to auto-fill form data</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Weight (lbs)</label>
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Length (in)</label>
                                        <input
                                            type="number"
                                            value={length}
                                            onChange={(e) => setLength(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Width (in)</label>
                                        <input
                                            type="number"
                                            value={width}
                                            onChange={(e) => setWidth(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Height (in)</label>
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ship To */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">Ship To</h2>
                                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs md:text-sm text-gray-700">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="hidden sm:inline">Address Book</span>
                                    </button>
                                </div>
                                <p className="text-xs md:text-sm text-gray-600 mb-4">Enter the recipients address</p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Recipient Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Enter recipient name"
                                            value={shipToName}
                                            onChange={(e) => setShipToName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            placeholder="Enter phone number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Street address"
                                            value={shipToAddress}
                                            onChange={(e) => setShipToAddress(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Address Line 2 (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Apartment, suite, etc."
                                            value={shipToAddress2}
                                            onChange={(e) => setShipToAddress2(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">City <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Enter city"
                                            value={shipToCity}
                                            onChange={(e) => setShipToCity(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        >
                                            <option>United States</option>
                                            <option>Canada</option>
                                            <option>Mexico</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">State/Province (Optional)</label>
                                        <select
                                            value={shipToState}
                                            onChange={(e) => setShipToState(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        >
                                            <option value="">Select state...</option>
                                            <option>NE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">ZIP/Postal Code <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter ZIP code"
                                                value={shipToZip}
                                                onChange={(e) => setShipToZip(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                            />
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
                                            <input
                                                type="text"
                                                placeholder="Enter zone code"
                                                value={upsZone}
                                                onChange={(e) => setUpsZone(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">3-digit zone code from original label</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Sorting Code (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Enter sorting code"
                                                value={sortingCode}
                                                onChange={(e) => setSortingCode(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Sorting code from original label</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Output File Name (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Leave blank for auto-generated name"
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                        />
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

                            {/* Error/Success Messages */}
                            {generationError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                            <span className="text-red-600 text-sm font-bold">!</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
                                            <p className="text-sm text-red-700">{generationError}</p>
                                        </div>
                                        <button
                                            onClick={() => setGenerationError("")}
                                            className="flex-shrink-0 text-red-400 hover:text-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {generationSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                            <span className="text-green-600 text-sm font-bold">✓</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-green-800 mb-1">Success</h3>
                                            <p className="text-sm text-green-700">{generationSuccess}</p>
                                        </div>
                                        <button
                                            onClick={() => setGenerationSuccess("")}
                                            className="flex-shrink-0 text-green-400 hover:text-green-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleResetForm}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm md:text-base"
                                >
                                    🔄 Reset Form
                                </button>
                                <button
                                    onClick={handleGenerateLabel}
                                    disabled={isGenerating}
                                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm md:text-base ${isGenerating ? 'bg-gray-600 cursor-wait text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
                                >
                                    <Package className="h-5 w-5" />
                                    {isGenerating ? "Generating…" : "Generate Label"}
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
                                                <p className="font-bold">{selectedCarrier.toUpperCase()}</p>
                                                <p>{selectedService || "Select a service"}</p>
                                            </div>
                                            {selectedCarrier === "UPS" && (
                                                <div className="text-right text-xs text-gray-900">
                                                    <p>KY-6-21</p>
                                                    <p className="font-bold">959</p>
                                                </div>
                                            )}
                                            {selectedCarrier === "FedEx" && (
                                                <div className="text-right text-xs text-gray-900">
                                                    <p className="font-bold">PRIORITY</p>
                                                    <p>OVERNIGHT</p>
                                                </div>
                                            )}
                                            {selectedCarrier === "USPS" && (
                                                <div className="text-right text-xs text-gray-900">
                                                    <p className="font-bold">USPS</p>
                                                    <p>PRIORITY</p>
                                                </div>
                                            )}
                                            {(selectedCarrier === "Purolator" || selectedCarrier === "Canada Post") && (
                                                <div className="text-right text-xs text-gray-900">
                                                    <p className="font-bold">CANADA</p>
                                                    <p>POST</p>
                                                </div>
                                            )}
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
                                    <button
                                        onClick={handleDownloadLabel}
                                        disabled={!lastGeneratedLabel}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 ${lastGeneratedLabel
                                            ? 'hover:bg-gray-50 cursor-pointer'
                                            : 'opacity-50 cursor-not-allowed'
                                            }`}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                    <button
                                        onClick={handlePrintLabel}
                                        disabled={!lastGeneratedLabel}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 ${lastGeneratedLabel
                                            ? 'hover:bg-gray-50 cursor-pointer'
                                            : 'opacity-50 cursor-not-allowed'
                                            }`}
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    {lastGeneratedLabel
                                        ? "Label ready! Click Download or Print above."
                                        : "Generate a label to enable download and print options."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


