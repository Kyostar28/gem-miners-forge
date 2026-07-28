// 100 mineros para CryptoMiner Dark Web Shop
// Cada miner referencia su sprite en src/assets/miners/

export type Tier = "BASIC" | "PRO" | "ELITE" | "QUANTUM" | "MYTHIC";

export interface Miner {
  id: number;
  name: string;
  description: string;
  tier: Tier;
  unit: string; // rack unit label
  hashRate: number; // TH/s
  price: number; // CT
  image: string;
}

// Import all 100 sprites
import m01 from "@/assets/miners/miner-01.png";
import m02 from "@/assets/miners/miner-02.png";
import m03 from "@/assets/miners/miner-03.png";
import m04 from "@/assets/miners/miner-04.png";
import m05 from "@/assets/miners/miner-05.png";
import m06 from "@/assets/miners/miner-06.png";
import m07 from "@/assets/miners/miner-07.png";
import m08 from "@/assets/miners/miner-08.png";
import m09 from "@/assets/miners/miner-09.png";
import m10 from "@/assets/miners/miner-10.png";
import m11 from "@/assets/miners/miner-11.png";
import m12 from "@/assets/miners/miner-12.png";
import m13 from "@/assets/miners/miner-13.png";
import m14 from "@/assets/miners/miner-14.png";
import m15 from "@/assets/miners/miner-15.png";
import m16 from "@/assets/miners/miner-16.png";
import m17 from "@/assets/miners/miner-17.png";
import m18 from "@/assets/miners/miner-18.png";
import m19 from "@/assets/miners/miner-19.png";
import m20 from "@/assets/miners/miner-20.png";
import m21 from "@/assets/miners/miner-21.png";
import m22 from "@/assets/miners/miner-22.png";
import m23 from "@/assets/miners/miner-23.png";
import m24 from "@/assets/miners/miner-24.png";
import m25 from "@/assets/miners/miner-25.png";
import m26 from "@/assets/miners/miner-26.png";
import m27 from "@/assets/miners/miner-27.png";
import m28 from "@/assets/miners/miner-28.png";
import m29 from "@/assets/miners/miner-29.png";
import m30 from "@/assets/miners/miner-30.png";
import m31 from "@/assets/miners/miner-31.png";
import m32 from "@/assets/miners/miner-32.png";
import m33 from "@/assets/miners/miner-33.png";
import m34 from "@/assets/miners/miner-34.png";
import m35 from "@/assets/miners/miner-35.png";
import m36 from "@/assets/miners/miner-36.png";
import m37 from "@/assets/miners/miner-37.png";
import m38 from "@/assets/miners/miner-38.png";
import m39 from "@/assets/miners/miner-39.png";
import m40 from "@/assets/miners/miner-40.png";
import m41 from "@/assets/miners/miner-41.png";
import m42 from "@/assets/miners/miner-42.png";
import m43 from "@/assets/miners/miner-43.png";
import m44 from "@/assets/miners/miner-44.png";
import m45 from "@/assets/miners/miner-45.png";
import m46 from "@/assets/miners/miner-46.png";
import m47 from "@/assets/miners/miner-47.png";
import m48 from "@/assets/miners/miner-48.png";
import m49 from "@/assets/miners/miner-49.png";
import m50 from "@/assets/miners/miner-50.png";
import m51 from "@/assets/miners/miner-51.png";
import m52 from "@/assets/miners/miner-52.png";
import m53 from "@/assets/miners/miner-53.png";
import m54 from "@/assets/miners/miner-54.png";
import m55 from "@/assets/miners/miner-55.png";
import m56 from "@/assets/miners/miner-56.png";
import m57 from "@/assets/miners/miner-57.png";
import m58 from "@/assets/miners/miner-58.png";
import m59 from "@/assets/miners/miner-59.png";
import m60 from "@/assets/miners/miner-60.png";
import m61 from "@/assets/miners/miner-61.png";
import m62 from "@/assets/miners/miner-62.png";
import m63 from "@/assets/miners/miner-63.png";
import m64 from "@/assets/miners/miner-64.png";
import m65 from "@/assets/miners/miner-65.png";
import m66 from "@/assets/miners/miner-66.png";
import m67 from "@/assets/miners/miner-67.png";
import m68 from "@/assets/miners/miner-68.png";
import m69 from "@/assets/miners/miner-69.png";
import m70 from "@/assets/miners/miner-70.png";
import m71 from "@/assets/miners/miner-71.png";
import m72 from "@/assets/miners/miner-72.png";
import m73 from "@/assets/miners/miner-73.png";
import m74 from "@/assets/miners/miner-74.png";
import m75 from "@/assets/miners/miner-75.png";
import m76 from "@/assets/miners/miner-76.png";
import m77 from "@/assets/miners/miner-77.png";
import m78 from "@/assets/miners/miner-78.png";
import m79 from "@/assets/miners/miner-79.png";
import m80 from "@/assets/miners/miner-80.png";
import m81 from "@/assets/miners/miner-81.png";
import m82 from "@/assets/miners/miner-82.png";
import m83 from "@/assets/miners/miner-83.png";
import m84 from "@/assets/miners/miner-84.png";
import m85 from "@/assets/miners/miner-85.png";
import m86 from "@/assets/miners/miner-86.png";
import m87 from "@/assets/miners/miner-87.png";
import m88 from "@/assets/miners/miner-88.png";
import m89 from "@/assets/miners/miner-89.png";
import m90 from "@/assets/miners/miner-90.png";
import m91 from "@/assets/miners/miner-91.png";
import m92 from "@/assets/miners/miner-92.png";
import m93 from "@/assets/miners/miner-93.png";
import m94 from "@/assets/miners/miner-94.png";
import m95 from "@/assets/miners/miner-95.png";
import m96 from "@/assets/miners/miner-96.png";
import m97 from "@/assets/miners/miner-97.png";
import m98 from "@/assets/miners/miner-98.png";
import m99 from "@/assets/miners/miner-99.png";
import m100 from "@/assets/miners/miner-100.png";

