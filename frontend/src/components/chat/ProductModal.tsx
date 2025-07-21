import React, { useState } from 'react';
import { Product } from '../../types';
import { ShoppingCart, Heart, Star, X } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (options: { color?: string; size?: string; quantity?: number }) => void;
  onAskAbout: (product: Product) => void;
}

const sampleReviews = [
  { user: 'Ayesha', rating: 5, comment: 'Beautiful fabric and perfect fit!' },
  { user: 'Sara', rating: 4, comment: 'Loved the color and embroidery.' },
  { user: 'Fatima', rating: 5, comment: 'Great quality, will buy again.' },
];

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart, onAskAbout }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [hearted, setHearted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const getColorValue = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'White': '#FFFFFF', 'Off White': '#F5F5DC', 'Black': '#000000', 'Grey': '#808080', 'Navy': '#000080',
      'Blue': '#0000FF', 'Light Blue': '#ADD8E6', 'Pink': '#FFC0CB', 'Mint Green': '#98FF98', 'Rust Orange': '#CD853F',
      'Coral': '#FF7F50', 'Terracotta': '#E2725B', 'Cream': '#FFFDD0', 'Gold': '#FFD700', 'Silver': '#C0C0C0',
      'Rust': '#B7410E', 'Navy Blue': '#000080', 'Beige': '#F5F5DC', 'Maroon': '#800000', 'Forest Green': '#228B22',
      'Burgundy': '#800020', 'Emerald': '#50C878', 'Royal Blue': '#4169E1', 'Light Green': '#90EE90', 'Mint': '#98FF98',
      'Sage': '#9CAF88', 'Peach': '#FFCBA4', 'Turquoise': '#40E0D0', 'Purple': '#800080', 'Yellow': '#FFFF00',
      'Green': '#008000', 'Orange': '#FFA500', 'Amber': '#FFBF00', 'Golden': '#FFD700', 'Multi Color': '#FF6B6B',
      'Multi Print': '#FF6B6B', 'Floral Multi': '#FF6B6B', 'Bright Multi': '#FF6B6B', 'Artistic Multi': '#FF6B6B', 'Geometric': '#FF6B6B'
    };
    return colorMap[colorName] || '#CCCCCC';
  };

  const handleAddToCart = async () => {
    setAdding(true);
    setAdded(false);
    await new Promise(res => setTimeout(res, 600));
    onAddToCart({ color: selectedColor, size: selectedSize, quantity });
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-hidden animate-fadeIn">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-100 hover:bg-orange-100 transition">
          <X size={20} />
        </button>
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/2 bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-6">
            <img src={product.image} alt={product.name} className="w-full h-auto max-h-80 object-contain rounded-xl shadow" />
          </div>
          {/* Details */}
          <div className="md:w-1/2 p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">{product.name}</h2>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 mb-2">
              {product.subcategory || product.category}
            </span>
            <p className="text-stone-600 text-sm mb-2">{product.description}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-stone-800 to-orange-600 bg-clip-text text-transparent">
                {product.currency} {product.price.toLocaleString()}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${product.inStock ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {product.inStock ? 'In Stock' : 'Sold Out'}
              </span>
            </div>
            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
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
            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
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
            {/* Quantity */}
            <div className="flex items-center gap-2 mb-2">
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
            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || adding}
                className={`flex-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl ${!product.inStock ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {adding ? 'Adding...' : added ? 'Added!' : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button
                onClick={() => onAskAbout(product)}
                className="flex-1 bg-gradient-to-r from-stone-100 to-stone-200 hover:from-stone-200 hover:to-stone-300 text-stone-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm border border-stone-200 hover:border-stone-300"
              >
                <span>💬</span> Ask about this
              </button>
              <button
                onClick={() => setHearted(h => !h)}
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${hearted ? 'border-pink-400 bg-pink-50' : 'border-stone-200 bg-white'} transition`}
                aria-label="Add to wishlist"
              >
                <Heart size={22} className={hearted ? 'text-pink-500 fill-pink-400' : 'text-stone-600'} />
              </button>
            </div>
            {/* Reviews */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
                <span className="text-stone-700 text-sm font-semibold ml-2">4.8 (23 reviews)</span>
              </div>
              <div className="space-y-2 mt-2">
                {sampleReviews.map((review, idx) => (
                  <div key={idx} className="bg-stone-50 rounded-lg p-2 text-xs text-stone-700">
                    <span className="font-bold text-orange-600">{review.user}:</span> {review.comment}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 