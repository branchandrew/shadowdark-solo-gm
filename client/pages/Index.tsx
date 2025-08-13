import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  Dice6, 
  Users, 
  Map, 
  Scroll, 
  Sword, 
  Shield,
  ChevronDown,
  Star
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  // Available generators (excluding coming soon ones)
  const availableGenerators = ['curse', 'name', 'npc', 'city', 'villain', 'hexcrawl'];

  const handleRandomGenerate = () => {
    const randomGenerator = availableGenerators[Math.floor(Math.random() * availableGenerators.length)];
    navigate(`/generator?type=${randomGenerator}&autoGenerate=true`);
  };

  return (
    <>
      {/* Logo, button, and text container */}
      <div className="absolute z-50 flex flex-col" style={{ top: '40px', left: '40px' }}>
        <a
          href="#"
          style={{
            width: '175px',
            height: '194px',
            backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F858292c04b9e4ecda4f245be8a0c9b1c?format=webp&width=800')`,
            backgroundSize: '100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            marginBottom: '30px'
          }}
          aria-label="The Last GM Tool Logo"
        />

        <p
          className="text-white text-4xl mb-4"
          style={{
            fontFamily: 'MedievalSharp, serif',
            marginTop: '20px'
          }}
        >
          Never Be Unprepared
        </p>

        <p
          className="text-gray-400 text-base mb-6 font-normal"
          style={{
            fontFamily: 'serif',
            maxWidth: '450px',
            lineHeight: '1.4'
          }}
        >
          The ultimate collection of generators for Game Masters. Generate NPCs, maps, settlements, BBEGs and more in an instant without books of tables, dice rolls, and awkward pauses.
        </p>

        <button
          onClick={handleRandomGenerate}
          className="py-1 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          style={{
            backgroundColor: 'var(--secondary-color)',
            border: 'none',
            borderRadius: '20px 17px 22px 15px',
            fontFamily: 'MedievalSharp, cursive',
            fontSize: '18px',
            fontWeight: 'normal',
            cursor: 'pointer',
            boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
            transform: 'translateY(-1px)',
            width: 'fit-content',
            paddingLeft: '15px',
            paddingRight: '15px'
          }}
        >
          Generate Something Useful
        </button>
      </div>

      <div className="min-h-screen bg-background dark">
        {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-[110] bg-transparent">
        <div className="px-4 py-4">
          <div className="absolute top-4 right-4 flex items-center gap-4">
            <Link
              to="/generators"
              className="px-3 py-1 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 no-underline relative z-[120]"
              style={{
                backgroundColor: 'var(--primary-color)',
                border: 'none',
                borderRadius: '18px 21px 16px 19px',
                fontFamily: 'MedievalSharp, cursive',
                fontSize: '16px',
                fontWeight: 'normal',
                cursor: 'pointer',
                boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                transform: 'translateY(-1px)',
                display: 'inline-block',
                textDecoration: 'none'
              }}
            >
              Tools
            </Link>
            <button
              className="px-3 py-1 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 relative z-[115]"
              style={{
                backgroundColor: 'var(--primary-color)',
                border: 'none',
                borderRadius: '17px 22px 20px 15px',
                fontFamily: 'MedievalSharp, cursive',
                fontSize: '16px',
                fontWeight: 'normal',
                cursor: 'pointer',
                boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                transform: 'translateY(-1px)'
              }}
            >
              About
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F92c12bf9adbe40d78824987c0f77500e?format=webp&width=800')`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
      >
        {/* Border Images */}
        {/* Top border - using top.png (1158px x 53px) */}
        <div
          className="absolute top-0 left-0 right-0 z-10"
          style={{
            height: '53px',
            backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fb8c53448960b45e18d6f0e4530c62454?format=webp&width=800')`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '1158px 53px'
          }}
        />

        {/* Bottom border - using bottom.png (1194px x 48px) */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{
            height: '48px',
            backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fbd0b65db4589419ca5d1b14d6144a6ef?format=webp&width=800')`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '1194px 48px'
          }}
        />

        {/* Left border - using left.png */}
        <div
          className="absolute top-0 bottom-0 left-0 z-10"
          style={{
            width: '21px',
            backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Ff3df203d971a44f8b133abde7bbf81b7?format=webp&width=800')`,
            backgroundRepeat: 'repeat-y',
            backgroundSize: 'auto'
          }}
        />

        {/* Right border - using right.png (36px x 1377) */}
        <div
          className="absolute top-0 bottom-0 right-0 z-10"
          style={{
            width: '36px',
            backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F4195fbaf8f9f4398ab606b86c9e227eb?format=webp&width=800')`,
            backgroundRepeat: 'repeat-y',
            backgroundSize: '36px 1377px'
          }}
        />

        {/* Corner Images */}
        {/* Top-left corner */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F660f369b2e814aada9643c7b41758561?format=webp&width=800"
          alt="Top-left corner decoration"
          className="absolute top-0 left-0 z-[100]"
          style={{ maxWidth: 'none' }}
        />

        {/* Bottom-left corner */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fc91ba32db7254311833e798ed503bd94?format=webp&width=800"
          alt="Bottom-left corner decoration"
          className="absolute bottom-0 left-0 z-[100]"
          style={{ maxWidth: 'none' }}
        />

        {/* Bottom-right corner */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fc51def4aa79d424fba50057af939ac20?format=webp&width=800"
          alt="Bottom-right corner decoration"
          className="absolute bottom-0 right-0 z-[100]"
          style={{ maxWidth: 'none' }}
        />

        {/* Top-right corner */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F35e65f6149a34c83a189d01054308273?format=webp&width=800"
          alt="Top-right corner decoration"
          className="absolute top-0 right-0 z-[100]"
          style={{ maxWidth: 'none' }}
        />

        
        {/* Centered background image overlay */}
        <div
          className="absolute inset-0 z-1"
          style={{
            backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F90c1a53d1ec5461ab1ca4c2c9ebf31d7?format=webp&width=800')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: '1862px 888px'
          }}
        />







      </section>

      {/* Tools Preview Section */}
      <section id="generators" className="pt-12 pb-20" style={{
        backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Ff24b6d7c3e1e441fb539634994c94faa?format=webp&width=800')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundColor: '#030208'
      }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Curses Generator */}
            <Link to="/generator?type=curse" className="block">
              <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '22px 17px 19px 15px', padding: '24px 14px 0' }}>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fc4f728d3c92544308728b139613a0e31?format=webp&width=800"
                      alt="Curse Generator Icon"
                      style={{ height: '110px', width: 'auto' }}
                    />
                  </div>
                  <CardTitle className="text-xl">Curses Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Generate dark curses, hexes, and magical afflictions to challenge and torment your players.
                  </p>
                  <button
                    className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                    style={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '19px 17px 21px 15px',
                      fontFamily: 'MedievalSharp, cursive',
                      fontSize: '16px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    Generate
                  </button>
                </CardContent>
              </Card>
            </Link>

            {/* Dangers Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '21px 18px 20px 16px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F447c328df92f4310b2eba6f2a9d3e564?format=webp&width=800"
                    alt="Danger Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Dangers Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generate hazards, traps, environmental dangers, and unexpected threats for your adventures.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '20px 16px 17px 21px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>

            {/* Dungeons Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '15px 21px 17px 22px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fc477432a36504d019f714c94960d14c3?format=webp&width=800"
                    alt="Dungeon Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Dungeons Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Create intricate dungeons with rooms, corridors, traps, and hidden treasures.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '18px 15px 20px 22px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>

            {/* Factions Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '17px 21px 18px 19px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F6f69c0c047e34a3cbe9111816d5a89ef?format=webp&width=800"
                    alt="Faction Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Factions Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generate political factions, guilds, and organizations with goals, conflicts, and hierarchies.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '18px 21px 16px 19px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>

            {/* Hex Crawl Maps Generator */}
            <Link to="/generator?type=hexcrawl" className="block">
              <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '19px 16px 22px 18px', padding: '24px 14px 0' }}>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F96b99ea49a024cb89989358f529466ea?format=webp&width=800"
                      alt="Hex Crawl Map Generator Icon"
                      style={{ height: '110px', width: 'auto' }}
                    />
                  </div>
                  <CardTitle className="text-xl">Hex Crawl Maps Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Generate detailed hex maps for wilderness exploration with terrain, encounters, and points of interest.
                  </p>
                  <button
                    className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                    style={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '20px 15px 19px 17px',
                      fontFamily: 'MedievalSharp, cursive',
                      fontSize: '16px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    Generate
                  </button>
                </CardContent>
              </Card>
            </Link>

            {/* Landmarks Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '21px 15px 20px 17px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F764b57ee97ca44558e8af7961d910c8b?format=webp&width=800"
                    alt="Landmark Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Landmarks Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generate iconic landmarks, monuments, and points of interest with rich history and significance.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '18px 21px 16px 19px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>

            {/* Monsters Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '19px 16px 21px 20px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F376fd164dad5445a8d733d2da8a20f4f?format=webp&width=800"
                    alt="Monster Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Monsters Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generate unique creatures, monsters, and beasts with abilities, lore, and stat blocks.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '18px 21px 16px 19px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>

            {/* Names Generator */}
            <Link to="/generator?type=name" className="block">
              <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '17px 20px 19px 21px', padding: '24px 14px 0' }}>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F5062e388e5db4ca984d22816341eac8b?format=webp&width=800"
                      alt="Name Generator Icon"
                      style={{ height: '110px', width: 'auto' }}
                    />
                  </div>
                  <CardTitle className="text-xl">Names Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Generate authentic names for characters, places, taverns, and organizations.
                  </p>
                  <button
                    className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                    style={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '15px 19px 22px 18px',
                      fontFamily: 'MedievalSharp, cursive',
                      fontSize: '16px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    Generate
                  </button>
                </CardContent>
              </Card>
            </Link>

            {/* NPCs Generator */}
            <Link to="/generator?type=npc" className="block">
              <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '20px 17px 22px 15px', padding: '24px 14px 0' }}>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F6ece13d5db9c4cac8c5538cba47389f3?format=webp&width=800"
                      alt="NPC Generator Icon"
                      style={{ height: '110px', width: 'auto' }}
                    />
                  </div>
                  <CardTitle className="text-xl">NPCs Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Create memorable NPCs with personalities, backstories, and motivations.
                  </p>
                  <button
                    className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                    style={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '21px 16px 19px 18px',
                      fontFamily: 'MedievalSharp, cursive',
                      fontSize: '16px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    Generate
                  </button>
                </CardContent>
              </Card>
            </Link>

            {/* Quests Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '20px 18px 16px 21px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Ff2b940278b264adcaa0b4cd710e89617?format=webp&width=800"
                    alt="Quest Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Quests Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generate compelling quests and missions with objectives, rewards, and plot hooks for your campaigns.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '15px 21px 19px 17px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>

            {/* Settlements Generator */}
            <Link to="/generator?type=city" className="block">
              <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '16px 19px 21px 18px', padding: '24px 14px 0' }}>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F043e18521b2a49349b092d39ab7291e1?format=webp&width=800"
                      alt="City Generator Icon"
                      style={{ height: '110px', width: 'auto' }}
                    />
                  </div>
                  <CardTitle className="text-xl">Settlements Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Generate detailed cities, towns, villages, and settlements with districts, landmarks, and notable locations for your world.
                  </p>
                  <button
                    className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                    style={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '19px 15px 21px 17px',
                      fontFamily: 'MedievalSharp, cursive',
                      fontSize: '16px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    Generate
                  </button>
                </CardContent>
              </Card>
            </Link>

            {/* Taverns Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '20px 15px 22px 18px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fb2fc182dd2b5472f91daff10cec117be?format=webp&width=800"
                    alt="Tavern Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Taverns Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generate cozy taverns with unique names, atmosphere, patrons, and memorable details.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '21px 18px 15px 20px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>

            {/* Traps Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '16px 22px 20px 18px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F6a66d7e7fbf84aac83d588609af6ebfd?format=webp&width=800"
                    alt="Trap Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Traps Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generate cunning traps, mechanical devices, and hidden dangers to surprise your adventurers.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '16px 20px 18px 22px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>

            {/* Treasures Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '18px 20px 16px 21px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fa01afda9e0bf455098143257f5ab97cc?format=webp&width=800"
                    alt="Treasure Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Treasures Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generate exciting treasures, magical items, artifacts, and valuable loot for your adventures.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '17px 22px 19px 16px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>

            {/* Villains / BBEGs Generator */}
            <Link to="/generator?type=villain" className="block">
              <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '19px 22px 15px 17px', padding: '24px 14px 0' }}>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2Fb3bf4524562f45c48b014bbc22d3fc28?format=webp&width=800"
                      alt="Villain BBEG Generator Icon"
                      style={{ height: '110px', width: 'auto' }}
                    />
                  </div>
                  <CardTitle className="text-xl">Villains / BBEGs Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Create memorable villains and Big Bad Evil Guys with motivations, schemes, and epic backstories.
                  </p>
                  <button
                    className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                    style={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '22px 17px 20px 16px',
                      fontFamily: 'MedievalSharp, cursive',
                      fontSize: '16px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    Generate
                  </button>
                </CardContent>
              </Card>
            </Link>

            {/* Worlds Generator */}
            <Card className="group hover:shadow-lg hover:scale-[1.025] transition-all duration-300 border border-gray-300 bg-transparent cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ borderRadius: '22px 16px 18px 20px', padding: '24px 14px 0' }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc15718245902463f92daca7d09c24b29%2F495d29a1067c47d590b886a03b2b1b4d?format=webp&width=800"
                    alt="World Generator Icon"
                    style={{ height: '110px', width: 'auto' }}
                  />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Worlds Generator
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                    Coming Soon
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generate entire worlds with continents, kingdoms, cultures, and interconnected histories.
                </p>
                <button
                  className="w-full mt-4 px-3 py-1 text-black shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-none"
                  style={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '16px 22px 18px 20px',
                    fontFamily: 'MedievalSharp, cursive',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Generate
                </button>
              </CardContent>
            </Card>
          </div>
          

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-shadowdark-shadow text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Dice6 className="h-6 w-6 text-shadowdark-gold" />
              <h3 className="text-xl font-bold">The Last GM Tool</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering Game Masters with AI-driven creativity
            </p>
            <p className="text-sm text-gray-500">
              Built for the RPG community with ���️
            </p>
          </div>
        </div>
        </footer>
      </div>
    </>
  );
}
