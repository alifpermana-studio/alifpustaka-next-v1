import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  {
    title: "Languages",
    skills: [
      { name: "JavaScript", level: 95 },
      { name: "Python", level: 90 },
      { name: "C#", level: 85 },
    ],
  },
  {
    title: "Frameworks",
    skills: [
      { name: "Next.js", level: 95 },
      { name: "Express.js", level: 92 },
      { name: "Django", level: 88 },
      { name: ".NET", level: 85 },
    ],
  },
  {
    title: "Databases",
    skills: [
      { name: "Supabase", level: 92 },
      { name: "FireStore", level: 90 },
      { name: "MongoDB", level: 88 },
      { name: "VPS PostgreSQL", level: 86 },
    ],
  },
  {
    title: "Cloud Storage",
    skills: [
      { name: "Firebase Storage", level: 92 },
      { name: "Cloudflare R2", level: 90 },
      { name: "Amazon S3", level: 88 },
      { name: "VPS MinIO", level: 85 },
    ],
  },
];

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="bg-base-100 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-base-content mb-3 text-sm font-semibold tracking-wide uppercase">
            Skills & Tools
          </p>
          <h2 className="text-error mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Technologies I work with
          </h2>
          <p className="text-error/70 mx-auto max-w-2xl text-lg">
            A versatile stack built for modern web development, scalable
            databases, and secure cloud storage.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {skillCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: catIndex * 0.1 }}
              className="bg-base-200 border-base-content/30 rounded-2xl border p-6 lg:p-8"
            >
              <h3 className="text-base-content mb-6 flex items-center gap-2 text-xl font-bold">
                <span className="bg-base-content h-2 w-2 rounded-full" />
                {category.title}
              </h3>
              <div className="space-y-5">
                {category.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex justify-between">
                      <span className="text-base-content/80 font-medium">
                        {skill.name}
                      </span>
                      <span className="text-base-content/60 font-mono text-sm">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${skill.level}%` } : {}}
                        transition={{
                          duration: 1,
                          delay: catIndex * 0.1 + 0.3,
                        }}
                        className="h-full rounded-full bg-linear-to-r from-sky-400 to-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
