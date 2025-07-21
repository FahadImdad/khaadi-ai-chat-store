import React, { useState } from 'react';
import { Product } from '../../types';
import { ShoppingCart, Heart, Star, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (options?: { color?: string; size?: string; quantity?: number }) => void;
  onOpenModal?: (product: Product) => void;
  onAskAbout?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onOpenModal, onAskAbout }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [hearted, setHearted] = useState(false);

  const getColorValue = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'White': '#FFFFFF',
      'Off White': '#F5F5DC',
      'Black': '#000000',
      'Grey': '#808080',
      'Navy': '#000080',
      'Blue': '#0000FF',
      'Light Blue': '#ADD8E6',
      'Pink': '#FFC0CB',
      'Mint Green': '#98FF98',
      'Rust Orange': '#CD853F',
      'Coral': '#FF7F50',
      'Terracotta': '#E2725B',
      'Cream': '#FFFDD0',
      'Gold': '#FFD700',
      'Silver': '#C0C0C0',
      'Rust': '#B7410E',
      'Navy Blue': '#000080',
      'Beige': '#F5F5DC',
      'Maroon': '#800000',
      'Forest Green': '#228B22',
      'Burgundy': '#800020',
      'Emerald': '#50C878',
      'Royal Blue': '#4169E1',
      'Light Green': '#90EE90',
      'Mint': '#98FF98',
      'Sage': '#9CAF88',
      'Peach': '#FFCBA4',
      'Turquoise': '#40E0D0',
      'Purple': '#800080',
      'Yellow': '#FFFF00',
      'Green': '#008000',
      'Orange': '#FFA500',
      'Amber': '#FFBF00',
      'Golden': '#FFD700',
      'Multi Color': '#FF6B6B',
      'Multi Print': '#FF6B6B',
      'Floral Multi': '#FF6B6B',
      'Bright Multi': '#FF6B6B',
      'Artistic Multi': '#FF6B6B',
      'Geometric': '#FF6B6B'
    };
    return colorMap[colorName] || '#CCCCCC';
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({ color: selectedColor, size: selectedSize, quantity });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100/50 overflow-hidden hover:shadow-xl hover:border-orange-200/50 transition-all duration-500 group relative">
      {/* Premium Badge */}
      {product.price > 10000 && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Sparkles size={12} />
          Premium
        </div>
      )}
      {/* Stock Badge */}
      {!product.inStock && (
        <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          Sold Out
        </div>
      )}
      <div className="aspect-[4/5] overflow-hidden relative bg-gradient-to-br from-stone-50 to-amber-50 cursor-pointer" onClick={() => onOpenModal && onOpenModal(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              className={`w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 ${hearted ? 'ring-2 ring-pink-400' : ''}`}
              onClick={e => { e.stopPropagation(); setHearted(h => !h); }}
              aria-label="Add to wishlist"
            >
              <Heart size={18} className={hearted ? 'text-pink-500 fill-pink-400' : 'text-stone-600'} />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-yellow-400 fill-current" />
              ))}
              <span className="text-white text-sm font-medium ml-2">4.8</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        {/* Category Badge */}
        <div className="mb-3">
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            {product.subcategory || product.category}
          </span>
        </div>
        {/* Product Name */}
        <h3
          className="font-bold text-stone-800 mb-3 leading-tight text-lg group-hover:text-orange-600 transition-colors duration-200 cursor-pointer"
          onClick={() => onOpenModal && onOpenModal(product)}
        >
          {product.name}
        </h3>
        {/* Description (now shows title) */}
        <p className="font-bold text-xl text-black mb-4 line-clamp-2 leading-relaxed">
          {product.title || product.name}
        </p>
        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-stone-800 to-orange-600 bg-clip-text text-transparent">
              {product.currency} {product.price.toLocaleString()}
            </span>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
            product.inStock
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {product.inStock ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
        {/* Colors, Sizes, Quantity */}
        <div className="space-y-3 mb-5">
          {product.colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 min-w-[50px]">Colors:</span>
              <div className="flex gap-1 flex-wrap">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors duration-200 ${selectedColor === color ? 'border-orange-500 ring-2 ring-orange-200' : 'border-stone-200'}`}
                    style={{ background: getColorValue(color) }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                  >
                    {selectedColor === color && <span className="w-2 h-2 bg-orange-500 rounded-full"></span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.sizes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 min-w-[50px]">Sizes:</span>
              <div className="flex gap-1 flex-wrap">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    className={`text-xs px-2 py-1 rounded-md border font-semibold transition-colors duration-200 ${selectedSize === size ? 'bg-orange-500 text-white border-orange-500' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-orange-50 hover:border-orange-200'}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 min-w-[50px]">Qty:</span>
            <button
              className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center border border-stone-200 hover:bg-orange-100 hover:border-orange-300 transition"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity === 1}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="text-base font-semibold w-6 text-center">{quantity}</span>
            <button
              className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center border border-stone-200 hover:bg-orange-100 hover:border-orange-300 transition"
              onClick={() => setQuantity(q => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 disabled:from-stone-300 disabled:via-stone-400 disabled:to-stone-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:cursor-not-allowed text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            <ShoppingCart size={18} />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          {/* Ask About This Button */}
          {onAskAbout && (
            <button
              onClick={() => onAskAbout(product)}
              className="w-full bg-gradient-to-r from-stone-100 to-stone-200 hover:from-stone-200 hover:to-stone-300 text-stone-700 font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm border border-stone-200 hover:border-stone-300"
            >
              <span>💬</span>
              Ask about this
            </button>
          )}
        </div>
      </div>
    </div>
  );
};