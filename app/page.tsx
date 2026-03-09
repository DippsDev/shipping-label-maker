import Link from "next/link";
import { Package, Truck, Zap, Shield, Users, CreditCard, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-gray-900" />
            <span className="text-base md:text-lg font-semibold text-gray-900">Label Maker Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Link href="/login" className="bg-gray-900 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm md:text-base">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Create Shipping Labels<br />In Seconds
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Professional shipping label generation for UPS, FedEx, USPS, Purolator, and Canada Post. Fast, reliable, and affordable.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login" className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Start Creating Labels
          </Link>
          <Link href="/features" className="text-gray-900 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Supported Carriers */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Supported Carriers</h2>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg">
            UPS
          </div>
          <div className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg">
            FedEx
          </div>
          <div className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg">
            USPS
          </div>
          <div className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg">
            Purolator
          </div>
          <div className="bg-red-500 text-white px-8 py-4 rounded-lg font-semibold text-lg">
            Canada Post
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">Why Choose Label Maker Pro?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg">
              <Truck className="h-12 w-12 text-gray-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Carrier Support</h3>
              <p className="text-gray-600">
                Generate labels for UPS, FedEx, USPS, Purolator, and Canada Post from one platform.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <Zap className="h-12 w-12 text-gray-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Generation</h3>
              <p className="text-gray-600">
                Create professional shipping labels in seconds. No waiting, no delays.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <Shield className="h-12 w-12 text-gray-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security and encryption.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <Users className="h-12 w-12 text-gray-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Management</h3>
              <p className="text-gray-600">
                Add team members, set permissions, and manage access from one dashboard.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <CreditCard className="h-12 w-12 text-gray-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pay As You Go</h3>
              <p className="text-gray-600">
                Top up your wallet and pay only for the labels you create. No monthly minimums.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <BookOpen className="h-12 w-12 text-gray-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Address Book</h3>
              <p className="text-gray-600">
                Save frequently used addresses for faster label creation. Never type the same address twice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Create your account today and start generating professional shipping labels in minutes.
          </p>
          <Link href="/signup" className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-gray-600">
          <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 md:h-5 md:w-5 text-gray-900" />
              <span className="text-gray-900 font-semibold text-xs md:text-sm">Label Maker Pro</span>
            </div>
            <span className="md:ml-2 text-xs md:text-sm">© 2025 Label Maker Pro. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link href="/support" className="hover:text-gray-900 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
