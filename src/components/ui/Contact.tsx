import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { GithubIcon, LinkedInIcon, XIcon } from "@/icons/brands/index";
import { useTheme } from "@/contexts/ThemeContext";

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <section id="contact" className="bg-base-100 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-base-content mb-3 text-sm font-semibold tracking-wide uppercase">
            Contact
          </p>
          <h2 className="text-accent mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Let's work together
          </h2>
          <p className="text-accent/70 mx-auto max-w-2xl text-lg">
            Have a project in mind? I'd love to hear about it. Send me a message
            and let's build something great.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8 lg:col-span-2"
          >
            <div>
              <h3 className="text-base-content mb-4 text-2xl font-bold">
                Get in touch
              </h3>
              <p className="text-base-content/80 leading-relaxed">
                I'm currently available for freelance projects and full-time
                opportunities. Whether you need a complete web application or
                consultation, feel free to reach out.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:hello@alexrivera.dev"
                className="border-base-content/10 bg-base-300/30 hover:border-base-content/30 flex items-center gap-4 rounded-xl border p-4 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                  <Mail className="text-base-content h-5 w-5" />
                </div>
                <div>
                  <div className="text-accent text-sm">Email</div>
                  <div className="text-base-content/70 font-medium">
                    support@alifpustaka.web.id
                  </div>
                </div>
              </a>
              <div className="border-base-content/10 bg-base-300/30 hover:border-base-content/30 flex items-center gap-4 rounded-xl border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                  <MapPin className="text-base-content h-5 w-5" />
                </div>
                <div>
                  <div className="text-accent text-sm">Location</div>
                  <div className="text-base-content/70 font-medium">
                    Available worldwide
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {[
                {
                  icon: GithubIcon,
                  href: "https://github.com",
                  label: "Github",
                },
                {
                  icon: LinkedInIcon,
                  href: "https://linkedin.com",
                  label: "LinkedIn",
                },
                {
                  icon: XIcon,
                  href: "https://twitter.com",
                  label: "X",
                },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-sky-400/50 hover:bg-white/10 hover:text-white"
                >
                  <Icon
                    className={`h-5 w-5 ${(label === "Github" || label === "X") && theme === "dark" ? "brightness-0 invert" : ""}`}
                  />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              className="border-base-content/20 bg-base-300/30 rounded-2xl border p-6 lg:p-8"
            >
              <div className="mb-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="text-accent mb-2 block text-sm font-medium"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                    className="bg-base-100 text-base-content placeholder-error/70 focus:border-base-content/50 focus:ring-info/50 w-full rounded-xl border border-white/10 px-4 py-3 transition-all focus:ring-1 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="text-accent mb-2 block text-sm font-medium"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    className="bg-base-100 text-base-content placeholder-error/70 focus:border-base-content/50 focus:ring-info/50 w-full rounded-xl border border-white/10 px-4 py-3 transition-all focus:ring-1 focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="text-accent mb-2 block text-sm font-medium"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({ ...formState, message: e.target.value })
                  }
                  className="bg-base-100 text-base-content placeholder-error/70 focus:border-base-content/50 focus:ring-info/50 w-full resize-none rounded-xl border border-white/10 px-4 py-3 transition-all focus:ring-1 focus:outline-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              <button
                type="submit"
                disabled={submitted}
                className="bg-accent text-accent-content hover:bg-accent/70 disabled:bg-error disabled:text-base-100 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all sm:w-auto"
              >
                {submitted ? (
                  <>Message sent!</>
                ) : (
                  <>
                    Send Message <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
