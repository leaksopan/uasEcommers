# 📸 E-Commerce Photobox Application

Aplikasi e-commerce untuk layanan cetak foto dan photobox premium dengan teknologi React + Vite + Supabase.

## ✨ Fitur Utama

- 🔐 **Authentication System** - Login/Register dengan role-based access
- 👨‍💼 **Admin Dashboard** - Kelola produk dan pesanan
- 🛒 **Shopping Cart** - Keranjang belanja dengan real-time update
- 📦 **Product Management** - CRUD operations untuk produk
- 📋 **Order Management** - Sistem manajemen pesanan
- 📱 **Responsive Design** - UI modern dengan TailwindCSS
- 📸 **Photo Upload** - Upload foto custom untuk photobox
- 🗄️ **Database Integration** - Backend dengan Supabase

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: TailwindCSS 4.1
- **Routing**: React Router DOM 7.6
- **Backend**: Supabase
- **State Management**: Context API + useReducer
- **Authentication**: Supabase Auth
- **Linting**: ESLint

## 🚀 Cara Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/leaksopan/uasEcommers.git
cd uasEcommers
```

### 2. Install Dependencies

```bash
npm install
```

### 3. ⚠️ **PENTING: Konfigurasi Supabase**

Sebelum menjalankan aplikasi, Anda **HARUS** mengubah konfigurasi Supabase:

1. Buka file `src/services/supabase.js`
2. Ganti URL dan API Key dengan milik Anda:

```javascript
// GANTI DENGAN KONFIGURASI SUPABASE ANDA
const supabaseUrl = "https://your-project-id.supabase.co";
const supabaseKey = "your-anon-key-here";
```

**Cara mendapatkan URL dan Key Supabase:**

1. Daftar di [supabase.com](https://supabase.com)
2. Buat project baru
3. Di dashboard project, pilih **Settings** → **API**
4. Copy **Project URL** dan **anon public** key

### 4. Setup Database Schema

Import dari foldr database

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 👤 Akun Demo

### Admin Account

- Email: `admin@photobox.com`
- Password: `admin123`

### Customer Account

- Daftar akun baru atau gunakan akun yang sudah dibuat

## 📁 Struktur Project

```
src/
├── components/
│   ├── common/          # Komponen umum (Navigation, ProtectedRoute)
│   └── ui/              # UI components (Button, Card, dll)
├── contexts/            # React Context (Auth, Cart)
├── hooks/               # Custom hooks
├── pages/               # Halaman aplikasi
│   ├── Admin/           # Dashboard admin
│   ├── Auth/            # Login/Register
│   ├── Cart/            # Keranjang belanja
│   └── Home/            # Halaman utama
├── services/            # API services
│   ├── supabase.js      # ⚠️ KONFIGURASI UTAMA
│   ├── productService.js
│   └── adminService.js
└── utils/               # Utility functions
```

## 🔧 Konfigurasi Penting

### File yang Perlu Diubah:

1. **`src/services/supabase.js`** - URL dan API Key Supabase
2. **Database Schema** - Setup tabel di Supabase

### Environment Variables (Opsional):

Anda bisa membuat file `.env` untuk menyimpan konfigurasi:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Kemudian ubah `supabase.js`:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 📦 Build Production

```bash
npm run build
```

## 🤝 Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Project ini dibuat untuk keperluan UAS (Ujian Akhir Semester).

## ⚠️ Disclaimer

**PENTING**: Aplikasi ini menggunakan konfigurasi Supabase demo. Untuk penggunaan production:

1. Ganti dengan konfigurasi Supabase Anda sendiri
2. Setup proper database schema
3. Konfigurasi RLS (Row Level Security) policies
4. Setup email templates untuk authentication

---

**Happy Coding!** 🚀
