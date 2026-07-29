const Loader = ({ full }) => (
  <div className={`flex items-center justify-center ${full ? "min-h-screen" : "py-16"}`}>
    <div className="relative h-14 w-14">
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spinSlow" />
      <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent animate-spinSlow" style={{ animationDirection: "reverse" }} />
    </div>
  </div>
);

export default Loader;
