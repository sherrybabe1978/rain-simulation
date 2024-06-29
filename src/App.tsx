import React, { useState } from 'react';
import RainSimulation from './components/RainSimulation';
import styles from './App.module.css';

const App: React.FC = () => {
  const [rainIntensity, setRainIntensity] = useState(2);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleIntensityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRainIntensity(Number(event.target.value));
  };

  const getIntensityLabel = (intensity: number) => {
    switch (intensity) {
      case 0: return 'Drizzle';
      case 1: return 'Light';
      case 2: return 'Moderate';
      case 3: return 'Heavy';
      case 4: return 'Rainstorm';
      default: return 'Moderate';
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <span className={styles.logo}>RainFX</span>
        </div>
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul>
            <li><a href="#home" onClick={() => setMenuOpen(false)}>Home</a></li>
            <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
            <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
            <li><a href="#testimonials" onClick={() => setMenuOpen(false)}>Testimonials</a></li>
            <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="home" className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="0"
                max="4"
                value={rainIntensity}
                onChange={handleIntensityChange}
                className={styles.slider}
              />
              <span className={styles.sliderLabel}>{getIntensityLabel(rainIntensity)}</span>
            </div>
            <h1>Experience the <span className={styles.highlight}>Beauty of Rain</span></h1>
            <p>Immerse yourself in our stunning 3D rain simulation</p>
            <a href="#about" className={styles.cta}>Explore Now</a>
          </div>
          <div className={styles.simulationContainer}>
            <RainSimulation intensity={rainIntensity} />
          </div>
        </section>

        <section id="about" className={styles.about}>
          <div className={styles.container}>
            <h2>Redefining Digital <span className={styles.highlight}>Rainfall</span></h2>
            <p>Our cutting-edge 3D rain simulation brings the tranquil beauty of rainfall to your screen. Using advanced WebGL technology, we've created a mesmerizing experience that's both relaxing and visually stunning.</p>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <div className={styles.container}>
            <h2>Powerful <span className={styles.highlight}>Features</span></h2>
            <div className={styles.featureGrid}>
              <div className={styles.feature}>
                <h3>Realistic Physics</h3>
                <p>Experience rain with true-to-life movement and gravity.</p>
              </div>
              <div className={styles.feature}>
                <h3>Customizable</h3>
                <p>Adjust rain intensity, color, and background to your liking.</p>
              </div>
              <div className={styles.feature}>
                <h3>High Performance</h3>
                <p>Optimized for smooth performance on various devices.</p>
              </div>
              <div className={styles.feature}>
                <h3>Responsive Design</h3>
                <p>Enjoy the simulation on any screen size or device.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className={styles.testimonials}>
          <div className={styles.container}>
            <h2>What Our <span className={styles.highlight}>Users Say</span></h2>
            <div className={styles.testimonialGrid}>
              <div className={styles.testimonial}>
                <p>"This rain simulation is incredibly relaxing. It's become a part of my daily meditation routine!"</p>
                <cite>- Sarah J.</cite>
              </div>
              <div className={styles.testimonial}>
                <p>"The attention to detail in this simulation is impressive. It's both beautiful and technically fascinating."</p>
                <cite>- Mark T.</cite>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className={styles.contact}>
          <div className={styles.container}>
            <h2>Get in <span className={styles.highlight}>Touch</span></h2>
            <form className={styles.contactForm}>
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <textarea placeholder="Your Message" required></textarea>
              <button type="submit" className={styles.submitBtn}>Send Message</button>
            </form>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>&copy; 2023 RainFX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;