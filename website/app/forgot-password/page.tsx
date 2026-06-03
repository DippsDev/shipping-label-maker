"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message);
            } else {
                setSuccess(true);
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                        <Package className="h-8 w-8 text-gray-900" />
                        <span className="text-2xl font-bold text-gray-900">Label Maker</span>
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Forgot your password?</h1>
                    <p className="text-gray-600">Enter your email and we will send you a reset link</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                                Check your email for a password reset link.
                            </div>
                            <Link href="/login" className="block text-sm text-gray-900 font-medium hover:underline">
                                Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Remember your password?{" "}
                    <Link href="/login" className="text-gray-900 font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
