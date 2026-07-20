import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ExternalLink,
  ShoppingCart,
  Briefcase,
  Users,
  Layout,
  FileText,
  Globe,
} from "lucide-react";

const projects = [
  {
    category: "Portfolio Templates",
    count: "11+",
    icon: Briefcase,
    description:
      "Modern, responsive portfolio websites built to showcase personal brands and creative work.",
    tags: ["Next.js", "React", "Tailwind CSS"],
    color: "from-sky-400 to-cyan-400",
  },
  {
    category: "Admin Templates",
    count: "4",
    icon: Layout,
    description:
      "Powerful admin dashboards with data visualization, user management, and analytics features.",
    tags: ["React", "Express.js", "PostgreSQL"],
    color: "from-indigo-400 to-violet-400",
  },
  {
    category: "Blog Templates",
    count: "6",
    icon: FileText,
    description:
      "Content-focused blog platforms with SEO optimization, markdown support, and clean typography.",
    tags: ["Next.js", "MongoDB", "MDX"],
    color: "from-violet-400 to-fuchsia-400",
  },
  {
    category: "E-commerce Site",
    count: "1",
    icon: ShoppingCart,
    description:
      "A complete online store with product management, cart functionality, and secure checkout.",
    tags: ["Next.js", "Stripe", "Firebase"],
    color: "from-emerald-400 to-teal-400",
  },
  {
    category: "Company Profiles",
    count: "2",
    icon: Globe,
    description:
      "Professional company websites designed to establish credibility and generate leads.",
    tags: ["React", "Tailwind", "CMS"],
    color: "from-amber-400 to-orange-400",
  },
  {
    category: "Community Forum",
    count: "1",
    icon: Users,
    description:
      "A community-driven forum with real-time discussions, user roles, and moderation tools.",
    tags: ["Django", "PostgreSQL", "WebSocket"],
    color: "from-rose-400 to-pink-400",
  },
];

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="bg-base-100 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-base-content mb-3 text-sm font-semibold tracking-wide uppercase">
            Portfolio
          </p>
          <h2 className="text-primary mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Featured work
          </h2>
          <p className="text-secondary mx-auto max-w-2xl text-lg">
            A collection of templates and applications I've built, covering
            portfolios, admin panels, blogs, e-commerce, and community
            platforms.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.category}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-2xl border border-white/10 bg-white/3 p-6 transition-all hover:border-sky-400/30 hover:bg-white/5"
            >
              <div className="mb-5 flex items-start justify-between">
                <div
                  className={`h-12 w-12 rounded-xl bg-linear-to-br ${project.color} flex items-center justify-center`}
                >
                  <project.icon className="text-base-content h-6 w-6" />
                </div>
                <span className="text-base-content text-3xl font-extrabold">
                  {project.count}
                </span>
              </div>
              <h3 className="text-accent mb-2 text-xl font-bold">
                {project.category}
              </h3>
              <p className="text-base-content/80 mb-5 text-sm leading-relaxed">
                {project.description}
              </p>
              <div className="mb-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-base-content/25 bg-base-300/5 text-base-content rounded-md border px-2.5 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-sky-400 transition-colors group-hover:gap-3 hover:text-sky-300">
                View details <ExternalLink className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
