import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/common/Navigation.jsx'

const Home = () => {
  const { user, userProfile, loading, profileLoading } = useAuth()
  const navigate = useNavigate()

  const handleOrderNow = () => {
    if (user) {
      navigate('/catalog')
    } else {
      navigate('/login')
    }
  }

  const features = [
    {
      icon: "📦",
      title: "Photobox Premium",
      description: "Cetak foto berkualitas tinggi dalam kotak eksklusif dengan desain custom sesuai keinginan Anda"
    },
    {
      icon: "📸",
      title: "Cetak Foto Profesional", 
      description: "Teknologi cetak terdepan dengan hasil tajam, warna akurat, dan tahan lama"
    },
    {
      icon: "🎨",
      title: "Desain Custom",
      description: "Personalisasi photobox dan layout foto sesuai tema acara atau momen spesial Anda"
    },
    {
      icon: "🚚",
      title: "Pengiriman Cepat",
      description: "Layanan pengiriman ekspres ke seluruh Indonesia dengan kemasan aman dan rapi"
    },
    {
      icon: "💎",
      title: "Kualitas Premium",
      description: "Menggunakan kertas foto berkualitas tinggi dan tinta original untuk hasil terbaik"
    },
    {
      icon: "🛡️",
      title: "Garansi Kepuasan",
      description: "Jaminan kualitas 100% atau uang kembali. Kepuasan Anda adalah prioritas kami"
    }
  ]

  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "Photobox untuk wedding saya sangat sempurna! Kualitas cetak luar biasa dan packagingnya elegan banget."
    },
    {
      name: "Ahmad R.", 
      rating: 5,
      text: "Pelayanan cepat, hasil memuaskan. Sudah order beberapa kali untuk kebutuhan kantor, selalu puas!"
    },
    {
      name: "Linda K.",
      rating: 5,
      text: "Custom photobox untuk ultah anak jadi kenang-kenangan yang berharga. Highly recommended!"
    }
  ]

  const galleryImages = [
    {
      title: "Wedding Photobox",
      description: "Elegant wedding memory collection",
      image: "🎊"
    },
    {
      title: "Baby Photobox", 
      description: "Precious moments collection",
      image: "👶"
    },
    {
      title: "Corporate Photobox",
      description: "Professional event documentation", 
      image: "🏢"
    },
    {
      title: "Birthday Photobox",
      description: "Celebration memory keeper",
      image: "🎂"
    }
  ]

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin'

  // Show loading if needed
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      
      {/* Admin Quick Access Bar - Only show for admin users */}
      {user && isAdmin && (
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Mode Administrator</span>
              {profileLoading && <span className="text-red-200 text-sm">(memuat...)</span>}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
                aria-label="Buka dashboard admin"
              >
                📊 Dashboard Admin
              </button>
              <button
                onClick={() => navigate('/admin/products')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
                aria-label="Kelola produk"
              >
                📦 Kelola Produk
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
                aria-label="Kelola pesanan"
              >
                📋 Kelola Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full" style={{ 
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23d6d3d1\" fillOpacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" 
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* User Welcome Message - Only show if logged in */}
            {user && (
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-stone-200 text-stone-800 border border-stone-300">
                  <span className="mr-2">👋</span>
                  Halo, {userProfile?.full_name || user.email || 'User'}!
                  {isAdmin && <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">ADMIN</span>}
                </span>
              </div>
            )}
            
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                <span className="mr-2">✨</span>
                Premium Photo Printing Service
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-stone-900 mb-6 leading-tight">
              <span className="block">Photobox &</span>
              <span className="block bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                Cetak Foto Online
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Wujudkan kenangan berharga Anda dalam photobox eksklusif dan cetak foto berkualitas premium. 
              Teknologi terdepan, hasil profesional, kepuasan terjamin.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleOrderNow}
                className="group bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2"
                aria-label="Pesan photobox atau cetak foto sekarang"
              >
                <span className="flex items-center">
                  🛍️ Pesan Sekarang
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </button>
              
              <button
                onClick={() => navigate('/catalog')}
                className="group border-2 border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-stone-500 focus:ring-offset-2"
                aria-label="Lihat katalog produk kami"
              >
                <span className="flex items-center">
                  👁️ Lihat Katalog
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-900 mb-2">10K+</div>
                <div className="text-stone-600">Pelanggan Puas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-900 mb-2">50K+</div>
                <div className="text-stone-600">Foto Dicetak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-900 mb-2">24/7</div>
                <div className="text-stone-600">Customer Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-900 mb-2">99%</div>
                <div className="text-stone-600">Kepuasan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Kami memberikan layanan terbaik dengan teknologi canggih dan dedikasi tinggi untuk setiap pelanggan
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-stone-50 hover:bg-white p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-stone-200 hover:border-amber-200"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-stone-900 mb-3 group-hover:text-amber-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-stone-100 to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Galeri Produk Kami
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Lihat berbagai jenis photobox dan hasil cetak foto berkualitas tinggi yang telah kami buat
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((item, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-stone-200 hover:border-amber-200"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.image}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-stone-600 text-sm">
                  {item.description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Apa Kata Pelanggan Kami
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Kepuasan pelanggan adalah kesuksesan kami. Dengarkan pengalaman mereka dengan layanan kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-stone-50 p-8 rounded-2xl border border-stone-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-500 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-stone-700 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="font-semibold text-stone-900">
                  {testimonial.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Mewujudkan Kenangan Berharga Anda?
          </h2>
          <p className="text-xl text-stone-300 mb-10 leading-relaxed">
            Jangan biarkan momen berharga hanya tersimpan di galeri digital. 
            Wujudkan dalam photobox eksklusif atau cetak foto berkualitas premium sekarang juga!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleOrderNow}
              className="group bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-stone-900 px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2"
              aria-label="Mulai pesan photobox atau cetak foto"
            >
              <span className="flex items-center">
                🚀 Mulai Pesan Sekarang
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
            
            <button
              onClick={() => navigate('/about')}
              className="group border-2 border-stone-500 hover:border-stone-400 text-stone-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-stone-500 focus:ring-offset-2"
              aria-label="Pelajari lebih lanjut tentang layanan kami"
            >
              <span className="flex items-center">
                📞 Hubungi Kami
              </span>
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-stone-700">
            <p className="text-stone-400 text-sm">
              💝 Promo Special: Diskon 20% untuk pemesanan pertama! • 🚚 Gratis ongkir untuk minimal order 500rb
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-stone-900 mb-4">
              Photobox & Cetak Foto Online
            </h3>
            <p className="text-stone-600 mb-6">
              Wujudkan kenangan berharga dalam kualitas premium
            </p>
            <div className="flex justify-center space-x-6 text-stone-500">
              <span>📧 info@photobox.com</span>
              <span>📱 +62 812-3456-7890</span>
              <span>🕒 24/7 Customer Support</span>
            </div>
            <div className="mt-8 pt-8 border-t border-stone-200 text-stone-500 text-sm">
              © 2024 Photobox & Cetak Foto Online. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home 