import Link from 'next/link';
import { FiShield, FiTruck, FiDollarSign, FiBarChart2 } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-bold">GRUHA</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="/public" className="hover:text-white/80 transition">Transparency</Link>
            <Link href="/about" className="hover:text-white/80 transition">About</Link>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Climate Resilience for<br />
            <span className="text-secondary-300">Indian MSMEs</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto">
            Blockchain-powered disaster relief that protects livelihoods 
            before, during, and after climate disasters
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/msme" className="btn btn-secondary text-lg">
              I'm an MSME Owner
            </Link>
            <Link href="/vendor" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg">
              I'm a Service Provider
            </Link>
          </div>
        </div>
      </header>

      {/* Portal Cards */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-display font-bold text-center mb-12">
          Access Your Portal
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* MSME Portal */}
          <Link href="/msme" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <FiShield className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">MSME Portal</h3>
              <p className="text-neutral-600">
                Register your business, receive relief tokens, book warehouses and transport
              </p>
            </div>
          </Link>

          {/* Vendor Portal */}
          <Link href="/vendor" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-4">
                <FiTruck className="w-7 h-7 text-secondary-600" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Vendor Portal</h3>
              <p className="text-neutral-600">
                Offer warehouses, transport, repair services. Get instant INR payments
              </p>
            </div>
          </Link>

          {/* Authority Portal */}
          <Link href="/authority" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-14 h-14 bg-warning-100 rounded-xl flex items-center justify-center mb-4">
                <FiDollarSign className="w-7 h-7 text-warning-600" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Authority Dashboard</h3>
              <p className="text-neutral-600">
                Declare disasters, allocate tokens, monitor spending in real-time
              </p>
            </div>
          </Link>

          {/* Public Portal */}
          <Link href="/public" className="group">
            <div className="card hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-14 h-14 bg-neutral-200 rounded-xl flex items-center justify-center mb-4">
                <FiBarChart2 className="w-7 h-7 text-neutral-600" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Transparency Portal</h3>
              <p className="text-neutral-600">
                View anonymized spending data, audit blockchain transactions
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-neutral-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            How GRUHA Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Before Disaster</h3>
              <p className="text-neutral-600">
                Receive Resilience Credits to store inventory safely before storms hit
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-warning-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">During Disaster</h3>
              <p className="text-neutral-600">
                Offline-first app with SMS fallback keeps you connected
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">After Disaster</h3>
              <p className="text-neutral-600">
                Relief Tokens help rebuild with verified vendors, zero corruption
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FiShield className="w-6 h-6" />
              <span className="text-xl font-display font-bold">GRUHA</span>
            </div>
            <p className="text-neutral-400">
              Government Relief for Unorganized Hazard Assistance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
