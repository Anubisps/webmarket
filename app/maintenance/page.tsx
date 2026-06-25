export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="max-w-md text-center rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-lg">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Under Maintenance
        </h1>
        <p className="text-gray-400 mb-6">We&apos;re performing scheduled maintenance. Please check back shortly.</p>
        <p className="text-sm text-gray-500">Admin access remains available at /accessadmin</p>
      </div>
    </div>
  )
}
