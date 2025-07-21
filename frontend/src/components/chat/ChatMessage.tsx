import React from 'react';
import { Message } from '../../types';
import { ProductCard } from './ProductCard';
import { ActionButton } from './ActionButton';
import logo from '../../assets/logo.png';
import { User } from 'lucide-react';
import Markdown from 'markdown-to-jsx';

const markdownOptions = {
  overrides: {
    img: {
      component: (props: any) => (
        <img
          {...props}
          style={{ maxWidth: '220px', maxHeight: '320px', borderRadius: '8px', margin: '8px 0' }}
          alt={props.alt}
        />
      ),
    },
  },
};

interface ChatMessageProps {
  message: Message;
  onAction?: (action: any) => void;
  onAskAbout?: (product: any) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAction, onAskAbout }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}>
      <div className={`max-w-[90%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar and Message Row */}
        <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden shadow-lg bg-white">
            {isUser ? (
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center w-full h-full">
                <User size={20} className="text-white" />
              </div>
            ) : (
              <img
                src={logo}
                alt="Khaadi"
                className="w-full h-full object-contain p-1"
              />
            )}
          </div>

          {/* Message Bubble */}
          <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.content && (
              <div
                className={`inline-block rounded-2xl px-6 py-4 max-w-full ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-stone-800 rounded-br-md border border-amber-200/50 shadow-sm'
                    : 'bg-white text-stone-700 shadow-lg border border-stone-100/50 rounded-bl-md backdrop-blur-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                  <Markdown options={markdownOptions}>{message.content}</Markdown>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className={`mt-2 text-xs text-stone-400 font-medium ${isUser ? 'text-right' : 'text-left'}`}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {Array.isArray(message.actions) && message.actions.length > 0 && (
          <div className={`mt-4 flex flex-wrap gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {message.actions.map((action, index) => {
              // Find product by productId if available
              let product = undefined;
              if (action.productId && Array.isArray(message.products)) {
                product = message.products.find(p => p.id === action.productId);
              }
              return (
                <ActionButton
                  key={index}
                  action={{ ...action, product }}
                  onClick={() => onAction?.(action)}
                />
              );
            })}
          </div>
        )}

        {/* Product Cards */}
        {Array.isArray(message.products) && message.products.length > 0 && (
          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {message.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(options) =>
                    onAction?.({
                      type: 'add_to_cart',
                      productId: product.id,
                      label: 'Add to Cart',
                      payload: options,
                    })
                  }
                  onAskAbout={onAskAbout}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
