import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useCartStore } from '../stores/cartStore';
import { MenuCard } from '../components/MenuCard';
import { ModelViewer } from '../components/ModelViewer';
import { fetchMenus } from '../services/api';
import { MenuItem } from '../types';

const mockMenus: MenuItem[] = [
  {
    id: 'menu_001',
    name: 'Nasi Goreng Sudi Moro',
    description: 'Nasi goreng spesial dengan telur dan ayam',
    price: 35000,
    category: 'food',
    stockStatus: 'available',
    isActive: true,
    glbModelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
  },
  {
    id: 'menu_002',
    name: 'Mie Ayam Bakso',
    description: 'Mie ayam dengan bakso homemade',
    price: 32000,
    category: 'food',
    stockStatus: 'available',
    isActive: true,
  },
  {
    id: 'menu_101',
    name: 'Es Teh Manis',
    description: 'Teh manis dingin',
    price: 8000,
    category: 'beverage',
    stockStatus: 'available',
    isActive: true,
    glbModelUrl: 'https://modelviewer.dev/shared-assets/models/WaterBottle.glb',
  },
  {
    id: 'menu_102',
    name: 'Kopi Susu',
    description: 'Kopi susu hangat',
    price: 18000,
    category: 'beverage',
    stockStatus: 'available',
    isActive: true,
  },
  {
    id: 'menu_201',
    name: 'Pisang Goreng',
    description: 'Pisang goreng renyah',
    price: 15000,
    category: 'snack',
    stockStatus: 'available',
    isActive: true,
  },
];

export function MenuPage() {
  const navigate = useNavigate();
  const socket = useSocket();
  const addItem = useCartStore((s) => s.addItem);
  const itemCount = useCartStore((s) => s.itemCount());
  const setSession = useCartStore((s) => s.setSession);

  const [menus, setMenus] = useState<MenuItem[]>(mockMenus);
  const [category, setCategory] = useState<'all' | 'food' | 'beverage' | 'snack'>('all');
  const [arItem, setArItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Set default session for demo (in real app, this comes from entry/gps flow)
  useEffect(() => {
    setSession({
      sessionId: 'sess_demo_001',
      tableId: 'table_04',
      tableNumber: '04',
      role: 'host',
      hostToken: 'host_demo_token',
    });
  }, [setSession]);

  // Load menus from API on mount
  useEffect(() => {
    setLoading(true);
    fetchMenus()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMenus(data);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat menu dari API, menggunakan mock data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Real-time stock update via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleStockUpdate = (data: { menuId: string; stockStatus: 'available' | 'sold_out' }) => {
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === data.menuId ? { ...menu, stockStatus: data.stockStatus } : menu
        )
      );
    };

    socket.on('menu:stock_updated', handleStockUpdate);

    return () => {
      socket.off('menu:stock_updated', handleStockUpdate);
    };
  }, [socket]);

  const filteredMenus = category === 'all' ? menus : menus.filter((m) => m.category === category);

  const handleAddToCart = (menu: MenuItem) => {
    const session = useCartStore.getState().session;
    if (!session) return;
    addItem(menu, session.role);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-20">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-xl font-bold">Menu Sudi Moro</h1>
            <p className="text-sm text-gray-500">
              Meja 04 • Host
            </p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="bg-primary text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 active:scale-95 transition-transform"
          >
            🛒 {itemCount}
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(['all', 'food', 'beverage', 'snack'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                category === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat === 'food' ? 'Makanan' : cat === 'beverage' ? 'Minuman' : 'Cemilan'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat menu...</p>
        </div>
      )}

      {/* Menu Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredMenus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            onAdd={handleAddToCart}
            onViewAr={setArItem}
          />
        ))}
      </div>

      {/* Floating Cart Button */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
        <button
          onClick={() => navigate('/cart')}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
        >
          🛒 Lihat Keranjang ({itemCount})
        </button>
      </div>

      {/* AR Modal */}
      {arItem && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setArItem(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-80">
              {arItem.glbModelUrl ? (
                <ModelViewer src={arItem.glbModelUrl} alt={arItem.name} />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                  Model 3D belum tersedia untuk menu ini
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg">{arItem.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{arItem.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleAddToCart(arItem);
                    setArItem(null);
                  }}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold active:scale-95 transition-transform"
                >
                  Tambah ke Keranjang
                </button>
                <button
                  onClick={() => setArItem(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
