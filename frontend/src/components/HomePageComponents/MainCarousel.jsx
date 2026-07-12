import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SLIDES } from './constants';

const MainCarousel = () => {
  const [currentSlide, setCurrentSlide]     = useState(0);
  const [isAutoPlaying, setIsAutoPlaying]   = useState(true);
  const timerRef = useRef(null);

  /* Auto-play */
  useEffect(() => {
    if (!isAutoPlaying) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide(p => (p + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timerRef.current);
  }, [isAutoPlaying, currentSlide]);

  const goTo = (i) => {
    setCurrentSlide(i);
    setIsAutoPlaying(false);
    clearTimeout(timerRef._resume);
    timerRef._resume = setTimeout(() => setIsAutoPlaying(true), 8000);
  };
  const prev = () => goTo((currentSlide - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((currentSlide + 1) % SLIDES.length);

  return (
    <div
      className="relative rounded-3xl overflow-hidden h-[30rem] shadow-2xl animate-[fadeIn_0.3s_ease-out]"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ${i === currentSlide ? 'scale-110' : 'scale-100'}`}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

          <div className="absolute inset-0 flex flex-col justify-end px-10 md:px-20 pb-16 z-10">
            <p className={`text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2 transform transition-all duration-700 delay-100 ${i === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="w-6 h-px bg-white/50" />{slide.badge}
            </p>
            <h1 className={`text-5xl md:text-6xl font-black text-white leading-tight mb-4 transform transition-all duration-700 delay-200 ${i === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {slide.title}{' '}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.accent}`}>{slide.highlight}</span>
            </h1>
            <p className={`text-white/75 text-base max-w-md font-medium mb-8 transform transition-all duration-700 delay-300 ${i === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {slide.subtitle}
            </p>
            <div className={`transform transition-all duration-700 delay-[400ms] ${i === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Link
                to={slide.link}
                className={`inline-flex items-center gap-2 px-7 py-3 rounded-full font-extrabold text-white bg-gradient-to-r ${slide.accent} shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 text-sm`}
              >
                Explore Events →
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* ← → Buttons */}
      {[
        { fn: prev, icon: <ChevronLeft size={20} />, pos: 'left-4' },
        { fn: next, icon: <ChevronRight size={20} />, pos: 'right-4' },
      ].map(({ fn, icon, pos }) => (
        <button
          key={pos}
          onClick={fn}
          className={`absolute ${pos} top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110`}
        >
          {icon}
        </button>
      ))}

      {/* Dots */}
      <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-white w-7 h-2' : 'bg-white/40 w-2 h-2 hover:bg-white/70'}`}
          />
        ))}
      </div>

      {/* Progress line */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
          <div key={`${currentSlide}-bar`} className="h-full bg-white/60" style={{ animation: 'growWidth 5.5s linear forwards' }} />
        </div>
      )}
    </div>
  );
};

export default MainCarousel;
