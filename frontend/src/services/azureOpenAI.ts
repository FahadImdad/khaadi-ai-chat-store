export const azureOpenAIService = {
  async generateResponse(message: string) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", res.status, errorText);
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("AI response:", data);
      return data.reply || "⚠️ No reply received.";
    } catch (error) {
      console.error("Fetch error:", error);
      return "⚠️ I'm having trouble responding right now. Please try again.";
    }
  },

  isConfigured() {
    return !!import.meta.env.VITE_API_BASE_URL;
  }
};
