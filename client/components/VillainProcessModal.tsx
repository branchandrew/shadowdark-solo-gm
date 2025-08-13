import React from 'react';
import { X } from 'lucide-react';

interface VillainProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VillainProcessModal({ isOpen, onClose }: VillainProcessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'MedievalSharp, serif' }}>
            How we create a villain / BBEG
          </h2>
          <button
            onClick={onClose}
            className="text-white shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              backgroundColor: 'var(--secondary-color)',
              border: 'none',
              borderRadius: '18px 22px 16px 20px',
              fontFamily: 'MedievalSharp, cursive',
              fontSize: '16px',
              fontWeight: 'normal',
              cursor: 'pointer',
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
              transform: 'translateY(-1px)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="prose max-w-none" style={{ fontFamily: 'serif' }}>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Villain/BBEG Generation System Overview</h3>
            
            <p className="mb-4 leading-relaxed">
              The Villain/BBEG generator employs a sophisticated multi-layered approach that combines traditional tabletop gaming elements with modern AI technology to create compelling antagonists. At its core, the system begins with Tarot card inspiration, drawing six cards from a complete 78-card deck with specific narrative positions: Seed, Virtue, Vice, Rising Power, Breaking Point, and Fate. Each card has approximately a 33% chance of being reversed, providing thematic inspiration that ensures the villain fits coherent narrative themes rather than being a random collection of traits.
            </p>
            
            <p className="mb-4 leading-relaxed">
              The system then selects from a vast array of predetermined elements to establish the villain's foundation. It chooses one goal from a comprehensive table of 360 possible motivations ranging from "Absolute power" to "Dimensional control" to "Corrupt the world." The villain's creature type is selected from 67 different options in the SHADOWDARK_VILLAIN_TYPES array, with a 50% chance of being Human and the remainder weighted toward more common fantasy races like Elves and Dwarves, though exotic options like "Obe-Ixx of Azarumme" or "World consuming darkness" remain possible.
            </p>
            
            <p className="mb-4 leading-relaxed">
              Name generation follows a sophisticated linguistic pattern system specifically designed for evil characters. The system generates three potential villain names using alignment-based syllable combinations from arrays of dark fantasy prefixes, middle segments, and suffixes. Similarly, it creates two lieutenants by selecting unique creature types and generating four evil-aligned names from the same linguistic system. This ensures that names feel authentically rooted in dark fantasy traditions while maintaining variety and memorability.
            </p>
            
            <p className="mb-4 leading-relaxed">
              All these elements—the six Tarot cards with their positions and orientations, the selected goal, creature type, potential names, and lieutenant information—are then fed into Claude 3.5 Sonnet AI with a detailed prompt requesting a cohesive villain profile. The AI synthesizes these disparate elements into a complete character with motivation, story hook, detailed description, faction details, lieutenant roles, minion descriptions, power assessment, and strategic weaknesses. The system explicitly instructs the AI to make villains "dangerous but defeatable with clever planning," ensuring they serve as compelling challenges rather than insurmountable obstacles. This combination of random table generation, linguistic algorithms, Tarot-based narrative structure, and AI synthesis creates a generation system capable of producing unique, thematically coherent villains with rich organizational depth and clear narrative integration points for RPG campaigns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
