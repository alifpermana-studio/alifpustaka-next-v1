import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Terminal, Globe, Database, Cloud } from "lucide-react";

const highlights = [
  {
    icon: Globe,
    title: "Web Applications",
    desc: "Specialized in building responsive, high-performance web apps with modern frameworks and clean architecture.",
  },
  {
    icon: Database,
    title: "Database Design",
    desc: "Experienced with SQL and NoSQL solutions including Supabase, FireStore, MongoDB, and VPS PostgreSQL.",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    desc: "Proficient with Firebase Storage, Cloudflare R2, Amazon S3, and VPS MinIO for scalable file handling.",
  },
  {
    icon: Terminal,
    title: "Clean Code",
    desc: "Writing maintainable, scalable code in JavaScript, Python, and C# using industry best practices.",
  },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-base-content mb-3 text-sm font-semibold tracking-wide uppercase">
              About Me
            </p>
            <h2 className="text-accent mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              Building digital products that scale
            </h2>
            <p className="text-base-content mb-6 text-lg leading-relaxed">
              I'm a full-stack developer with a passion for turning complex
              problems into elegant, user-friendly web applications. My work
              spans the entire development lifecycle — from designing intuitive
              interfaces to architecting robust backends and deploying to the
              cloud.
            </p>
            <p className="text-base-content mb-8 text-lg leading-relaxed">
              Whether it's a dynamic portfolio, a content-heavy blog platform, a
              secure admin dashboard, or a full e-commerce experience, I bring
              deep technical expertise and attention to detail to every project.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "JavaScript",
                "Python",
                "C#",
                "Next.js",
                "Express.js",
                "Django",
                ".NET",
              ].map((tech) => (
                <span
                  key={tech}
                  className="border-base-content/10 bg-accent text-accent-content rounded-lg border px-4 py-2 text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group border-base-content/30 bg-base-200/3 hover:border-base-content/50 hover:bg-base-200/5 rounded-2xl border p-6 transition-all"
              >
                <div className="bg-base-300/70 group-hover:bg-base-300 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <item.icon className="text-accent h-6 w-6" />
                </div>
                <h3 className="text-accent mb-2 text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-base-content text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
