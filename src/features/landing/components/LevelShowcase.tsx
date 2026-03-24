import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const levels = [
  { lv: 1, name: "응애사자", emoji: "🐣", points: "0", color: "from-gray-300 to-gray-400" },
  { lv: 2, name: "아기사자", emoji: "🦁", points: "200", color: "from-amber-300 to-amber-400" },
  { lv: 3, name: "코딩사자", emoji: "💻", points: "600", color: "from-sky-400 to-blue-500" },
  { lv: 4, name: "해커사자", emoji: "⚡", points: "1,200", color: "from-purple-400 to-purple-600" },
  { lv: 5, name: "마스터사자", emoji: "👑", points: "2,500", color: "from-amber-400 to-yellow-500" },
];

const LevelShowcase = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-24 md:py-32 bg-lion-sky/40" ref={ref}>
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            성장하는 사자 🦁
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            활동할수록 레벨업. 응애사자에서 마스터사자까지.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
          {levels.map((level, i) => (
            <motion.div
              key={level.lv}
              className="group relative bg-card rounded-2xl p-5 border border-border/60 w-[140px] md:w-[160px] text-center transition-all duration-300 hover:lion-shadow-hover hover:-translate-y-1"
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{
                duration: 0.6,
                delay: 0.1 * i + 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="text-3xl mb-3">{level.emoji}</div>
              <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${level.color} text-white mb-2`}>
                LV.{level.lv}
              </div>
              <h3 className="text-sm font-bold mb-1">{level.name}</h3>
              <p className="text-xs text-muted-foreground tabular-nums">{level.points}p+</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LevelShowcase;
