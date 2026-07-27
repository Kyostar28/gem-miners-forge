// 50 mineros para CryptoMiner Dark Web Shop
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

// Import all 50 sprites
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

const images = [
  m01, m02, m03, m04, m05, m06, m07, m08, m09, m10,
  m11, m12, m13, m14, m15, m16, m17, m18, m19, m20,
  m21, m22, m23, m24, m25, m26, m27, m28, m29, m30,
  m31, m32, m33, m34, m35, m36, m37, m38, m39, m40,
  m41, m42, m43, m44, m45, m46, m47, m48, m49, m50,
];

const meta: Array<Omit<Miner, "id" | "image">> = [
  // BASIC (1U) — Entry / USB / Pi
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

  // PRO (2U) — ASIC
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

  // ELITE (3U) — GPU rigs
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

  // QUANTUM (4U) — Futuristic
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

  // MYTHIC (5U) — Legendary
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
];

export const MINERS: Miner[] = meta.map((m, i) => ({
  ...m,
  id: i + 1,
  image: images[i],
}));

export const TIER_ORDER: Tier[] = ["BASIC", "PRO", "ELITE", "QUANTUM", "MYTHIC"];
