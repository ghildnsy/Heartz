import { HiSparkles } from 'react-icons/hi2';
import '../styles/HomePage.css';

function HomePage() {
  return (
    <div className="home-page" id="home-page">
      <div className="home-page__hero">
        <div className="home-page__hero-icon">
          <HiSparkles />
        </div>
        <h1 className="home-page__title">
          Welcome to <span className="home-page__title-accent">He(a)rtz</span>
        </h1>
        <p className="home-page__subtitle">
          A learning platform designed to help deaf and hard-of-hearing
          individuals practice sound recognition and syllable pronunciation.
        </p>
        <a href="/practice" className="home-page__cta" id="home-cta-start">
          Start Practicing
        </a>
      </div>

      <div className="home-page__features">
        <div className="home-page__feature-card">
          <div className="home-page__feature-icon">🎯</div>
          <h3>Interactive Cards</h3>
          <p>Tap sound cards to practice individual syllables at your own pace.</p>
        </div>
        <div className="home-page__feature-card">
          <div className="home-page__feature-icon">📊</div>
          <h3>Track Progress</h3>
          <p>Monitor your learning journey with detailed progress insights.</p>
        </div>
        <div className="home-page__feature-card">
          <div className="home-page__feature-icon">🧠</div>
          <h3>Smart Filters</h3>
          <p>Filter by vowels or consonants to focus on specific sounds.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
