'use client';

import { useState, useEffect } from 'react';
import { backupService } from '../../lib/backup-service';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData?: any;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentData }) => {
  const [email, setEmail] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [scheduleTime, setScheduleTime] = useState('00:00');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Load current settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const config = backupService.getConfig();
      setEmail(config.email);
      setEnabled(config.enabled);
      setScheduleTime(config.scheduleTime);
      setBackupStatus(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    setIsSaving(true);
    
    // Update backup service configuration
    backupService.updateConfig({
      email,
      enabled,
      scheduleTime
    });
    
    // Reset success message after delay
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSaving(false);
      onClose();
    }, 1500);
  };

  const handleManualBackup = async () => {
    console.log("Backup Triggered");
    setIsBackingUp(true);
    setBackupStatus(null);
    try {
      // Use currentData from props if available to ensure LATEST state
      await backupService.manualBackup(currentData);
      setBackupStatus({ type: 'success', message: 'Backup email sent successfully!' });
    } catch (error: any) {
      console.error("Manual Backup Error:", error);
      setBackupStatus({ type: 'error', message: `Backup failed: ${error.message || 'Unknown error'}` });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFactoryReset = () => {
    const confirmed = window.confirm("⚠️ CRITICAL: This will DELETE all your data and transaction history. Are you sure you want to perform a Factory Reset?");
    if (!confirmed) return;

    const secondConfirmed = window.confirm("FINAL WARNING: This action is irreversible. All history, workers, and expenses will be permanently wiped. Proceed?");
    if (!secondConfirmed) return;

    // Show resetting message
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.backgroundColor = 'black';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = '#22d3ee';
    overlay.style.fontFamily = 'monospace';
    overlay.innerHTML = '<div style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem; animation: pulse 1.5s infinite;">SYSTEM RESETTING...</div><div style="font-size: 1.2rem; color: #94a3b8;">Restarting Spider Station...</div><style>@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }</style>';
    document.body.appendChild(overlay);

    // Perform Wipe (Simulating the V2 handover logic)
    const backupEmail = localStorage.getItem('backup_email');
    
    // Clear all localStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore critical preservation items
    if (backupEmail) {
      localStorage.setItem('backup_email', backupEmail);
    }
    
    // Set the handover flag to prevent double-wipe on refresh but ensure a clean state
    localStorage.setItem('CLICK_HANDOVER_PRODUCTION_READY_V2', '1');

    // Reload after a delay to show the message
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleUpdate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert("Please select a valid Update Zip file.");
      event.target.value = '';
      return;
    }

    const confirmed = window.confirm("Ready to update Spider Station? Your data (History) will be kept safe during the process.");
    if (!confirmed) {
      event.target.value = '';
      return;
    }

    // Show Updating Overlay
    const overlay = document.createElement('div');
    overlay.id = "update-overlay";
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '9999';
    overlay.style.backgroundColor = '#000';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = '#22d3ee';
    overlay.style.fontFamily = 'monospace';
    overlay.style.padding = '20px';
    overlay.style.textAlign = 'center';
    
    overlay.innerHTML = `
      <div style="font-size: 1.5rem; font-weight: 900; margin-bottom: 2rem; letter-spacing: 0.2em; text-shadow: 0 0 10px rgba(34,211,238,0.5);">SYSTEM UPDATING...</div>
      <div style="width: 100%; max-width: 300px; height: 12px; background: #0f172a; border-radius: 6px; overflow: hidden; margin-bottom: 1rem; border: 1px solid #1e293b; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
        <div id="update-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #0891b2, #22d3ee); box-shadow: 0 0 15px #22d3ee; transition: width 0.2s ease-out;"></div>
      </div>
      <div id="update-status" style="font-size: 0.85rem; color: #94a3b8; font-weight: bold; min-height: 1.2em;">Initializing update package...</div>
      <div style="margin-top: 3rem; font-size: 0.65rem; color: #334155; text-transform: uppercase; letter-spacing: 0.15em; border-top: 1px solid #1e293b; pt-4;">Security: Data Integrity Guard Active</div>
    `;
    document.body.appendChild(overlay);

    const progressBar = overlay.querySelector('#update-progress') as HTMLElement;
    const statusText = overlay.querySelector('#update-status') as HTMLElement;

    try {
      // Simulate progress for UI feel while starting upload
      let progress = 0;
      const progressTimer = setInterval(() => {
        if (progress < 90) {
          progress += Math.random() * 2;
          if (progressBar) progressBar.style.width = `${progress}%`;
          
          if (progress < 20) statusText.innerText = "Uploading update package...";
          else if (progress < 45) statusText.innerText = "Extracting components...";
          else if (progress < 70) statusText.innerText = "Verifying build integrity...";
          else statusText.innerText = "Applying system patches...";
        }
      }, 300);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/system/update', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);

      if (response.ok) {
        if (progressBar) progressBar.style.width = '100%';
        statusText.innerText = "Restarting for changes to take effect...";
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }
    } catch (error: any) {
      console.error("Update Error:", error);
      overlay.remove();
      alert(`Update Failed: ${error.message || 'Unknown error occurred'}`);
      event.target.value = '';
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Safety Warning
    const confirmed = window.confirm("Kya aap purana data wapis lana chahte hain? This will replace all current data with the backup data.");
    if (!confirmed) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);
        
        const success = await backupService.nuclearRestore(backupData);
        
        if (success) {
          alert("Data restored successfully! Software will now refresh.");
          window.location.reload();
        } else {
          alert("Restore failed. Please ensure the file is a valid Spider Station backup.");
        }
      } catch (error) {
        console.error("Restore error:", error);
        alert("Failed to parse the backup file.");
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cyan-400">Backup Settings</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="your-email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Backup Schedule Time
            </label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="enabled" className="ml-2 text-sm text-slate-300">
              Enable automatic backups
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col space-y-3">
          <button
            onClick={handleManualBackup}
            disabled={isBackingUp}
            className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isBackingUp ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full mr-2"></span>
                Sending...
              </>
            ) : (
              <>
                <span>📧</span>
                <span>Send Backup Now</span>
              </>
            )}
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".zip"
              onChange={handleUpdate}
              className="hidden"
              id="update-upload"
            />
            <label
              htmlFor="update-upload"
              className="w-full px-4 py-3 bg-cyan-900/20 border border-cyan-500/50 hover:bg-cyan-900/40 text-cyan-300 rounded-xl transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.1)] active:scale-95 group"
            >
              <span className="text-xl group-hover:animate-bounce">🚀</span>
              <span className="font-black uppercase tracking-widest text-xs">Upload & Update Software</span>
            </label>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="hidden"
              id="restore-upload"
            />
            <label
              htmlFor="restore-upload"
              className="w-full px-4 py-2 bg-slate-800 border border-emerald-500/30 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>📥</span>
              <span>Import History (JSON)</span>
            </label>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handleFactoryReset}
              className="px-4 py-2 bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/30 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
            >
              Factory Reset
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        {backupStatus && (
          <div className={`mt-4 p-2 rounded-lg text-center text-sm ${
            backupStatus.type === 'success' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
          }`}>
            {backupStatus.message}
          </div>
        )}
        
        {saveSuccess && (
          <div className="mt-4 p-2 bg-emerald-900/50 text-emerald-300 rounded-lg text-center">
            Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;