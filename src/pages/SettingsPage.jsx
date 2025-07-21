import { useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { useApiKeys } from "@/hooks/useApiKeys";
import { cn } from "@/utils/cn";

const SettingsPage = () => {
  const { apiKeys, updateApiKey, validateKeys, removeApiKeys } = useApiKeys();
  const [activeTab, setActiveTab] = useState("api");
  const [localKeys, setLocalKeys] = useState({ ...apiKeys });
  const [showKeys, setShowKeys] = useState({ openai: false, elevenlabs: false });
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: "api", label: "API Configuration", icon: "Key" },
    { id: "preferences", label: "Preferences", icon: "Settings" },
    { id: "data", label: "Data Management", icon: "Database" }
  ];

  const handleSaveKeys = async () => {
    setSaving(true);
    
    try {
      // Validate keys
      const validation = validateKeys();
      if (!validation.isValid) {
        Object.values(validation.errors).forEach(error => {
          toast.error(error);
        });
        return;
      }

      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save keys
      updateApiKey("openai", localKeys.openai);
      updateApiKey("elevenlabs", localKeys.elevenlabs);
      
      toast.success("API keys saved successfully!");
    } catch (error) {
      toast.error("Failed to save API keys. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      return;
    }

    try {
      removeApiKeys();
      localStorage.clear();
      toast.success("All data cleared successfully!");
    } catch (error) {
      toast.error("Failed to clear data. Please try again.");
    }
  };

  const toggleKeyVisibility = (provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const ApiKeyInput = ({ provider, label, placeholder, value }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <Input
          type={showKeys[provider] ? "text" : "password"}
          value={value}
          onChange={(e) => setLocalKeys(prev => ({
            ...prev,
            [provider]: e.target.value
          }))}
          placeholder={placeholder}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => toggleKeyVisibility(provider)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        >
          <ApperIcon name={showKeys[provider] ? "EyeOff" : "Eye"} size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-white/60">
        <ApperIcon 
          name={value ? "CheckCircle2" : "AlertCircle"} 
          size={12} 
          className={value ? "text-success" : "text-warning"} 
        />
        <span>{value ? "Key configured" : "Key required"}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/70">Configure your VoiceVault AI experience</p>
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex items-center gap-1 mb-6 bg-white/5 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <ApperIcon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "api" && (
            <div className="space-y-6">
              <div className="grid gap-6">
                <div className="glass rounded-lg p-6 border border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <ApperIcon name="Bot" size={20} className="text-primary" />
                    <h3 className="text-lg font-semibold text-white">OpenAI Configuration</h3>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    Required for transcription (Whisper) and AI analysis (GPT). Get your API key from 
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:text-primary/80 ml-1">
                      OpenAI Platform
                    </a>
                  </p>
                  <ApiKeyInput
                    provider="openai"
                    label="OpenAI API Key"
                    placeholder="sk-..."
                    value={localKeys.openai}
                  />
                </div>

                <div className="glass rounded-lg p-6 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <ApperIcon name="Mic" size={20} className="text-secondary" />
                    <h3 className="text-lg font-semibold text-white">ElevenLabs Configuration</h3>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    Required for advanced voice analysis and speaker separation. Get your API key from 
                    <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer" 
                       className="text-secondary hover:text-secondary/80 ml-1">
                      ElevenLabs
                    </a>
                  </p>
                  <ApiKeyInput
                    provider="elevenlabs"
                    label="ElevenLabs API Key"
                    placeholder="Enter your ElevenLabs API key"
                    value={localKeys.elevenlabs}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <Button
                  onClick={handleSaveKeys}
                  variant="default"
                  loading={saving}
                  icon="Save"
                >
                  Save API Keys
                </Button>
                <Button
                  onClick={() => setLocalKeys({ ...apiKeys })}
                  variant="secondary"
                  icon="RefreshCw"
                >
                  Reset Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <Card hover={false}>
                <div className="flex items-center gap-2 mb-4">
                  <ApperIcon name="Volume2" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-white">Recording Preferences</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Auto-stop Recording</div>
                      <div className="text-sm text-white/60">Automatically stop recording after 90 minutes</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Auto-transcribe</div>
                      <div className="text-sm text-white/60">Automatically transcribe recordings when they finish</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Generate AI Summary</div>
                      <div className="text-sm text-white/60">Automatically generate meeting summaries</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </Card>

              <Card hover={false}>
                <div className="flex items-center gap-2 mb-4">
                  <ApperIcon name="Palette" size={20} className="text-secondary" />
                  <h3 className="text-lg font-semibold text-white">Appearance</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Theme</label>
                    <select className="w-full px-3 py-2 glass rounded-lg border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-primary/50">
                      <option value="dark" className="bg-surface text-white">Dark (Recommended)</option>
                      <option value="light" className="bg-surface text-white" disabled>Light (Coming Soon)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Language</label>
                    <select className="w-full px-3 py-2 glass rounded-lg border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-primary/50">
                      <option value="en" className="bg-surface text-white">English</option>
                      <option value="es" className="bg-surface text-white" disabled>Spanish (Coming Soon)</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-6">
              <Card hover={false} className="border-warning/20">
                <div className="flex items-center gap-2 mb-4">
                  <ApperIcon name="Database" size={20} className="text-warning" />
                  <h3 className="text-lg font-semibold text-white">Data Management</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 glass rounded-lg border border-accent/20">
                    <div className="flex items-start gap-3">
                      <ApperIcon name="Info" size={20} className="text-accent flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Data Storage</h4>
                        <p className="text-sm text-white/70 mb-3">
                          Your recordings and API keys are stored locally in your browser. No data is sent to external servers except for AI processing via the configured APIs.
                        </p>
                        <div className="text-xs text-white/50">
                          • Recordings: Browser local storage
                          <br />
                          • API Keys: Encrypted browser storage
                          <br />
                          • AI Processing: OpenAI & ElevenLabs APIs
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 glass rounded-lg border border-success/20">
                    <div className="flex items-start gap-3">
                      <ApperIcon name="Shield" size={20} className="text-success flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-white mb-1">Privacy & Security</h4>
                        <p className="text-sm text-white/70 mb-2">
                          VoiceVault AI is designed with privacy in mind:
                        </p>
                        <div className="text-xs text-white/60 space-y-1">
                          <div>✓ No user accounts or registration required</div>
                          <div>✓ Data remains on your device</div>
                          <div>✓ API keys are encrypted</div>
                          <div>✓ GDPR compliant data handling</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card hover={false} className="border-error/20">
                <div className="flex items-center gap-2 mb-4">
                  <ApperIcon name="Trash2" size={20} className="text-error" />
                  <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-error/10 rounded-lg border border-error/20">
                    <h4 className="font-medium text-white mb-2">Clear All Data</h4>
                    <p className="text-sm text-white/70 mb-4">
                      This will permanently delete all your recordings, transcripts, summaries, and settings. 
                      This action cannot be undone.
                    </p>
                    <Button
                      onClick={handleClearData}
                      variant="danger"
                      icon="Trash2"
                      size="sm"
                    >
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;