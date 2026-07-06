export type Category =
  | "Print Templates"
  | "Product Mockups"
  | "Websites"
  | "UX and UI Kits"
  | "Infographics"
  | "Logos"
  | "Scene Generators"
  | "Social Media";

export type ColorSpace = "RGB" | "CMYK";
export type Orientation = "Landscape" | "Portrait" | "Square";
export type Application =
  | "Adobe Photoshop"
  | "Adobe Illustrator"
  | "Adobe InDesign"
  | "Adobe XD"
  | "Affinity"
  | "Figma"
  | "Sketch"
  | "Canva";
export type Property = "Vector" | "Layered";

export interface ContentItem {
  id: string;
  title: string;
  author: string;
  category: Category;
  colorSpace: ColorSpace[];
  orientation: Orientation;
  applications: Application[];
  properties: Property[];
  popularity: number; // higher = more popular
  dateAdded: string; // ISO date — higher = newer
  thumbnail: string;
  accent: string; // gradient color for placeholder
}

export const CATEGORIES: Category[] = [
  "Print Templates",
  "Product Mockups",
  "Websites",
  "UX and UI Kits",
  "Infographics",
  "Logos",
  "Scene Generators",
  "Social Media",
];

export const COLOR_SPACES: ColorSpace[] = ["RGB", "CMYK"];
export const ORIENTATIONS: Orientation[] = ["Landscape", "Portrait", "Square"];
export const APPLICATIONS: Application[] = [
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Adobe InDesign",
  "Adobe XD",
  "Affinity",
  "Figma",
  "Sketch",
  "Canva",
];
export const PROPERTIES: Property[] = ["Vector", "Layered"];

