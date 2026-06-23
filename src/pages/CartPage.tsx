import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { createOrder } from '../services/api';
import { OrderItemInput } from '../types';

export function CartPage() {
  const navigate = useNavigate();
  const session = useCartStore((s) => s.session);
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const itemCount = useCartStore((s) => s.itemCount());
  const clearCart = useCartStore((s) => s.clearCart);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/menu');
    }
  }, [session, navigate]);

  const isHost = session?.role === 'host';
  const canOrder = isHost && items.length > 0;

  const handlePlaceOrder = async () => {
    if (!canOrder || !session) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get real GPS coordinates
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const orderItems: OrderItemInput[] = items.map((item) => ({
        menuId: item.menuId,
        menuName: item.name,
        price: item.price,
        qty: item.qty,
      }));

      const response = await createOrder({
        tableNumber: session.tableNumber,
        items: orderItems,
        customerLatitude: latitude,
        customerLongitude: longitude,
      });

      if (response.success && response.data.paymentRedirectUrl) {
        // Clear cart and redirect to external payment page (ala By.U)
        clearCart();
        window.location.href = response.data.paymentRedirectUrl;
      } else {
        setError('Gagal mendapatkan URL pembayaran');
      }
    } catch (err: any) {
      if (err?.code === 1) {
        setError('Izin lokasi ditolak. Aktifkan GPS untuk memesan.');
      } else if (err?.response?.status === 403) {
        setError('Anda berada di luar radius kafe. Tidak bisa memesan.');
      } else {
        setError(err?.message || 'Terjadi kesalahan saat membuat pesanan');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4 flex-1">
        <div className="mb-4">
          <h1 className="text-xl font-bold">Keranjang Bersama</h1>
          <p className="text-sm text-gray-500">
            Meja {session.tableNumber} • {itemCount} item
          </p>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Keranjang masih kosong
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.menuId}
                  className="flex gap-3 border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.qty} x Rp {item.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-primary-dark font-bold text-sm mt-1">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </p>
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${
                        item.addedBy === 'host'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.addedBy === 'host' ? 'Ditambahkan Host' : 'Ditambahkan Guest'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center mb-4">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-2xl text-primary-dark">
            Rp {total.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Notices */}
        {!isHost && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
            ⚠️ Hanya Host yang dapat mengkonfirmasi pesanan.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={!canOrder || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg ${
            canOrder && !isSubmitting
              ? 'bg-primary text-white active:scale-95 transition-transform'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting
            ? 'Memproses...'
            : isHost
            ? 'Bayar & Pesan'
            : 'Hanya Host yang Bisa Bayar & Pesan'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Tombol ini akan mengarahkan ke halaman pembayaran e-wallet (GoPay/Dana/OVO).
        </p>
      </div>
    </div>
  );
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser tidak mendukung geolocation'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });
  });
}
