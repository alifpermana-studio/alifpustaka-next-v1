import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Code2,
  Server,
  CloudCog,
  Database,
  Smartphone,
  Zap,
} from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Full-Stack Web Development",
    description:
      "End-to-end development of web applications using Next.js, Express.js, Django, and .NET.",
  },
  {
    icon: Server,
    title: "Backend & API Development",
    description:
      "Designing RESTful and GraphQL APIs, authentication systems, and scalable server architectures.",
  },
  {
    icon: Database,
    title: "Database Architecture",
    description:
      "Setting up and optimizing databases with Supabase, FireStore, MongoDB, and PostgreSQL.",
  },
  {
    icon: CloudCog,
    title: "Cloud Storage Solutions",
    description:
      "Implementing secure file storage using Firebase Storage, Cloudflare R2, Amazon S3, and MinIO.",
  },
  {
    icon: Smartphone,
    title: "Responsive UI/UX",
    description:
      "Creating modern, mobile-first interfaces with React, Tailwind CSS, and smooth animations.",
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description:
      "Improving load times, SEO, and overall application performance for better user experience.",
  },
];

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-base-content mb-3 text-sm font-semibold tracking-wide uppercase">
            Services
          </p>
          <h2 className="text-error mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            What I can do for you
          </h2>
          <p className="text-error/70 mx-auto max-w-2xl text-lg">
            From concept to deployment, I provide full-cycle development
            services tailored to your business needs.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group border-base-content/20 bg-base-300/10 hover:border-base-content/40 hover:bg-base-300/20 rounded-2xl border p-6 transition-all"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 transition-colors group-hover:bg-indigo-500/20">
                <service.icon className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-error mb-3 text-lg font-bold">
                {service.title}
              </h3>
              <p className="text-base-content/80 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
