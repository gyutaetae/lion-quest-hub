import { motion } from "framer-motion";
import { QrCode, Trophy, Zap } from "lucide-react";
import lionLogo from "@/assets/likelion-logo.jpeg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 lion-gradient opacity-[0.06]" />
      <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute bottom-20 left-[5%] w-48 h-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
              경상국립대 14기 모집중
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6 font-display">
              <span className="lion-gradient-text">멋쟁이사자처럼</span>
              <br />
              경상국립대
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              QR 출석체크부터 활동 포인트, 실시간 랭킹까지.
              <br />
              <strong className="text-foreground">Possibility to Reality</strong> — 함께 성장하는 코딩 동아리.
            </p>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-lg lion-gradient text-white font-semibold text-base shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30"
              >
                Google로 시작하기
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-lg bg-card border border-border font-semibold text-base transition-shadow hover:lion-shadow"
              >
                더 알아보기
              </motion.button>
            </div>
          </motion.div>

          {/* Right - Logo + floating cards */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden lion-shadow-hover border-2 border-white/50">
                <img
                  src={lionLogo}
                  alt="멋쟁이사자처럼 경상국립대 로고"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating stat cards */}
              <motion.div
                className="absolute -top-4 -right-6 glass-card rounded-xl px-4 py-3 lion-shadow"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg lion-gradient flex items-center justify-center">
                    <QrCode className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">오늘 출석</p>
                    <p className="text-sm font-bold tabular-nums">14 / 18</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-6 glass-card rounded-xl px-4 py-3 lion-shadow"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center">
                    <Trophy className="w-4.5 h-4.5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">1위</p>
                    <p className="text-sm font-bold">김민수 · 1,240p</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/2 -left-10 glass-card rounded-xl px-3 py-2 lion-shadow"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.8, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">LV.3 코딩사자</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