const images = [
  m01, m02, m03, m04, m05, m06, m07, m08, m09, m10,
  m11, m12, m13, m14, m15, m16, m17, m18, m19, m20,
  m21, m22, m23, m24, m25, m26, m27, m28, m29, m30,
  m31, m32, m33, m34, m35, m36, m37, m38, m39, m40,
  m41, m42, m43, m44, m45, m46, m47, m48, m49, m50,
  m51, m52, m53, m54, m55, m56, m57, m58, m59, m60,
  m61, m62, m63, m64, m65, m66, m67, m68, m69, m70,
  m71, m72, m73, m74, m75, m76, m77, m78, m79, m80,
  m81, m82, m83, m84, m85, m86, m87, m88, m89, m90,
  m91, m92, m93, m94, m95, m96, m97, m98, m99, m100,
];

const meta: Array<Omit<Miner, "id" | "image">> = [
  // BASIC (1U) — Entry / USB / Pi (1-10)
  { name: "USB Miner v1",       description: "Entry level miner.",              tier: "BASIC", unit: "1U",  hashRate: 5,    price: 25 },
  { name: "Dual USB Stick",     description: "Two chips, twice the hash.",      tier: "BASIC", unit: "1U",  hashRate: 8,    price: 40 },
  { name: "Raspberry Pi Node",  description: "Homebrew SBC miner.",             tier: "BASIC", unit: "1U",  hashRate: 12,   price: 60 },
  { name: "Arduino Rig",        description: "Breadboard hack — barely legal.", tier: "BASIC", unit: "1U",  hashRate: 10,   price: 50 },
  { name: "Nano Dongle",        description: "Pocket-sized, low draw.",         tier: "BASIC", unit: "1U",  hashRate: 6,    price: 30 },
  { name: "Pocket Hasher",      description: "Handheld crypto pocket unit.",    tier: "BASIC", unit: "1U",  hashRate: 14,   price: 75 },
  { name: "Bread Board X",      description: "Open PCB rig, DIY vibe.",         tier: "BASIC", unit: "1U",  hashRate: 11,   price: 55 },
  { name: "Chip Miner",         description: "Single ASIC processor.",          tier: "BASIC", unit: "1U",  hashRate: 15,   price: 80 },
  { name: "Pi Cluster Mini",    description: "3× SBC stacked cluster.",         tier: "BASIC", unit: "1U",  hashRate: 22,   price: 120 },
  { name: "LED Cube v0",        description: "Cube covered in status LEDs.",    tier: "BASIC", unit: "1U",  hashRate: 18,   price: 95 },

  // PRO (2U) — ASIC (11-20)
  { name: "ASIC Mini",          description: "Efficient mid-tier miner.",       tier: "PRO",   unit: "2U",  hashRate: 25,   price: 100 },
  { name: "ASIC Standard",      description: "Rack-mount workhorse.",           tier: "PRO",   unit: "2U",  hashRate: 40,   price: 180 },
  { name: "ASIC Turbo",         description: "Overclocked, cooling maxed.",     tier: "PRO",   unit: "2U",  hashRate: 55,   price: 260 },
  { name: "Antminer S-Type",    description: "Dual-fan vertical ASIC.",         tier: "PRO",   unit: "2U",  hashRate: 65,   price: 320 },
  { name: "Hash Blade",         description: "Flat blade, dense chip layout.",  tier: "PRO",   unit: "2U",  hashRate: 48,   price: 220 },
  { name: "Silent Vault",       description: "Closed, low-noise ASIC.",         tier: "PRO",   unit: "2U",  hashRate: 45,   price: 210 },
  { name: "Twin ASIC",          description: "Dual-brick paired unit.",         tier: "PRO",   unit: "2U",  hashRate: 72,   price: 360 },
  { name: "Quad Brick",         description: "Four fans, brute force.",         tier: "PRO",   unit: "2U",  hashRate: 90,   price: 450 },
  { name: "ASIC Pro X",         description: "LED display, live metrics.",      tier: "PRO",   unit: "2U",  hashRate: 78,   price: 400 },
  { name: "Tower ASIC",         description: "Vertical stack for density.",     tier: "PRO",   unit: "2U",  hashRate: 85,   price: 430 },

  // ELITE (3U) — GPU rigs (21-30)
  { name: "GPU Triple",         description: "3× GPU open frame.",              tier: "ELITE", unit: "3U",  hashRate: 120,  price: 650 },
  { name: "6-Card Rig",         description: "Six-card open air rig.",          tier: "ELITE", unit: "3U",  hashRate: 220,  price: 1100 },
  { name: "Hydro Cooled",       description: "Water loop, green coolant.",      tier: "ELITE", unit: "3U",  hashRate: 260,  price: 1400 },
  { name: "Immersion Tank",     description: "GPUs submerged in dielectric.",   tier: "ELITE", unit: "3U",  hashRate: 300,  price: 1650 },
  { name: "RTX Beast",          description: "Triple-fan flagship GPU.",        tier: "ELITE", unit: "3U",  hashRate: 180,  price: 950 },
  { name: "Multi-GPU Tower",    description: "Windowed case, RGB glow.",        tier: "ELITE", unit: "3U",  hashRate: 240,  price: 1250 },
  { name: "Deluxe Frame",       description: "8-card frame with PSU stack.",    tier: "ELITE", unit: "3U",  hashRate: 340,  price: 1800 },
  { name: "Neon Rig",           description: "Bright ring-fan RGB build.",      tier: "ELITE", unit: "3U",  hashRate: 200,  price: 1050 },
  { name: "Overclocked Monster",description: "Massive copper heatsinks.",       tier: "ELITE", unit: "3U",  hashRate: 280,  price: 1500 },
  { name: "GPU Farm",           description: "Multi-shelf server rack.",        tier: "ELITE", unit: "3U",  hashRate: 400,  price: 2200 },

  // QUANTUM (4U) — Futuristic (31-40)
  { name: "Quantum Core",       description: "Spherical Q-processor.",          tier: "QUANTUM", unit: "4U", hashRate: 550,  price: 3200 },
  { name: "Cryo Miner",         description: "-196°C liquid cooled.",           tier: "QUANTUM", unit: "4U", hashRate: 620,  price: 3600 },
  { name: "Plasma Reactor",     description: "Contained plasma hasher.",        tier: "QUANTUM", unit: "4U", hashRate: 700,  price: 4100 },
  { name: "Levitating Cube",    description: "Magnetically suspended core.",    tier: "QUANTUM", unit: "4U", hashRate: 780,  price: 4600 },
  { name: "Neural Hasher",      description: "Synaptic pattern miner.",         tier: "QUANTUM", unit: "4U", hashRate: 640,  price: 3800 },
  { name: "AI Overseer",        description: "Autonomous mining AI.",           tier: "QUANTUM", unit: "4U", hashRate: 820,  price: 4900 },
  { name: "Holo Projector",     description: "Wireframe cube hasher.",          tier: "QUANTUM", unit: "4U", hashRate: 710,  price: 4200 },
  { name: "Dimension Portal",   description: "Vortex-driven mining.",           tier: "QUANTUM", unit: "4U", hashRate: 900,  price: 5400 },
  { name: "Quantum Rack",       description: "Full-height Q-tube rack.",        tier: "QUANTUM", unit: "4U", hashRate: 1050, price: 6200 },
  { name: "Zero-Point Reactor", description: "Vacuum-energy tap.",              tier: "QUANTUM", unit: "4U", hashRate: 1200, price: 7000 },

  // MYTHIC (5U) — Legendary (41-50)
  { name: "Cyber Dragon",       description: "Legendary dragon-form ASIC.",     tier: "MYTHIC", unit: "5U", hashRate: 1500, price: 9500 },
  { name: "Cyber Skull",        description: "Cranial hasher w/ optic cores.",  tier: "MYTHIC", unit: "5U", hashRate: 1650, price: 10500 },
  { name: "Alien Saucer",       description: "Xeno-tech mining disc.",          tier: "MYTHIC", unit: "5U", hashRate: 1800, price: 11800 },
  { name: "Mecha Miner",        description: "Autonomous mining mech.",         tier: "MYTHIC", unit: "5U", hashRate: 1950, price: 12800 },
  { name: "Void Core",          description: "Singularity-powered engine.",     tier: "MYTHIC", unit: "5U", hashRate: 2200, price: 14500 },
  { name: "Genesis Obelisk",    description: "First-block monolith.",           tier: "MYTHIC", unit: "5U", hashRate: 2400, price: 16000 },
  { name: "Satoshi Prime",      description: "Legendary golden rig.",           tier: "MYTHIC", unit: "5U", hashRate: 2800, price: 19000 },
  { name: "Matrix Overlord",    description: "Cascade code hasher tower.",      tier: "MYTHIC", unit: "5U", hashRate: 3100, price: 21500 },
  { name: "Terminal God",       description: "Six-CRT command station.",        tier: "MYTHIC", unit: "5U", hashRate: 3400, price: 24000 },
  { name: "Blockchain Titan",   description: "Ultimate humanoid miner.",        tier: "MYTHIC", unit: "5U", hashRate: 4000, price: 28500 },

  // ── EXPANSION PACK: +50 MORE ──────────────────────────────
  // BASIC (1U) — Extra (51-60)
  { name: "USB Stick MK2",       description: "Refined pocket USB hasher.",       tier: "BASIC", unit: "1U", hashRate: 7,   price: 35 },
  { name: "Segment Display",     description: "5-digit LED counter miner.",       tier: "BASIC", unit: "1U", hashRate: 9,   price: 45 },
  { name: "Solar Chip",          description: "Off-grid solar mini-hasher.",      tier: "BASIC", unit: "1U", hashRate: 13,  price: 70 },
  { name: "Floppy Hasher",       description: "Retro floppy drive retrofit.",     tier: "BASIC", unit: "1U", hashRate: 16,  price: 85 },
  { name: "Calc Miner",          description: "Pocket calculator turned rig.",    tier: "BASIC", unit: "1U", hashRate: 8,   price: 42 },
  { name: "Gameboy Hash",        description: "Handheld console cracked open.",   tier: "BASIC", unit: "1U", hashRate: 17,  price: 90 },
  { name: "Dev Board Pro",       description: "Full dev-board with SoC.",         tier: "BASIC", unit: "1U", hashRate: 19,  price: 100 },
  { name: "Cassette Rig",        description: "Tape-form portable miner.",        tier: "BASIC", unit: "1U", hashRate: 12,  price: 65 },
  { name: "Antenna Node",        description: "Wireless mesh mining node.",       tier: "BASIC", unit: "1U", hashRate: 14,  price: 78 },
  { name: "Quad Pi Stack",       description: "4× Pi vertical cluster.",          tier: "BASIC", unit: "1U", hashRate: 24,  price: 130 },

  // PRO (2U) — Extra (61-70)
  { name: "Rack ASIC v2",        description: "Refined rack-mount ASIC.",         tier: "PRO",   unit: "2U", hashRate: 32,  price: 150 },
  { name: "Turbo Fan Unit",      description: "Single hurricane fan design.",     tier: "PRO",   unit: "2U", hashRate: 58,  price: 280 },
  { name: "Industrial Boiler",   description: "Coolant piping industrial ASIC.",  tier: "PRO",   unit: "2U", hashRate: 68,  price: 340 },
  { name: "Triple Stack Fan",    description: "Vertical triple-fan brick.",       tier: "PRO",   unit: "2U", hashRate: 76,  price: 390 },
  { name: "Blade Server",        description: "Slim rack blade miner.",           tier: "PRO",   unit: "2U", hashRate: 50,  price: 240 },
  { name: "Hex Cube",            description: "Hex-mesh cube ASIC.",              tier: "PRO",   unit: "2U", hashRate: 82,  price: 420 },
  { name: "Wall Grid",           description: "6-fan wall-mounted grid.",         tier: "PRO",   unit: "2U", hashRate: 95,  price: 470 },
  { name: "Hex Vortex",          description: "Hex ring-fan single core.",        tier: "PRO",   unit: "2U", hashRate: 62,  price: 310 },
  { name: "Modular Stack",       description: "Modular cable-linked bricks.",     tier: "PRO",   unit: "2U", hashRate: 88,  price: 440 },
  { name: "Field Case",          description: "Portable field-ops miner case.",   tier: "PRO",   unit: "2U", hashRate: 70,  price: 350 },

  // ELITE (3U) — Extra (71-80)
  { name: "Quad GPU Frame",      description: "4× GPU orange-accent frame.",      tier: "ELITE", unit: "3U", hashRate: 160, price: 850 },
  { name: "LED Strip Rig",       description: "Green LED strip open frame.",      tier: "ELITE", unit: "3U", hashRate: 210, price: 1080 },
  { name: "Glass Tower",         description: "Tempered glass mini tower.",       tier: "ELITE", unit: "3U", hashRate: 195, price: 1000 },
  { name: "Dual Mobo Rig",       description: "Twin-motherboard 12-GPU rig.",     tier: "ELITE", unit: "3U", hashRate: 360, price: 1900 },
  { name: "Radiator Beast",      description: "Top-flow radiator triple fan.",    tier: "ELITE", unit: "3U", hashRate: 250, price: 1350 },
  { name: "Wall Rack Rig",       description: "Wall-mount 5-GPU rack.",           tier: "ELITE", unit: "3U", hashRate: 230, price: 1200 },
  { name: "Mesh Cage",           description: "Mesh cage 10-GPU beast.",          tier: "ELITE", unit: "3U", hashRate: 380, price: 2000 },
  { name: "Hardline Loop",       description: "Hardline water-cooled build.",     tier: "ELITE", unit: "3U", hashRate: 320, price: 1700 },
  { name: "Holo Rig",            description: "Holographic display overlay.",     tier: "ELITE", unit: "3U", hashRate: 290, price: 1550 },
  { name: "Datacenter Bank",     description: "16-GPU industrial bank.",          tier: "ELITE", unit: "3U", hashRate: 450, price: 2400 },

  // QUANTUM (4U) — Extra (81-90)
  { name: "Tetra Core",          description: "Tetrahedral plasma core.",         tier: "QUANTUM", unit: "4U", hashRate: 580,  price: 3400 },
  { name: "Torus Reactor",       description: "Rotating torus energy ring.",      tier: "QUANTUM", unit: "4U", hashRate: 660,  price: 3900 },
  { name: "Crystal Shard",       description: "Emerald shard hasher.",            tier: "QUANTUM", unit: "4U", hashRate: 720,  price: 4300 },
  { name: "Singularity",         description: "Contained black-hole miner.",      tier: "QUANTUM", unit: "4U", hashRate: 850,  price: 5000 },
  { name: "Helix Hasher",        description: "DNA-helix light-transit hasher.",  tier: "QUANTUM", unit: "4U", hashRate: 690,  price: 4050 },
  { name: "Orbital Ring",        description: "Satellite ring generator.",        tier: "QUANTUM", unit: "4U", hashRate: 940,  price: 5600 },
  { name: "Rune Pyramid",        description: "Glyph-etched obsidian pyramid.",   tier: "QUANTUM", unit: "4U", hashRate: 760,  price: 4500 },
  { name: "Fractal Orb",         description: "Floating fractal energy orb.",     tier: "QUANTUM", unit: "4U", hashRate: 810,  price: 4800 },
  { name: "Tesla Tower",         description: "Tesla-coil arc miner.",            tier: "QUANTUM", unit: "4U", hashRate: 970,  price: 5800 },
  { name: "Wormhole Gate",       description: "Vortex gate portal miner.",        tier: "QUANTUM", unit: "4U", hashRate: 1100, price: 6600 },

  // MYTHIC (5U) — Extra (91-100)
  { name: "Cyber Phoenix",       description: "Reborn code-flame phoenix.",       tier: "MYTHIC", unit: "5U", hashRate: 1550, price: 9800 },
  { name: "Netrunner Kraken",    description: "Cabled kraken uplinked to rack.",  tier: "MYTHIC", unit: "5U", hashRate: 1700, price: 10800 },
  { name: "Samurai Mech",        description: "Katana-wielding blockchain mech.", tier: "MYTHIC", unit: "5U", hashRate: 1850, price: 12100 },
  { name: "Circuit Golem",       description: "Stone golem laced with circuits.", tier: "MYTHIC", unit: "5U", hashRate: 2000, price: 13200 },
  { name: "Code Seraph",         description: "Winged code-angel with halo.",     tier: "MYTHIC", unit: "5U", hashRate: 2300, price: 15000 },
  { name: "Occult Spire",        description: "Pentagram-core gothic tower.",     tier: "MYTHIC", unit: "5U", hashRate: 2500, price: 16500 },
  { name: "Arachno-Rig",         description: "Eight-legged mining arachnid.",    tier: "MYTHIC", unit: "5U", hashRate: 2900, price: 19500 },
  { name: "Data Leviathan",      description: "Whale swimming data streams.",     tier: "MYTHIC", unit: "5U", hashRate: 3200, price: 22000 },
  { name: "Eye of Satoshi",      description: "All-seeing coin-cored eye.",       tier: "MYTHIC", unit: "5U", hashRate: 3600, price: 25000 },
  { name: "Crypto Emperor",      description: "Crowned deity of the chain.",      tier: "MYTHIC", unit: "5U", hashRate: 4500, price: 32000 },
];

export const MINERS: Miner[] = meta.map((m, i) => ({
  ...m,
  id: i + 1,
  image: images[i],
}));

export const TIER_ORDER: Tier[] = ["BASIC", "PRO", "ELITE", "QUANTUM", "MYTHIC"];
