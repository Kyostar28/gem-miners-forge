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

export interface AvatarModel {
  key: string;
  name: string;
  src: string;
}

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
];

export const AVATAR_MAP: Record<string, AvatarModel> = Object.fromEntries(
  AVATARS.map((a) => [a.key, a]),
);
