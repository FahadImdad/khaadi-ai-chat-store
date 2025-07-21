import React from 'react';
import { ProductAction } from '../../types';
import { ShoppingCart, Eye, CreditCard, Package, ArrowRight, Sparkles } from 'lucide-react';

interface ActionButtonProps {
  action: ProductAction;
  onClick: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ action, onClick }) => {
  const getIcon = () => {
    switch (action.type) {
      case 'add_to_cart':
        return <ShoppingCart size={16} />;
      case 'view_cart':
        return <Package size={16} />;
      case 'checkout':
      case 'confirm_payment':
        return <CreditCard size={16} />;
      case 'view_details':
        return <Eye size={16} />;
      default:
        return <ArrowRight size={16} />;
    }
  };

  const getButtonStyle = () => {
    switch (action.type) {
      case 'add_to_cart':
      case 'checkout':
      case 'confirm_payment':
        return 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5';
      case 'view_cart':
        return 'bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-800 border border-amber-200/50 shadow-sm hover:shadow-md';
      default:
        return 'bg-gradient-to-r from-stone-100 to-stone-200 hover:from-stone-200 hover:to-stone-300 text-stone-700 border border-stone-200/50 shadow-sm hover:shadow-md transform hover:-translate-y-0.5';
    }
  };

  const isPrimary = ['add_to_cart', 'checkout', 'confirm_payment'].includes(action.type);

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${getButtonStyle()}`}
    >
      {/* Product image thumbnail if present */}
      {action.product && action.product.image && (
        <img
          src={action.product.image}
          alt={action.product.name}
          className="w-8 h-8 object-cover rounded-md border border-stone-200 shadow-sm mr-2"
          style={{ minWidth: 32, minHeight: 32 }}
        />
      )}
      {isPrimary && <Sparkles size={14} className="animate-pulse" />}
      {getIcon()}
      {action.label}
    </button>
  );
};