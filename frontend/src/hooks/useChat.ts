import { useState, useCallback, useEffect } from 'react';
import { Message, Product, ChatState, ProductAction, ShippingAddress } from '../types';

// ADD: Fetch products from backend API
const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch('http://localhost:8000/api/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

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
    cart: [], // Will be ignored
    checkoutStep: 'idle'
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [city, setCity] = useState<string>("");
  const [locationPrompted, setLocationPrompted] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

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

    setTimeout(() => {
      const streamInterval = setInterval(() => {
        if (currentIndex < words.length) {
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
      }, 80);
    }, 300);
  }, []);

  const findProducts = useCallback((query: string, aiResponse?: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    const lowercaseResponse = aiResponse?.toLowerCase() || '';
    return products.filter(product => {
      const productText = `${product.name} ${product.category} ${product.subcategory} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
      return productText.includes(lowercaseQuery) || productText.includes(lowercaseResponse);
    }).slice(0, 6);
  }, [products]);

  const handleAction = useCallback(async (action: ProductAction) => {
    switch (action.type) {
      case 'view_details':
        const category = action.payload?.category?.toLowerCase();
        let categoryProducts;
        if (category === 'unstitched') {
          categoryProducts = products.filter(product =>
            product.tags.map(t => t.toLowerCase()).includes('unstitched')
          ).slice(0, 6);
        } else if (category === 'ready to wear' || category === 'ready-to-wear') {
          categoryProducts = products.filter(product =>
            product.tags.map(t => t.toLowerCase()).includes('ready-to-wear')
          ).slice(0, 6);
        } else if (category === 'accessories') {
          categoryProducts = products.filter(product =>
            product.tags.map(t => t.toLowerCase()).includes('accessories')
          ).slice(0, 6);
        } else {
          categoryProducts = products.filter(product =>
            product.tags.map(t => t.toLowerCase()).includes(category)
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
              { type: 'view_details', label: 'Browse More', payload: {} }
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
      default:
        console.log('Unknown action type:', action.type);
    }
  }, [products]);

  const getConversationHistory = useCallback(() => {
    return state.messages.filter(msg => msg.type !== 'welcome').map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }, [state.messages]);

  const sendMessage = useCallback(async (content: string) => {
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
      isTyping: true
    }));

    try {
      const contextualPrompt = `${content}`;
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
                      { type: 'view_details', label: 'Browse More', payload: {} }
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
        isTyping: false
      }));
    }
  }, [streamResponse, findProducts, getConversationHistory, latitude, longitude]);

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
    latitude,
    longitude,
    city,
    setLatitude,
    setLongitude,
    setCity,
    locationPrompted
  };
};
