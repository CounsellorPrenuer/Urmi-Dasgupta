import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import logoImg from '@assets/generated-image(1)_1762374279351.png';
import { FreeDiscoveryCallModal } from '@/components/FreeDiscoveryCallModal';
import { sanityClient } from '@/lib/sanity';
import { config } from '@/lib/config';

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const query = `*[_type == "siteSettings"][0]{
          videoLogo {
            asset->{
              url
            }
          }
        }`;
        const result = await sanityClient.fetch(query);
        if (result?.videoLogo?.asset?.url) {
          setVideoUrl(result.videoLogo.asset.url);
        }
      } catch (error) {
        console.error("Error fetching video logo:", error);
      }
    };
    fetchSettings();
  }, []);

  // Attempt to unmute after autoplay starts, with fallback to first user interaction
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const tryUnmute = () => {
      if (video) {
        video.muted = false;
        video.volume = 1.0;
      }
    };

    // When video starts playing (muted), try to unmute
    const handlePlaying = () => {
      try {
        tryUnmute();
      } catch {
        // Browser blocked unmuting, wait for user interaction
      }
    };

    // Fallback: unmute on first user interaction anywhere on the page
    const handleFirstInteraction = () => {
      tryUnmute();
      // Also ensure it's playing
      if (video.paused) {
        video.play().catch(() => { });
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    video.addEventListener('playing', handlePlaying);
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      video.removeEventListener('playing', handlePlaying);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [videoUrl]);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-purple-950 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-950/90 to-slate-900/90" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent"
              data-testid="text-hero-title"
            >
              Align Ambition with Clarity
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl md:text-3xl text-white mb-4 font-medium"
              data-testid="text-hero-subtitle"
            >
              Empowering Minds. Healing Hearts. Redefining Possibilities.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-8"
              data-testid="text-hero-description"
            >
              Helping students, professionals, and organizations achieve harmony between career success and emotional well-being in today's fast-evolving world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white px-8 py-6 text-lg rounded-full group shadow-xl"
                data-testid="button-free-call"
                onClick={() => setIsModalOpen(true)}
              >
                Free Clarity Call
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg rounded-full border-2 border-white text-white hover:bg-white hover:text-primary-purple transition-colors"
                data-testid="button-learn-more"
                onClick={() => scrollToSection('#who-we-help')}
              >
                Learn More
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [0, -20, 0]
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.3 },
              x: { duration: 0.8, delay: 0.3 },
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }
            }}
            className="flex justify-center relative group"
            onClick={() => {
              // Direct interaction handler for the container
              if (videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.volume = 1.0;
                if (videoRef.current.paused) {
                  videoRef.current.play().catch(() => { });
                }
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 via-emerald-500/0 to-emerald-600/0 group-hover:from-emerald-400/30 group-hover:via-emerald-500/40 group-hover:to-emerald-600/30 rounded-full blur-3xl transition-all duration-1500 ease-in-out" />

            {videoUrl ? (
              <div className="relative z-10">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={logoImg}
                  preload="auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                  // @ts-ignore
                  webkit-playsinline="true"
                  x-webkit-airplay="allow"
                  className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain rounded-full shadow-2xl"
                  data-testid="video-logo"
                />
              </div>
            ) : (
              <img
                src={logoImg}
                alt="Claryntia Logo"
                className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain relative z-10"
                data-testid="img-logo"
              />
            )}
          </motion.div>
        </div>
      </div>

      <FreeDiscoveryCallModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </section>
  );
}
