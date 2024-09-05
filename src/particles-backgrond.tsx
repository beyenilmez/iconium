import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { ISourceOptions } from "tsparticles-engine";

export const ParticlesBackground: React.FC = () => {
  const particlesInit = useCallback(async (engine: any) => {
    try {
      // Load the tsparticles engine with all necessary features
      await loadFull(engine);
    } catch (error) {
      console.error("Error loading tsparticles engine:", error);
    }
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    console.log(container);
  }, []);

  const particlesOptions: ISourceOptions = {
    fullScreen: false,
    particles: {
      number: {
        value: 30, // Fewer particles
        density: { enable: true, value_area: 800 },
      },
      color: {
        value: ["#CCCCCC", "#AAAAAA", "#888888"], // Muted, soft colors for less distraction
      },
      shape: {
        type: ["circle", "polygon", "square"], // Randomized between circle, pentagon, and square
        polygon: {
          nb_sides: 5, // Define number of sides for polygons (pentagons)
        },
        stroke: { width: 0, color: "#000000" },
      },
      opacity: {
        value: 0.15,
        random: true,
        anim: { enable: true, speed: 0.1, opacity_min: 0.05, sync: false },
      },
      size: {
        value: 8,
        random: true,
        anim: { enable: true, speed: 3, size_min: 4, sync: false },
      },
      move: {
        enable: true,
        speed: {
          min: 0.1, // Slow minimum speed
          max: 0.4, // Slightly faster max speed
        },
        direction: "none", // Random directions for natural flow
        out_mode: "out",
        bounce: false,
        straight: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: false }, // Disable hover interaction to reduce distraction
        onclick: { enable: false }, // Disable click interaction to reduce distraction
        resize: true,
      },
    },
    retina_detect: true,
  };

  return (
    <Particles
      className="top-0 left-0 -z-50 fixed w-screen h-screen animated-bg"
      init={particlesInit}
      loaded={particlesLoaded}
      options={particlesOptions}
    />
  );
};
