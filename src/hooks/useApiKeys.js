import { useLocalStorage } from "./useLocalStorage";

export const useApiKeys = () => {
  const [apiKeys, setApiKeys, removeApiKeys] = useLocalStorage("voicevault_api_keys", {
    openai: "",
    elevenlabs: ""
  });

  const updateApiKey = (provider, key) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: key
    }));
  };

  const validateKeys = () => {
    const errors = {};
    
    if (!apiKeys.openai?.trim()) {
      errors.openai = "OpenAI API key is required";
    } else if (!apiKeys.openai.startsWith("sk-")) {
      errors.openai = "OpenAI API key should start with 'sk-'";
    }

    if (!apiKeys.elevenlabs?.trim()) {
      errors.elevenlabs = "ElevenLabs API key is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const hasKeys = () => {
    return apiKeys.openai?.trim() && apiKeys.elevenlabs?.trim();
  };

  return {
    apiKeys,
    updateApiKey,
    validateKeys,
    hasKeys,
    removeApiKeys
  };
};