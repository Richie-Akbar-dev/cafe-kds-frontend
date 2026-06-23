import { MenuItem } from '../types';

interface MenuCardProps {
  menu: MenuItem;
  onAdd: (menu: MenuItem) => void;
  onViewAr: (menu: MenuItem) => void;
}

export function MenuCard({ menu, onAdd, onViewAr }: MenuCardProps) {
  const isSoldOut = menu.stockStatus === 'sold_out';
  const categoryEmoji = menu.category === 'beverage' ? '🍵' : menu.category === 'snack' ? '🍿' : '🍽️';

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm relative ${
        isSoldOut ? 'opacity-50 grayscale-[0.4]' : ''
      }`}
    >
      {isSoldOut && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            SOLD OUT
          </span>
        </div>
      )}

      <div className="h-28 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl">
        {categoryEmoji}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight">{menu.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{menu.description}</p>
        <p className="text-primary-dark font-bold mt-2">
          Rp {menu.price.toLocaleString('id-ID')}
        </p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onViewAr(menu)}
            disabled={isSoldOut}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 active:scale-95 transition-transform"
          >
            3D/AR
          </button>
          <button
            onClick={() => onAdd(menu)}
            disabled={isSoldOut}
            className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-50 active:scale-95 transition-transform"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
