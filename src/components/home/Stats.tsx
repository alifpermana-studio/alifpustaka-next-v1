import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "11+", label: "Portfolio Templates" },
  { value: "4", label: "Admin Templates" },
  { value: "6", label: "Blog Templates" },
  { value: "1", label: "E-commerce Site" },
  { value: "2", label: "Company Profiles" },
  { value: "1", label: "Community Forum" },
];

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="experience"
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-sky-500/5 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-semibold tracking-wide text-sky-400 uppercase">
            Experience
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Projects I've delivered
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            A proven track record of building diverse, production-ready web
            solutions across multiple industries and use cases.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/3 p-6 text-center transition-all hover:border-sky-400/30 hover:bg-white/5 lg:p-8"
            >
              <div className="mb-2 bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-4xl font-extrabold text-transparent lg:text-5xl">
                {stat.value}
              </div>
              <div className="font-medium text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
