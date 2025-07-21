import { useState, useCallback, useEffect } from 'react';
import { Message, Product, ChatState, CartItem, ProductAction, ShippingAddress } from '../types';
import productsData from '../data/products.json';

const products = productsData as Product[];

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: '1',
        content: "Welcome to Khaadi! I'm your personal shopping assistant. I can help you discover our latest collection including unstitched fabrics, ready to wear, and accessories - all through our chat. What can I help you find today?",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'welcome',
        actions: [
          { type: 'view_details', label: 'Unstitched Collection', payload: { category: 'Unstitched' } },
          { type: 'view_details', label: 'Ready to Wear Collection', payload: { category: 'Ready to Wear' } },
          { type: 'view_details', label: 'Accessories', payload: { category: 'Accessories' } }
        ]
      }
    ],
    isTyping: false,
    currentQuery: '',
    cart: [],
    checkoutStep: 'idle'
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [city, setCity] = useState<string>("");
  const [locationPrompted, setLocationPrompted] = useState<boolean>(false);

  // Helper: Geocode city to lat/lon using Open-Meteo
  const geocodeCity = async (city: string): Promise<{ latitude: number, longitude: number } | null> => {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return {
          latitude: data.results[0].latitude,
          longitude: data.results[0].longitude
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Helper: Reverse geocode lat/lon to city using Open-Meteo
  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].name || '';
      }
      return '';
    } catch {
      return '';
    }
  };

  // On mount, try to auto-detect location
  useEffect(() => {
    if (latitude === null && longitude === null && !locationPrompted && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        () => {
          setLocationPrompted(true);
        }
      );
    }
  }, [latitude, longitude, locationPrompted]);

  // Whenever latitude/longitude change, update city
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      reverseGeocode(latitude, longitude).then(setCity);
    }
  }, [latitude, longitude]);

  const streamResponse = useCallback((fullResponse: string, onComplete: () => void) => {
    const words = fullResponse.split(' ');
    let currentIndex = 0;
    
    // Create initial message with typing indicator
    const messageId = (Date.now() + 1).toString();
    const initialMessage: Message = {
      id: messageId,
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text',
      isStreaming: true
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, initialMessage],
      isTyping: true
    }));

        // Small delay before starting to stream for natural feel
    setTimeout(() => {
      const streamInterval = setInterval(() => {
        if (currentIndex < words.length) {
          // Add next word
          const newContent = words.slice(0, currentIndex + 1).join(' ');
          
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: newContent }
                : msg
            )
          }));
          
          currentIndex++;
        } else {
          // Streaming complete
          clearInterval(streamInterval);
          setState(prev => ({
            ...prev,
            isTyping: false,
            messages: prev.messages.map(msg => 
              msg.id === messageId 
                ? { ...msg, isStreaming: false }
                : msg
            )
          }));
          onComplete();
        }
      }, 80); // Natural typing speed - adjust between 60-120ms for different feels
    }, 300); // 300ms delay before starting to type
  }, []);

  const findProducts = useCallback((query: string, aiResponse?: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    const lowercaseResponse = aiResponse?.toLowerCase() || '';
    return products.filter(product => {
      const productText = `${product.name} ${product.category} ${product.subcategory} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
      return productText.includes(lowercaseQuery) || productText.includes(lowercaseResponse);
    }).slice(0, 6);
  }, []);

  const addToCart = useCallback((productId: string, quantity = 1, selectedColor?: string, selectedSize?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setState(prev => {
      // Find if same product with same options exists
      const existingItem = prev.cart.find(item =>
        item.product.id === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
      );
      if (existingItem) {
        return {
          ...prev,
          cart: prev.cart.map(item =>
            item.product.id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        return {
          ...prev,
          cart: [...prev.cart, { product, quantity, selectedColor, selectedSize }]
        };
      }
    });
  }, []);

  const getCartTotal = useCallback(() => {
    return state.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [state.cart]);

  const generateOrderNumber = useCallback(() => `KH${Date.now().toString().slice(-8)}`, []);

  const parseAddressFromMessage = useCallback((message: string): ShippingAddress | null => {
    const lines = message.split('\n');
    const addressData: any = {};
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      const normalizedKey = key.toLowerCase().trim();
      if (normalizedKey.includes('name')) addressData.fullName = value;
      else if (normalizedKey.includes('phone')) addressData.phone = value;
      else if (normalizedKey.includes('address')) addressData.address = value;
      else if (normalizedKey.includes('city')) addressData.city = value;
      else if (normalizedKey.includes('postal')) addressData.postalCode = value;
    });
    return addressData.fullName && addressData.phone && addressData.address && addressData.city
      ? addressData as ShippingAddress
      : null;
  }, []);

  const handleAction = useCallback(async (action: ProductAction) => {
    switch (action.type) {
      case 'add_to_cart':
        if (action.productId) {
          // Accept options from payload
          const { color, size, quantity } = action.payload || {};
          addToCart(action.productId, quantity || 1, color, size);
          const product = products.find(p => p.id === action.productId);
          const cartMessage: Message = {
            id: Date.now().toString(),
            content: `✅ Added ${product?.name}${color ? ` (${color}` : ''}${size ? `, ${size}` : ''}${color || size ? ')' : ''} to your cart! Quantity: ${quantity || 1}. You now have ${state.cart.length + 1} items. Would you like to view your cart or continue shopping?`,
            sender: 'assistant',
            timestamp: new Date(),
            type: 'text',
            actions: [
              { type: 'view_cart', label: 'View Cart', payload: {} },
              { type: 'continue_shopping', label: 'Continue Shopping', payload: {} }
            ]
          };
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, cartMessage]
          }));
        }
        break;

      case 'view_cart':
        if (state.cart.length === 0) {
          const emptyCartMessage: Message = {
            id: Date.now().toString(),
            content: "Your cart is empty. Let me help you find something you'll love!",
            sender: 'assistant',
            timestamp: new Date(),
            type: 'text',
            actions: [
              { type: 'view_details', label: 'Ready to Wear Collection', payload: { category: 'Ready to Wear' } },
              { type: 'view_details', label: 'Unstitched Collection', payload: { category: 'Unstitched' } },
              { type: 'view_details', label: 'Accessories', payload: { category: 'Accessories' } }
            ]
          };
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, emptyCartMessage]
          }));
        } else {
          const cartItems = state.cart.map(item =>
            `• ${item.product.name}${item.selectedColor ? ` (${item.selectedColor}` : ''}${item.selectedSize ? `, ${item.selectedSize}` : ''}${item.selectedColor || item.selectedSize ? ')' : ''} - PKR ${item.product.price} (Qty: ${item.quantity})`
          ).join('\n');
          const cartMessage: Message = {
            id: Date.now().toString(),
            content: `🛒 **Your Cart**\n\n${cartItems}\n\n**Total: PKR ${getCartTotal()}**\n\nWhat would you like to do?`,
            sender: 'assistant',
            timestamp: new Date(),
            type: 'cart',
            actions: [
              { type: 'checkout', label: 'Proceed to Checkout', payload: {} },
              { type: 'continue_shopping', label: 'Continue Shopping', payload: {} }
            ]
          };
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, cartMessage]
          }));
        }
        break;

      case 'checkout':
        setState(prev => ({ ...prev, checkoutStep: 'address' }));
        const checkoutMessage: Message = {
          id: Date.now().toString(),
          content: `💳 **Checkout Process**\n\nPlease provide your shipping address in the following format:\n\nName: [Your Full Name]\nPhone: [Your Phone Number]\nAddress: [Your Complete Address]\nCity: [Your City]\nPostal Code: [Your Postal Code]`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'checkout'
        };
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, checkoutMessage]
        }));
        break;

      case 'view_details':
        const category = action.payload?.category?.toLowerCase();
        let categoryProducts;
        if (category === 'unstitched') {
          categoryProducts = products.filter(product =>
            product.subcategory?.toLowerCase() === 'unstitched'
          ).slice(0, 6);
        } else if (category === 'ready to wear' || category === 'ready-to-wear') {
          categoryProducts = products.filter(product =>
            product.category.toLowerCase() === 'ready-to-wear'
          ).slice(0, 6);
        } else {
          categoryProducts = products.filter(product =>
            product.category.toLowerCase() === category
          ).slice(0, 6);
        }
        if (categoryProducts.length > 0) {
          const categoryMessage: Message = {
            id: Date.now().toString(),
            content: `Here are some beautiful ${action.payload?.category} pieces for you:`,
            sender: 'assistant',
            timestamp: new Date(),
            type: 'product',
            products: categoryProducts,
            actions: [
              { type: 'view_cart', label: 'View Cart', payload: {} },
              { type: 'continue_shopping', label: 'Browse More', payload: {} }
            ]
          };
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, categoryMessage]
          }));
        } else {
          const noProductsMessage: Message = {
            id: Date.now().toString(),
            content: `I couldn't find any ${action.payload?.category} items at the moment. Would you like to browse other categories?`,
            sender: 'assistant',
            timestamp: new Date(),
            type: 'text',
            actions: [
              { type: 'view_details', label: 'Ready to Wear Collection', payload: { category: 'Ready to Wear' } },
              { type: 'view_details', label: 'Unstitched Collection', payload: { category: 'Unstitched' } },
              { type: 'view_details', label: 'Accessories', payload: { category: 'Accessories' } }
            ]
          };
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, noProductsMessage]
          }));
        }
        break;

      case 'continue_shopping':
        const shoppingMessage: Message = {
          id: Date.now().toString(),
          content: "Great! What would you like to explore today?",
          sender: 'assistant',
          timestamp: new Date(),
          type: 'text',
          actions: [
            { type: 'view_details', label: 'Ready to Wear Collection', payload: { category: 'Ready to Wear' } },
            { type: 'view_details', label: 'Unstitched Collection', payload: { category: 'Unstitched' } },
            { type: 'view_details', label: 'Accessories', payload: { category: 'Accessories' } }
          ]
        };
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, shoppingMessage]
        }));
        break;

      case 'provide_address':
        const address = action.payload as ShippingAddress;
        setState(prev => ({ 
          ...prev, 
          checkoutStep: 'payment',
          shippingAddress: address
        }));
        
        const addressConfirmMessage: Message = {
          id: Date.now().toString(),
          content: `✅ **Address Confirmed!**\n\nName: ${address.fullName}\nPhone: ${address.phone}\nAddress: ${address.address}\nCity: ${address.city}\nPostal Code: ${address.postalCode}\n\n**Order Total: PKR ${getCartTotal()}**\n\nYour order is ready! Click "Place Order" to complete your purchase.`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'checkout',
          actions: [
            { type: 'place_order', label: 'Place Order', payload: { address } }
          ]
        };
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, addressConfirmMessage]
        }));
        break;

      case 'place_order':
        const orderNumber = generateOrderNumber();
        setState(prev => ({ 
          ...prev, 
          checkoutStep: 'confirmed',
          orderNumber: orderNumber
        }));
        
        const orderConfirmMessage: Message = {
          id: Date.now().toString(),
          content: `🎉 **Order Confirmed!**\n\n**Order Number: ${orderNumber}**\n\nThank you for your purchase! Your order has been successfully placed. We'll send you a confirmation email with tracking details soon.\n\nTotal Amount: PKR ${getCartTotal()}\n\nIs there anything else I can help you with?`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'order_confirmation',
          actions: [
            { type: 'continue_shopping', label: 'Start New Shopping', payload: {} }
          ]
        };
        
        // Clear cart after successful order
        setState(prev => ({
          ...prev,
          cart: [],
          messages: [...prev.messages, orderConfirmMessage]
        }));
        break;

      default:
        console.log('Unknown action type:', action.type);
    }
  }, [state.cart, addToCart, getCartTotal, generateOrderNumber, findProducts]);

  const getConversationHistory = useCallback(() => {
    return state.messages.filter(msg => msg.type !== 'welcome').map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }, [state.messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (state.checkoutStep === 'address') {
      const address = parseAddressFromMessage(content);
      if (address) {
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          sender: 'user',
          timestamp: new Date(),
          type: 'text'
        };
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, userMessage]
        }));
        await handleAction({ type: 'provide_address', label: '', payload: address });
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      currentQuery: content,
      isTyping: true // Show TypingIndicator immediately after user message
    }));

    // If location is not set and not prompted, ask user for city
    const weatherKeywords = ["weather", "temperature", "forecast"];
    const isWeatherQuery = weatherKeywords.some(kw => content.toLowerCase().includes(kw));
    if (isWeatherQuery && (latitude === null || longitude === null) && !locationPrompted) {
      setLocationPrompted(true);
      const locationAsk: Message = {
        id: (Date.now() + 2).toString(),
        content: "🌤️ To give you weather-based advice, please enter your city (e.g., Karachi, Lahore, Islamabad):",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, locationAsk],
        isTyping: false // Hide TypingIndicator if asking for city
      }));
      return;
    }

    // If user just entered a city, geocode it and resend the original message
    if (locationPrompted && (latitude === null || longitude === null)) {
      // Try to geocode the last user message as a city
      const geo = await geocodeCity(content);
      if (geo) {
        setLatitude(geo.latitude);
        setLongitude(geo.longitude);
        setLocationPrompted(false);
        // Resend the previous message that triggered the weather request
        return sendMessage(state.currentQuery || content);
      } else {
        const failMsg: Message = {
          id: (Date.now() + 3).toString(),
          content: "⚠️ Sorry, I couldn't find that city. Please try again or enable location access.",
          sender: 'assistant',
          timestamp: new Date(),
          type: 'text'
        };
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, failMsg],
          isTyping: false // Hide TypingIndicator on error
        }));
        return;
      }
    }

    try {
      const contextualPrompt = `${content}\n\nContext: User has ${state.cart.length} items in cart. Checkout step: ${state.checkoutStep}`;
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${API_BASE}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: contextualPrompt, latitude, longitude, chat_history: getConversationHistory() })
      });

      const data = await response.json();
      const aiResponse = typeof data?.reply === 'string' ? data.reply.trim() : '';

      if (!aiResponse || aiResponse.startsWith("⚠️")) {
        throw new Error(aiResponse || "Empty response from assistant.");
      }

      const relevantProducts = findProducts(content, aiResponse);

      // Stream the response
      streamResponse(aiResponse, () => {
        // After streaming is complete, add products and actions if any
        if (relevantProducts.length > 0) {
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.isStreaming
                ? {
                    ...msg,
                    type: 'product',
                    products: relevantProducts,
                    actions: [
                      { type: 'view_cart', label: 'View Cart', payload: {} },
                      { type: 'continue_shopping', label: 'Browse More', payload: {} }
                    ]
                  }
                : msg
            )
          }));
        }
      });
    } catch (error) {
      console.error("💥 AI Error:", error);

      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `⚠️ ${(error as any).message || "Sorry, no response from assistant."}`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, fallbackMessage],
        isTyping: false // Hide TypingIndicator on error
      }));
    }
  }, [streamResponse, findProducts, getConversationHistory, state.cart.length, state.checkoutStep, parseAddressFromMessage, handleAction, latitude, longitude, locationPrompted]);

  const askAboutProduct = useCallback((product: Product) => {
    const question = `Tell me more about ${product.name}. What are the available colors and sizes? Is it suitable for ${product.category.toLowerCase()} occasions?`;
    sendMessage(question);
  }, [sendMessage]);

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    sendMessage,
    handleAction,
    askAboutProduct,
    cart: state.cart,
    cartTotal: getCartTotal(),
    checkoutStep: state.checkoutStep,
    isAIConfigured: true,
    latitude,
    longitude,
    city,
    setLatitude,
    setLongitude,
    setCity,
    locationPrompted
  };
};
