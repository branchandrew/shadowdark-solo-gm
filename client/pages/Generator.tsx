import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import VillainGenerator from '../components/VillainGenerator';
import VillainProcessModal from '../components/VillainProcessModal';
import CityGenerator from '../components/CityGenerator';
import HexCrawlGenerator from '../components/HexCrawlGenerator';
import NPCGenerator from '../components/NPCGenerator';
import NameGenerator from '../components/NameGenerator';
import CurseGenerator from '../components/CurseGenerator';
import DangerGenerator from '../components/DangerGenerator';
import DungeonGenerator from '../components/DungeonGenerator';
import TreasureGenerator from '../components/TreasureGenerator';
import { ChevronDown } from 'lucide-react';

// Generator data extracted from the homepage
const generators = [
  {
    id: 'curse',
    name: 'Curses',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fc4f728d3c92544308728b139613a0e31?format=webp&width=800',
    description: 'Generate dark curses, hexes, and magical afflictions to challenge and torment your players.',
    comingSoon: false
  },
  {
    id: 'danger',
    name: 'Dangers',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F447c328df92f4310b2eba6f2a9d3e564?format=webp&width=800',
    description: 'Generate hazards, traps, environmental dangers, and unexpected threats for your adventures.',
    comingSoon: false
  },
  {
    id: 'dungeon',
    name: 'Dungeons',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fc477432a36504d019f714c94960d14c3?format=webp&width=800',
    description: 'Create intricate dungeons with rooms, corridors, traps, and hidden treasures.',
    comingSoon: false
  },
  {
    id: 'faction',
    name: 'Factions',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F6f69c0c047e34a3cbe9111816d5a89ef?format=webp&width=800',
    description: 'Generate political factions, guilds, and organizations with goals, conflicts, and hierarchies.',
    comingSoon: true
  },
  {
    id: 'hexcrawl',
    name: 'Hex Crawl Maps',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F96b99ea49a024cb89989358f529466ea?format=webp&width=800',
    description: 'Generate detailed hex maps for wilderness exploration with terrain, encounters, and points of interest.',
    comingSoon: false
  },
  {
    id: 'landmark',
    name: 'Landmarks',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F764b57ee97ca44558e8af7961d910c8b?format=webp&width=800',
    description: 'Generate iconic landmarks, monuments, and points of interest with rich history and significance.',
    comingSoon: true
  },
  {
    id: 'monster',
    name: 'Monsters',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F376fd164dad5445a8d733d2da8a20f4f?format=webp&width=800',
    description: 'Generate unique creatures, monsters, and beasts with abilities, lore, and stat blocks.',
    comingSoon: true
  },
  {
    id: 'name',
    name: 'Names',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F5062e388e5db4ca984d22816341eac8b?format=webp&width=800',
    description: 'Generate authentic names for characters, places, taverns, and organizations.',
    comingSoon: false
  },
  {
    id: 'npc',
    name: 'NPCs',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F6ece13d5db9c4cac8c5538cba47389f3?format=webp&width=800',
    description: 'Create memorable NPCs with personalities, backstories, and motivations.',
    comingSoon: false
  },
  {
    id: 'quest',
    name: 'Quests',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Ff2b940278b264adcaa0b4cd710e89617?format=webp&width=800',
    description: 'Generate compelling quests and missions with objectives, rewards, and plot hooks for your campaigns.',
    comingSoon: true
  },
  {
    id: 'city',
    name: 'Settlements',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F043e18521b2a49349b092d39ab7291e1?format=webp&width=800',
    description: 'Generate detailed cities, towns, villages, and settlements with districts, landmarks, and notable locations for your world.',
    comingSoon: false
  },
  {
    id: 'tavern',
    name: 'Taverns',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fb2fc182dd2b5472f91daff10cec117be?format=webp&width=800',
    description: 'Generate cozy taverns with unique names, atmosphere, patrons, and memorable details.',
    comingSoon: true
  },
  {
    id: 'trap',
    name: 'Traps',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F6a66d7e7fbf84aac83d588609af6ebfd?format=webp&width=800',
    description: 'Generate cunning traps, mechanical devices, and hidden dangers to surprise your adventurers.',
    comingSoon: true
  },
  {
    id: 'treasure',
    name: 'Treasures',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fa01afda9e0bf455098143257f5ab97cc?format=webp&width=800',
    description: 'Generate exciting treasures, magical items, artifacts, and valuable loot for your adventures.',
    comingSoon: true
  },
  {
    id: 'villain',
    name: 'Villains / BBEGs',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fb3bf4524562f45c48b014bbc22d3fc28?format=webp&width=800',
    description: 'Create memorable villains and Big Bad Evil Guys with motivations, schemes, and epic backstories.',
    comingSoon: false
  },
  {
    id: 'world',
    name: 'Worlds',
    icon: 'https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F495d29a1067c47d590b886a03b2b1b4d?format=webp&width=800',
    description: 'Generate entire worlds with continents, kingdoms, cultures, and interconnected histories.',
    comingSoon: true
  }
];

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-300 rounded w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-4/6"></div>
    </div>
    <div className="h-32 bg-gray-300 rounded"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  </div>
);

