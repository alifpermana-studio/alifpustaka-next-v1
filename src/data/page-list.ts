export interface PageItem {
  id: string;
  title: string;
  path: string;
  description: string;
  category: "Main" | "Section" | "Resource";
}

export const PAGE_LIST: PageItem[] = [
  {
    id: "page-01",
    title: "Home",
    path: "/",
    description: "Main landing page with portfolio overview",
    category: "Main",
  },
  {
    id: "page-02",
    title: "About",
    path: "/about",
    description: "Learn more about Alif Pustaka",
    category: "Section",
  },
  {
    id: "page-03",
    title: "Skills",
    path: "/skills",
    description: "Technical skills and expertise",
    category: "Section",
  },
  {
    id: "page-04",
    title: "Experience",
    path: "/experience",
    description: "Professional work experience",
    category: "Section",
  },
  {
    id: "page-05",
    title: "Projects",
    path: "/projects",
    description: "Portfolio of completed projects",
    category: "Section",
  },
  {
    id: "page-06",
    title: "Services",
    path: "/services",
    description: "Services offered",
    category: "Section",
  },
  {
    id: "page-07",
    title: "Contact",
    path: "/contact",
    description: "Get in touch",
    category: "Section",
  },
  {
    id: "page-08",
    title: "Templates",
    path: "/templates",
    description: "Browse design templates and resources",
    category: "Resource",
  },
];
