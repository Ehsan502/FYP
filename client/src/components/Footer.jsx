import Logo from "./Logo.jsx";

const Footer = () => (
  <footer className="border-t border-black/5 dark:border-white/5 py-10">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-light dark:text-muted-dark md:flex-row">
      <div className="flex items-center gap-2 font-display font-semibold text-ink-light dark:text-ink-dark">
        <Logo size={22} /> SkillSwap
      </div>
      <p>Trade skills, not money.</p>
      <p>&copy; {new Date().getFullYear()} SkillSwap</p>
    </div>
  </footer>
);

export default Footer;