export default function Generator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedGenerator, setSelectedGenerator] = useState(generators[0]);
  const [showVillainProcessModal, setShowVillainProcessModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'step1' | 'step2'>('step1');

  useEffect(() => {
    // Scroll to top when component mounts or URL parameters change
    window.scrollTo(0, 0);

    const type = searchParams.get('type');
    const autoGenerate = searchParams.get('autoGenerate');

    if (type) {
      const generator = generators.find(g => g.id === type);
      if (generator) {
        setSelectedGenerator(generator);

        // If autoGenerate is true, trigger generation after a short delay
        if (autoGenerate === 'true') {
          setTimeout(() => {
            triggerAutoGeneration(type);
          }, 500);
        }
      }
    }
  }, [searchParams]);

  // Function to trigger automatic generation based on generator type
  const triggerAutoGeneration = (generatorType: string) => {
    // Find the generate button and click it for simple generators
    const generateButton = document.querySelector('button[type="button"]:not([disabled])') as HTMLButtonElement;
    if (generateButton && generateButton.textContent?.includes('Generate')) {
      generateButton.click();
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-background text-foreground flex flex-col lg:flex-row" style={{ fontFamily: 'MedievalSharp, serif' }}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 border-b border-gray-700">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex-shrink-0">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F858292c04b9e4ecda4f245be8a0c9b1c?format=webp&width=800"
                alt="The Last GM Tool Logo"
                className="object-contain cursor-pointer h-10"
              />
            </Link>

            {/* Mobile Dropdown */}
            <div className="relative flex-1">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between gap-3 py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 text-white"
            >
              <div className="flex items-center gap-3">
                <img
                  src={selectedGenerator.icon}
                  alt={`${selectedGenerator.name} Icon`}
                  className="w-8 h-8 object-contain"
                />
                <span className="font-medium">{selectedGenerator.name}</span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {generators.map((generator) => (
                  <button
                    key={generator.id}
                    onClick={() => {
                      setSelectedGenerator(generator);
                      navigate(`/generator?type=${generator.id}`);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 py-3 px-4 transition-all duration-200 text-left hover:bg-gray-700 ${
                      selectedGenerator.id === generator.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300'
                    }`}
                  >
                    <img
                      src={generator.icon}
                      alt={`${generator.name} Icon`}
                      className="w-8 h-8 object-contain flex-shrink-0"
                    />
                    <span className="text-sm font-medium flex items-center gap-2">
                      {generator.name}
                      {generator.comingSoon && (
                        <span className="bg-gray-600 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Left Sidebar */}
      <div className="hidden lg:flex h-screen bg-gray-900 border-r border-gray-700 flex-col" style={{ width: '271px' }}>
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 justify-center">
            <Link to="/">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F858292c04b9e4ecda4f245be8a0c9b1c?format=webp&width=800"
                alt="The Last GM Tool Logo"
                className="object-contain cursor-pointer"
                style={{ maxHeight: '100px' }}
              />
            </Link>
          </div>
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-2">
            {generators.map((generator) => (
              <button
                key={generator.id}
                onClick={() => {
                  setSelectedGenerator(generator);
                  navigate(`/generator?type=${generator.id}`);
                }}
                className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 text-left ${
                  selectedGenerator.id === generator.id
                    ? 'bg-gray-700 border border-gray-600 text-white'
                    : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex-shrink-0">
                  <img
                    src={generator.icon}
                    alt={`${generator.name} Icon`}
                    className="w-10 h-10 object-contain"
                    style={{ maxWidth: '50px', maxHeight: '50px' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    {generator.name}
                    {generator.comingSoon && (
                      <span className="bg-gray-600 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
                {selectedGenerator.id === generator.id && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Desktop Content Header - Fixed */}
        <div className="hidden lg:block py-6 px-8 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {selectedGenerator.name}
          </h1>
          <p className="text-gray-600 text-lg">
            {selectedGenerator.description}
          </p>
          {selectedGenerator.id === 'villain' && (
            <div>
              <button
                onClick={() => setShowVillainProcessModal(true)}
                className="underline text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--primary-color)' }}
              >
                How we create a villain / BBEG
              </button>
            </div>
          )}
        </div>

        {/* Mobile Content Header */}
        <div className="lg:hidden py-4 px-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {selectedGenerator.name}
          </h1>
          <p className="text-gray-600 text-sm">
            {selectedGenerator.description}
          </p>
          {selectedGenerator.id === 'villain' && (
            <div className="mt-2">
              <button
                onClick={() => setShowVillainProcessModal(true)}
                className="underline text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--primary-color)' }}
              >
                How we create a villain / BBEG
              </button>
            </div>
          )}
        </div>

        {/* Mobile Tabs for Two-Step Generators */}
        {(selectedGenerator.id === 'villain' || selectedGenerator.id === 'city' || selectedGenerator.id === 'npc') && (
          <div className="lg:hidden border-b border-gray-200 px-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab('step1')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === 'step1'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Step 1
              </button>
              <button
                onClick={() => setActiveTab('step2')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === 'step2'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Step 2
              </button>
            </div>
          </div>
        )}

        {/* Content Body - Scrollable */}
        <div className={`flex-1 p-4 pb-24 lg:p-8 min-h-0 overflow-y-auto`}>
          <div className={selectedGenerator.id === 'villain' || selectedGenerator.id === 'city' || selectedGenerator.id === 'npc' ? 'h-full' : 'max-w-4xl mx-auto'}>
            {selectedGenerator.id === 'villain' ? (
              <VillainGenerator mobileTab={activeTab} />
            ) : selectedGenerator.id === 'city' ? (
              <CityGenerator mobileTab={activeTab} />
            ) : selectedGenerator.id === 'npc' ? (
              <NPCGenerator mobileTab={activeTab} />
            ) : selectedGenerator.id === 'hexcrawl' ? (
              <HexCrawlGenerator />
            ) : selectedGenerator.id === 'name' ? (
              <NameGenerator />
            ) : selectedGenerator.id === 'curse' ? (
              <CurseGenerator />
            ) : selectedGenerator.id === 'danger' ? (
              <DangerGenerator />
            ) : selectedGenerator.id === 'dungeon' ? (
              <DungeonGenerator mobileTab={activeTab} />
            ) : selectedGenerator.id === 'treasure' ? (
              <TreasureGenerator />
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Content will be generated here
                  </h2>
                </div>

                {/* Skeleton Loaders */}
                <div className="grid gap-6">
                  <SkeletonLoader />
                  <SkeletonLoader />
                </div>

                {/* Generation Button */}
                <div className="mt-8 text-center">
                  <button
                    className="px-8 py-3 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--secondary-color)',
                      border: 'none',
                      borderRadius: '20px 17px 22px 15px',
                      fontFamily: 'MedievalSharp, cursive',
                      fontSize: '18px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    Generate {selectedGenerator.name.replace(' Generator', '').replace(' Creator', '')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Villain Process Modal */}
      <VillainProcessModal
        isOpen={showVillainProcessModal}
        onClose={() => setShowVillainProcessModal(false)}
      />
    </div>
  );
}
