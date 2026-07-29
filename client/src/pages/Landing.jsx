import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Repeat2, Users, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const features = [
  {
    icon: Repeat2,
    title: "Swap, don't spend",
    desc: "Trade what you know for what you want to learn. No cash changes hands, ever.",
  },
  {
    icon: Users,
    title: "Real people, real skills",
    desc: "Browse a growing community of teachers, mentors, and makers near you.",
  },
  {
    icon: ShieldCheck,
    title: "Built on trust",
    desc: "Ratings and completed swap history help you pick the right match, every time.",
  },
];

const steps = [
  { n: "01", title: "List your skill", desc: "Tell the community what you can teach, and what you want to learn back." },
  { n: "02", title: "Find a match", desc: "Explore the marketplace and send a swap request to someone who fits." },
  { n: "03", title: "Exchange & grow", desc: "Meet up, trade knowledge, mark the swap complete, and rate each other." },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-28 md:pt-28">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute top-40 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp} className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-mono text-primary">
          <Sparkles size={13} /> No subscriptions. No fees. Just skills.
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          custom={1}
          variants={fadeUp}
          className="mx-auto max-w-4xl text-center font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
        >
          Your skill is someone's <span className="text-primary">wish list.</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          custom={2}
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-center text-base text-muted-light dark:text-muted-dark md:text-lg"
        >
          SkillSwap connects people who want to trade knowledge directly — teach photography, learn Spanish; teach code, learn design. One-to-one, zero-cost exchange.
        </motion.p>

        <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp} className="mt-10 flex items-center justify-center gap-4">
          <Link to={user ? "/dashboard" : "/register"} className="btn-primary">
            {user ? "Go to Dashboard" : "Get Started Free"} <ArrowRight size={18} />
          </Link>
          <Link to="/explore" className="btn-secondary">
            Explore Skills
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="relative mx-auto mt-20 max-w-3xl"
        >
          <div className="card grid grid-cols-1 gap-px overflow-hidden bg-black/5 dark:bg-white/5 sm:grid-cols-3">
            {[
              { label: "Active members", value: "2,400+" },
              { label: "Skills listed", value: "6,100+" },
              { label: "Swaps completed", value: "3,800+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-light dark:bg-surface-dark p-6 text-center">
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} custom={0} variants={fadeUp} className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Why SkillSwap?</h2>
          <p className="mt-3 text-muted-light dark:text-muted-dark">A marketplace where knowledge is the only currency.</p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="card p-8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon size={22} />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} custom={0} variants={fadeUp} className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">How it works</h2>
        </motion.div>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
          {steps.map((s, i) => (
            <motion.div key={s.n} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} variants={fadeUp} className="relative text-center md:text-left">
              <span className="font-display text-5xl font-bold text-primary/20">{s.n}</span>
              <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card relative overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to trade your first skill?</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-light dark:text-muted-dark">
            Join the community and post what you can teach in under a minute.
          </p>
          <Link to={user ? "/explore" : "/register"} className="btn-primary mt-8 inline-flex">
            {user ? "Browse Skills" : "Create Free Account"} <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
