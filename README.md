# Sudi Moro Customer PWA (React + Vite + Tailwind)

Aplikasi React PWA untuk pelanggan Kafe Sudi Moro. Dibangun dari ekstraksi demo HTML/JS sebelumnya.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Zustand (state management)
- Socket.io Client (real-time)
- Axios
- Google model-viewer (WebAR)

## Fitur

- **MenuPage.tsx**: Daftar menu dengan filter kategori, status `sold_out` real-time, dan AR view.
- **CartPage.tsx**: Shared cart Host/Guest, konfirmasi pesanan mengarahkan ke halaman pembayaran e-wallet (redirect URL ala By.U), bukan QRIS.

## Run Development

```bash
npm install
cp .env.example .env
npm run dev
```

Buka: `http://localhost:5173/menu`

## Environment Variables

| Variable | Keterangan |
|----------|------------|
| `VITE_API_URL` | URL backend API |
| `VITE_SOCKET_URL` | URL backend untuk WebSocket |
| `VITE_CAFE_GEOFENCE_RADIUS` | Radius geofence dalam meter |

## Build Production

```bash
npm run build
```

Output di `dist/` siap deploy ke Vercel/Netlify.

## E-Wallet Redirect Flow

1. Pelanggan menambah menu ke keranjang.
2. Host klik "Bayar & Pesan".
3. Browser mengambil GPS koordinat.
4. Frontend kirim order ke backend.
5. Backend validasi geofencing dan membuat order.
6. Backend mengembalikan `paymentRedirectUrl`.
7. Frontend redirect browser pelanggan ke `paymentRedirectUrl`.
8. Pelanggan menyelesaikan pembayaran di halaman e-wallet.

## Catatan

- Session saat ini menggunakan default demo. Nantinya akan diintegrasikan dengan entry flow (QR scan + GPS permission).
- WebAR menggunakan placeholder model 3D publik. Ganti `glbModelUrl` dengan model asli kafe.
