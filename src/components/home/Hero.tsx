import { motion } from "framer-motion";
import { ArrowDown, Mail, FileText } from "lucide-react";
import { GithubIcon, LinkedInIcon } from "@/icons/brands/index";

export default function Hero() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-18">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-sky-300"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Available for new projects
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Full-Stack
          <br />
          <span className="bg-linear-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Developer
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl"
        >
          I design and build modern web applications with robust backends,
          scalable databases, and secure cloud storage. From idea to deployment,
          I deliver production-ready solutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            onClick={() => scrollTo("#projects")}
            className="rounded-full bg-sky-400 px-8 py-4 text-base font-semibold text-[#060912] transition-all hover:scale-105 hover:bg-sky-300"
          >
            View My Work
          </button>
          <button
            onClick={() => scrollTo("#contact")}
            className="rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/5"
          >
            Get In Touch
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-4"
        >
          {[
            { icon: GithubIcon, href: "https://github.com", label: "Github" },
            {
              icon: LinkedInIcon,
              href: "https://linkedin.com",
              label: "LinkedIn",
            },
            { icon: Mail, href: "mailto:hello@alexrivera.dev", label: "Email" },
            { icon: FileText, href: "#", label: "Resume" },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-sky-400/50 hover:bg-white/10 hover:text-white"
            >
              <Icon
                className={`h-5 w-5 ${label === "Github" && "brightness-0 invert"}`}
              />
            </a>
          ))}
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => scrollTo("#about")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 transition-colors hover:text-sky-400"
        aria-label="Scroll down"
      >
        <ArrowDown className="h-6 w-6 animate-bounce" />
      </motion.button>
    </section>
  );
}