// 18 items so the grid feels populated and filter combos are meaningful
export const ITEMS: ContentItem[] = [
  {
    id: "tpl-01",
    title: "Saasify — SaaS Landing Page",
    author: "Pixelbarn",
    category: "Websites",
    colorSpace: ["RGB"],
    orientation: "Landscape",
    applications: ["Figma", "Adobe XD", "Sketch"],
    properties: ["Vector", "Layered"],
    popularity: 9850,
    dateAdded: "2026-01-12",
    thumbnail: "/templates/template-1.jpg",
    accent: "from-indigo-500 to-purple-500",
  },
  {
    id: "tpl-02",
    title: "Bloom — Wedding Invitation Suite",
    author: "HelloStudio",
    category: "Print Templates",
    colorSpace: ["CMYK", "RGB"],
    orientation: "Portrait",
    applications: ["Adobe Illustrator", "Adobe InDesign", "Canva"],
    properties: ["Vector", "Layered"],
    popularity: 7820,
    dateAdded: "2026-01-04",
    thumbnail: "/templates/template-3.jpg",
    accent: "from-pink-400 to-rose-500",
  },
  {
    id: "tpl-03",
    title: "Pulse — Music Festival Poster",
    author: "Neon Folk",
    category: "Print Templates",
    colorSpace: ["CMYK"],
    orientation: "Portrait",
    applications: ["Adobe Photoshop", "Adobe Illustrator"],
    properties: ["Layered"],
    popularity: 6420,
    dateAdded: "2025-12-20",
    thumbnail: "/templates/template-2.jpg",
    accent: "from-yellow-400 to-orange-500",
  },
  {
    id: "tpl-04",
    title: "InstaGrid — Stories & Posts Kit",
    author: "SocialKit Co.",
    category: "Social Media",
    colorSpace: ["RGB"],
    orientation: "Square",
    applications: ["Figma", "Canva", "Adobe Photoshop"],
    properties: ["Layered"],
    popularity: 12340,
    dateAdded: "2026-01-18",
    thumbnail: "/templates/template-4.jpg",
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    id: "tpl-05",
    title: "DataVue — Annual Report Infographic",
    author: "Chartly",
    category: "Infographics",
    colorSpace: ["CMYK", "RGB"],
    orientation: "Landscape",
    applications: ["Adobe Illustrator", "Figma"],
    properties: ["Vector", "Layered"],
    popularity: 5310,
    dateAdded: "2025-11-30",
    thumbnail: "/templates/template-5.jpg",
    accent: "from-sky-400 to-blue-600",
  },
  {
    id: "tpl-06",
    title: "Monogram — Logo Builder",
    author: "Marka Studio",
    category: "Logos",
    colorSpace: ["RGB", "CMYK"],
    orientation: "Square",
    applications: ["Adobe Illustrator", "Affinity", "Canva"],
    properties: ["Vector"],
    popularity: 8970,
    dateAdded: "2025-12-15",
    thumbnail: "/templates/template-6.jpg",
    accent: "from-emerald-400 to-teal-600",
  },
  {
    id: "tpl-07",
    title: "Boxify — Square Box Mockup",
    author: "Mockup Lab",
    category: "Product Mockups",
    colorSpace: ["RGB"],
    orientation: "Square",
    applications: ["Adobe Photoshop", "Figma", "Affinity"],
    properties: ["Layered"],
    popularity: 7240,
    dateAdded: "2026-01-08",
    thumbnail: "/templates/template-7.jpg",
    accent: "from-stone-400 to-stone-600",
  },
  {
    id: "tpl-08",
    title: "FinanceFlow — Mobile Banking UI",
    author: "Apptide",
    category: "UX and UI Kits",
    colorSpace: ["RGB"],
    orientation: "Portrait",
    applications: ["Figma", "Sketch", "Adobe XD"],
    properties: ["Vector", "Layered"],
    popularity: 11200,
    dateAdded: "2026-01-15",
    thumbnail: "/templates/template-8.jpg",
    accent: "from-violet-500 to-indigo-600",
  },
  {
    id: "tpl-09",
    title: "SaleStorm — Retail Flyer Pack",
    author: "Print Forge",
    category: "Print Templates",
    colorSpace: ["CMYK"],
    orientation: "Landscape",
    applications: ["Adobe InDesign", "Adobe Photoshop"],
    properties: ["Layered"],
    popularity: 4680,
    dateAdded: "2025-10-22",
    thumbnail: "/templates/template-9.jpg",
    accent: "from-red-500 to-orange-500",
  },
  {
    id: "tpl-10",
    title: "CareerPro — Resume & Cover Letter",
    author: "HelloStudio",
    category: "Print Templates",
    colorSpace: ["RGB", "CMYK"],
    orientation: "Portrait",
    applications: ["Adobe InDesign", "Canva", "Microsoft Word" as Application],
    properties: ["Layered"],
    popularity: 6910,
    dateAdded: "2025-12-02",
    thumbnail: "/templates/template-10.jpg",
    accent: "from-slate-500 to-slate-700",
  },
  {
    id: "tpl-11",
    title: "Mailerly — Newsletter Bundle",
    author: "Inboxlab",
    category: "Websites",
    colorSpace: ["RGB"],
    orientation: "Landscape",
    applications: ["Figma", "Sketch", "Adobe XD"],
    properties: ["Vector", "Layered"],
    popularity: 5740,
    dateAdded: "2026-01-02",
    thumbnail: "/templates/template-11.jpg",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    id: "tpl-12",
    title: "Keynote — Pitch Deck Slides",
    author: "Slidehaus",
    category: "Websites",
    colorSpace: ["RGB"],
    orientation: "Landscape",
    applications: ["Figma", "Canva", "Adobe Illustrator"],
    properties: ["Vector", "Layered"],
    popularity: 10250,
    dateAdded: "2025-12-28",
    thumbnail: "/templates/template-12.jpg",
    accent: "from-amber-400 to-rose-500",
  },
  {
    id: "tpl-13",
    title: "EcoLeaf — Brand Scene Generator",
    author: "SceneKit",
    category: "Scene Generators",
    colorSpace: ["RGB"],
    orientation: "Landscape",
    applications: ["Adobe Photoshop", "Figma"],
    properties: ["Layered"],
    popularity: 4180,
    dateAdded: "2026-01-20",
    thumbnail: "/templates/template-1.jpg",
    accent: "from-lime-400 to-green-600",
  },
  {
    id: "tpl-14",
    title: "Trendly — TikTok & Reels Kit",
    author: "SocialKit Co.",
    category: "Social Media",
    colorSpace: ["RGB"],
    orientation: "Portrait",
    applications: ["Canva", "Figma", "Adobe Photoshop"],
    properties: ["Layered"],
    popularity: 14500,
    dateAdded: "2026-01-22",
    thumbnail: "/templates/template-4.jpg",
    accent: "from-pink-500 to-purple-600",
  },
  {
    id: "tpl-15",
    title: "Quirky — Kids Logo Pack",
    author: "Marka Studio",
    category: "Logos",
    colorSpace: ["RGB", "CMYK"],
    orientation: "Square",
    applications: ["Adobe Illustrator"],
    properties: ["Vector"],
    popularity: 3220,
    dateAdded: "2025-11-11",
    thumbnail: "/templates/template-6.jpg",
    accent: "from-orange-400 to-red-500",
  },
  {
    id: "tpl-16",
    title: "BottleUp — Beverage Mockup",
    author: "Mockup Lab",
    category: "Product Mockups",
    colorSpace: ["RGB"],
    orientation: "Portrait",
    applications: ["Adobe Photoshop"],
    properties: ["Layered"],
    popularity: 5990,
    dateAdded: "2025-12-09",
    thumbnail: "/templates/template-7.jpg",
    accent: "from-zinc-400 to-zinc-700",
  },
  {
    id: "tpl-17",
    title: "Statly — Stats Infographic",
    author: "Chartly",
    category: "Infographics",
    colorSpace: ["CMYK", "RGB"],
    orientation: "Landscape",
    applications: ["Adobe Illustrator", "Figma", "Canva"],
    properties: ["Vector", "Layered"],
    popularity: 8740,
    dateAdded: "2026-01-06",
    thumbnail: "/templates/template-5.jpg",
    accent: "from-blue-500 to-indigo-600",
  },
  {
    id: "tpl-18",
    title: "Nimbus — Dashboard UI Kit",
    author: "Apptide",
    category: "UX and UI Kits",
    colorSpace: ["RGB"],
    orientation: "Landscape",
    applications: ["Figma", "Sketch", "Adobe XD"],
    properties: ["Vector", "Layered"],
    popularity: 13800,
    dateAdded: "2025-12-25",
    thumbnail: "/templates/template-8.jpg",
    accent: "from-teal-400 to-cyan-600",
  },
];

export const NAV_LINKS = [
  "Gen AI",
  "Video Templates",
  "Stock Video",
  "Audio",
  "Graphics",
  "Design Templates",
  "Photos",
  "3D",
  "Fonts",
  "More",
];
