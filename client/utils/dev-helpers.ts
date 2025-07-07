// Development utilities for managing localStorage during development

export function clearAllShadowdarkData() {
  const keys = [
    "shadowdark_character",
    "shadowdark_has_character",
    "shadowdark_adventure_arc",
    "shadowdark_chaos_factor",
    "shadowdark_theme",
    "shadowdark_tone",
    "shadowdark_voice",
    "shadowdark_session_id",
    "shadowdark_cloud_sync",
    "shadowdark_campaign_elements",
    "shadowdark_adventure_log",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log("🧹 Cleared all Shadowdark localStorage data for fresh start");
}

export function logCurrentData() {
  const keys = [
    "shadowdark_character",
    "shadowdark_has_character",
    "shadowdark_adventure_arc",
    "shadowdark_chaos_factor",
    "shadowdark_theme",
    "shadowdark_tone",
    "shadowdark_voice",
    "shadowdark_session_id",
    "shadowdark_cloud_sync",
  ];

  console.log("📊 Current localStorage data:");
  keys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(
        `  ${key}:`,
        value.length > 100 ? `${value.substring(0, 100)}...` : value,
      );
    }
  });
}

// Auto-clear on development server restart
if (import.meta.env.DEV) {
  console.log("🔄 Development mode: Starting with fresh state");
  // clearAllShadowdarkData(); // Uncomment to auto-clear on every refresh
}
