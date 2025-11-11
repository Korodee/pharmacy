"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider";
import PageHeader from "../../../components/layout/PageHeader";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

interface Settings {
  enablePrinting: boolean;
  enableNotifications: boolean;
  sendToFaxByDefault: boolean;
}

export default function SettingsPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    enablePrinting: true,
    enableNotifications: false,
    sendToFaxByDefault: true,
  });
  const [originalSettings, setOriginalSettings] = useState<Settings>({
    enablePrinting: true,
    enableNotifications: false,
    sendToFaxByDefault: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();

      if (data.success && data.settings) {
        const fetchedSettings = {
          enablePrinting: data.settings.enablePrinting ?? true,
          enableNotifications: data.settings.enableNotifications ?? false,
          sendToFaxByDefault: data.settings.sendToFaxByDefault ?? true,
        };
        setSettings(fetchedSettings);
        setOriginalSettings(fetchedSettings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      showError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Settings saved successfully!");
        // Update original settings to match current settings after successful save
        setOriginalSettings(settings);
      } else {
        showError(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Check if settings have changed
  const hasChanges = () => {
    return (
      settings.enablePrinting !== originalSettings.enablePrinting ||
      settings.enableNotifications !== originalSettings.enableNotifications ||
      settings.sendToFaxByDefault !== originalSettings.sendToFaxByDefault
    );
  };

  const toggleSetting = (key: keyof Settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-[#0A438C]" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-auto">
      <PageHeader
        title="Order Settings"
        description="Configure dashboard printing, notifications, and automatic fax sending"
      />

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Print Option */}
            <div className="flex items-center justify-between p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-[#0A438C]/30 transition-colors">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enable Printing Option
                </h3>
                <p className="text-sm text-gray-600">
                  Allow team members to print order details from the dashboard.
                  When enabled, a print button will be available in the request
                  and consultation modals.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-6">
                <input
                  type="checkbox"
                  checked={settings.enablePrinting}
                  onChange={() => toggleSetting("enablePrinting")}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0A438C]"></div>
              </label>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-[#0A438C]/30 transition-colors">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enable Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Show notifications on the dashboard when new orders are
                  received. When enabled, team members will be alerted on the
                  dashboard when a new request arrives.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-6">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={() => toggleSetting("enableNotifications")}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0A438C]"></div>
              </label>
            </div>

            {/* Send to Fax by Default */}
            <div className="flex items-center justify-between p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-[#0A438C]/30 transition-colors">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Send to Fax by Default
                </h3>
                <p className="text-sm text-gray-600">
                  Automatically send orders to fax when they are submitted. When
                  enabled, all new orders will be automatically sent to your fax
                  machine via Documo.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-6">
                <input
                  type="checkbox"
                  checked={settings.sendToFaxByDefault}
                  onChange={() => toggleSetting("sendToFaxByDefault")}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0A438C]"></div>
              </label>
            </div>
          </motion.div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving || !hasChanges()}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                hasChanges() && !saving
                  ? "bg-[#0A438C] text-white hover:bg-[#0A438C]/90 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
