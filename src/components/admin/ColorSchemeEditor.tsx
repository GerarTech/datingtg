import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Eye, EyeOff, Save, RotateCcw, Sparkles } from 'lucide-react';
import { ColorScheme, defaultColorScheme, presetColorSchemes, getCurrentColorScheme, saveColorScheme, applyColorScheme } from '@/lib/colorScheme';

interface ColorSchemeEditorProps {
  onClose?: () => void;
}

export function ColorSchemeEditor({ onClose }: ColorSchemeEditorProps) {
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>(defaultColorScheme);
  const [editingScheme, setEditingScheme] = useState<ColorScheme>(defaultColorScheme);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const scheme = getCurrentColorScheme();
    setCurrentScheme(scheme);
    setEditingScheme({ ...scheme });
  }, []);

  const handleColorChange = (colorKey: keyof ColorScheme['colors'], value: string) => {
    setEditingScheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
    setHasChanges(true);
    
    if (previewMode) {
      applyColorScheme({
        ...editingScheme,
        colors: {
          ...editingScheme.colors,
          [colorKey]: value
        }
      });
    }
  };

  const handlePresetSelect = (preset: ColorScheme) => {
    setEditingScheme({ ...preset });
    setHasChanges(true);
    
    if (previewMode) {
      applyColorScheme(preset);
    }
  };

  const handleSave = () => {
    saveColorScheme(editingScheme);
    setCurrentScheme(editingScheme);
    setHasChanges(false);
    
    // Show success feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const handleReset = () => {
    setEditingScheme({ ...defaultColorScheme });
    setHasChanges(false);
    applyColorScheme(defaultColorScheme);
  };

  const togglePreview = () => {
    if (!previewMode) {
      applyColorScheme(editingScheme);
    } else {
      applyColorScheme(currentScheme);
    }
    setPreviewMode(!previewMode);
  };

  const colorGroups = [
    {
      title: 'Background Colors',
      colors: [
        { key: 'primary' as const, label: 'Primary Background', description: 'Main app background' },
        { key: 'secondary' as const, label: 'Secondary Background', description: 'Cards and surfaces' },
        { key: 'tertiary' as const, label: 'Tertiary Background', description: 'Hover states' },
        { key: 'surface' as const, label: 'Surface', description: 'Input fields and buttons' },
      ]
    },
    {
      title: 'Accent Colors',
      colors: [
        { key: 'accent' as const, label: 'Primary Accent', description: 'Main action color' },
        { key: 'accentSecondary' as const, label: 'Secondary Accent', description: 'Gradient end color' },
        { key: 'success' as const, label: 'Success', description: 'Success messages' },
        { key: 'warning' as const, label: 'Warning', description: 'Warning messages' },
        { key: 'error' as const, label: 'Error', description: 'Error messages' },
        { key: 'info' as const, label: 'Info', description: 'Info messages' },
      ]
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'textPrimary' as const, label: 'Primary Text', description: 'Main text color' },
        { key: 'textSecondary' as const, label: 'Secondary Text', description: 'Subtle text' },
        { key: 'textTertiary' as const, label: 'Tertiary Text', description: 'Very subtle text' },
      ]
    },
    {
      title: 'UI Elements',
      colors: [
        { key: 'border' as const, label: 'Border', description: 'Dividers and borders' },
        { key: 'overlay' as const, label: 'Overlay', description: 'Modal overlays' },
      ]
    },
    {
      title: 'Telegram Integration',
      colors: [
        { key: 'telegramHeader' as const, label: 'Telegram Header', description: 'Mini app header' },
        { key: 'telegramBackground' as const, label: 'Telegram Background', description: 'Mini app background' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-[#151821] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8C00] to-[#FF6B6B] flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Color Scheme Editor</h2>
              <p className="text-white/60 text-sm">Customize your app's appearance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={togglePreview}
              className={`p-2 rounded-xl transition-all ${
                previewMode 
                  ? 'bg-[#FF8C00] text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {previewMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition-all"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              activeTab === 'presets'
                ? 'text-[#FF8C00] border-b-2 border-[#FF8C00]'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              activeTab === 'custom'
                ? 'text-[#FF8C00] border-b-2 border-[#FF8C00]'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Custom Colors
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {activeTab === 'presets' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presetColorSchemes.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        editingScheme.id === preset.id
                          ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-xl"
                          style={{ background: preset.colors.accent }}
                        />
                        <div>
                          <h3 className="text-white font-medium">{preset.name}</h3>
                          <p className="text-white/60 text-xs">Click to apply</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg"
                          style={{ background: preset.colors.primary }}
                        />
                        <div 
                          className="w-8 h-8 rounded-lg"
                          style={{ background: preset.colors.accent }}
                        />
                        <div 
                          className="w-8 h-8 rounded-lg"
                          style={{ background: preset.colors.textPrimary }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'custom' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6"
              >
                {colorGroups.map((group) => (
                  <div key={group.title} className="mb-8">
                    <h3 className="text-white font-medium mb-4">{group.title}</h3>
                    <div className="space-y-3">
                      {group.colors.map((color) => (
                        <div key={color.key} className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-white text-sm font-medium">
                                {color.label}
                              </label>
                              <span 
                                className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/60 font-mono"
                              >
                                {editingScheme.colors[color.key]}
                              </span>
                            </div>
                            <p className="text-white/40 text-xs">{color.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={editingScheme.colors[color.key]}
                              onChange={(e) => handleColorChange(color.key, e.target.value)}
                              className="w-12 h-12 rounded-xl border-2 border-white/20 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={editingScheme.colors[color.key]}
                              onChange={(e) => handleColorChange(color.key, e.target.value)}
                              className="w-24 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-mono"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-[#0B0D14]/50">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </button>
            
            {previewMode && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FF8C00]/20 text-[#FF8C00] text-sm">
                <Sparkles className="w-4 h-4" />
                Preview Mode
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingScheme({ ...currentScheme });
                setHasChanges(false);
                if (previewMode) {
                  applyColorScheme(currentScheme);
                }
              }}
              className="px-4 py-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                hasChanges
                  ? 'bg-[#FF8C00] text-white hover:bg-[#FF8C00]/90'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
