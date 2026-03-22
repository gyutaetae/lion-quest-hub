import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { QrCode, Trophy, TrendingUp, Star } from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR 출석 체크",
    description: "모임마다 5분간 유효한 일회용 QR코드. 스캔 한 번으로 출석 완료.",
    color: "bg-primary",
  },
  {
    icon: TrendingUp,
    title: "실시간 랭킹",
    description: "출석, 과제, 오픈소스 기여 포인트가 자동 합산. 실시간으로 순위 변동.",
    color: "bg-amber-500",
  },
  {
    icon: Star,
    title: "레벨 시스템",
    description: "응애사자부터 마스터사자까지. 활동할수록 성장하는 나만의 사자.",
    color: "bg-emerald-500",
  },
  {
    icon: Trophy,
    title: "활동 포인트",
    description: "출석 +10p, 과제 +50p, 오픈소스 기여 +100p. 모든 활동이 점수로.",
    color: "bg-rose-500",
  },
];

const Features = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-24 md:py-32" ref={ref}>
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            어떻게 작동하나요?
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            동아리 운영에 필요한 모든 것을 한 곳에서
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative bg-card rounded-2xl p-6 border border-border/60 transition-shadow duration-300 hover:lion-shadow-hover cursor-default"
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{
                duration: 0.6,
                delay: 0.08 * i + 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105`}
              >
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
