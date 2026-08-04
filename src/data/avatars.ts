import a01 from "@/assets/avatars/avatar-01.png";
import a02 from "@/assets/avatars/avatar-02.png";
import a03 from "@/assets/avatars/avatar-03.png";
import a04 from "@/assets/avatars/avatar-04.png";
import a05 from "@/assets/avatars/avatar-05.png";
import a06 from "@/assets/avatars/avatar-06.png";
import a07 from "@/assets/avatars/avatar-07.png";
import a08 from "@/assets/avatars/avatar-08.png";
import a09 from "@/assets/avatars/avatar-09.png";
import a10 from "@/assets/avatars/avatar-10.png";
import a11 from "@/assets/avatars/avatar-11.png";
import a12 from "@/assets/avatars/avatar-12.png";
import a13 from "@/assets/avatars/avatar-13.png";
import a14 from "@/assets/avatars/avatar-14.png";
import a15 from "@/assets/avatars/avatar-15.png";
import a16 from "@/assets/avatars/avatar-16.png";
import a17 from "@/assets/avatars/avatar-17.png";
import a18 from "@/assets/avatars/avatar-18.png";
import a19 from "@/assets/avatars/avatar-19.png";
import a20 from "@/assets/avatars/avatar-20.png";
import a21 from "@/assets/avatars/avatar-21.png";
import a22 from "@/assets/avatars/avatar-22.png";
import a23 from "@/assets/avatars/avatar-23.png";
import a24 from "@/assets/avatars/avatar-24.png";
import a25 from "@/assets/avatars/avatar-25.png";
import a26 from "@/assets/avatars/avatar-26.png";
import a27 from "@/assets/avatars/avatar-27.png";
import a28 from "@/assets/avatars/avatar-28.png";
import a29 from "@/assets/avatars/avatar-29.png";
import a30 from "@/assets/avatars/avatar-30.png";
import a31 from "@/assets/avatars/avatar-31.png";
import a32 from "@/assets/avatars/avatar-32.png";
import a33 from "@/assets/avatars/avatar-33.png";
import a34 from "@/assets/avatars/avatar-34.png";
import a35 from "@/assets/avatars/avatar-35.png";
import a36 from "@/assets/avatars/avatar-36.png";
import a37 from "@/assets/avatars/avatar-37.png";
import a38 from "@/assets/avatars/avatar-38.png";
import a39 from "@/assets/avatars/avatar-39.png";
import a40 from "@/assets/avatars/avatar-40.png";
import x01 from "@/assets/avatars/exotic-01.png";
import x02 from "@/assets/avatars/exotic-02.png";
import x03 from "@/assets/avatars/exotic-03.png";
import x04 from "@/assets/avatars/exotic-04.png";
import x05 from "@/assets/avatars/exotic-05.png";
import x06 from "@/assets/avatars/exotic-06.png";
import x07 from "@/assets/avatars/exotic-07.png";
import x08 from "@/assets/avatars/exotic-08.png";
import x09 from "@/assets/avatars/exotic-09.png";
import x10 from "@/assets/avatars/exotic-10.png";

export interface AvatarModel {
  key: string;
  name: string;
  src: string;
  /** exotic avatars are rewards, not selectable at signup */
  exotic?: boolean;
}

/** 40 base avatars — chosen ONCE when the account is created */
export const AVATARS: AvatarModel[] = [
  { key: "visor", name: "Neon Visor Unit", src: a01 },
  { key: "foreman", name: "Rig Foreman", src: a02 },
  { key: "skull", name: "Circuit Skull", src: a03 },
  { key: "gpu", name: "GPU Sentinel", src: a04 },
  { key: "gold", name: "Golden Node", src: a05 },
  { key: "anon", name: "Anon Operator", src: a06 },
  { key: "cryo", name: "Cryo Driller", src: a07 },
  { key: "samurai", name: "Hash Samurai", src: a08 },
  { key: "drone", name: "Pick Drone", src: a09 },
  { key: "quantum", name: "Quantum Ghost", src: a10 },
  { key: "welder", name: "Welder Unit", src: a11 },
  { key: "hardhat", name: "Hard Hat Bot", src: a12 },
  { key: "cyclops", name: "Cyclops Node", src: a13 },
  { key: "matrix", name: "Matrix Hood", src: a14 },
  { key: "fanhead", name: "Fan Head", src: a15 },
  { key: "diver", name: "Deep Diver", src: a16 },
  { key: "punk", name: "Fiber Punk", src: a17 },
  { key: "pickbot", name: "Pickaxe Bot", src: a18 },
  { key: "crt", name: "CRT Smiley", src: a19 },
  { key: "mech", name: "Industrial Mech", src: a20 },
  { key: "sirena", name: "Neon Operator", src: a21 },
  { key: "gasmask", name: "Gas Mask Ghost", src: a22 },
  { key: "coinhead", name: "Coin Head", src: a23 },
  { key: "ninja", name: "Hex Ninja", src: a24 },
  { key: "scrap", name: "Scrapyard Unit", src: a25 },
  { key: "oni", name: "Oni Mech", src: a26 },
  { key: "astro", name: "Astro Miner", src: a27 },
  { key: "wire", name: "Wireframe AI", src: a28 },
  { key: "wolf", name: "Cyber Wolf", src: a29 },
  { key: "capataz", name: "Old Foreman", src: a30 },
  { key: "rackhead", name: "Rack Head", src: a31 },
  { key: "biomech", name: "Biomech Skull", src: a32 },
  { key: "hashbot", name: "Hash Bot", src: a33 },
  { key: "knight", name: "Data Knight", src: a34 },
  { key: "crow", name: "Circuit Crow", src: a35 },
  { key: "vr", name: "VR Runner", src: a36 },
  { key: "magma", name: "Magma Core", src: a37 },
  { key: "frost", name: "Frost Core", src: a38 },
  { key: "pirate", name: "Hash Pirate", src: a39 },
  { key: "courier", name: "Signal Courier", src: a40 },
];

/** 10 exotic avatars — unlocked only as achievement rewards */
export const EXOTIC_AVATARS: AvatarModel[] = [
  { key: "x-deity", name: "Gilded Deity", src: x01, exotic: true },
  { key: "x-void", name: "Void Traveler", src: x02, exotic: true },
  { key: "x-phoenix", name: "Plasma Phoenix", src: x03, exotic: true },
  { key: "x-diamond", name: "Prism Diamond", src: x04, exotic: true },
  { key: "x-overlord", name: "Hash Overlord", src: x05, exotic: true },
  { key: "x-oracle", name: "Chain Oracle", src: x06, exotic: true },
  { key: "x-ghost", name: "Quantum Wraith", src: x07, exotic: true },
  { key: "x-dragon", name: "Emerald Dragon", src: x08, exotic: true },
  { key: "x-overmind", name: "Alien Overmind", src: x09, exotic: true },
  { key: "x-satoshi", name: "Eye of Satoshi", src: x10, exotic: true },
];

export const ALL_AVATARS: AvatarModel[] = [...AVATARS, ...EXOTIC_AVATARS];

export const AVATAR_MAP: Record<string, AvatarModel> = Object.fromEntries(
  ALL_AVATARS.map((a) => [a.key, a]),
);
