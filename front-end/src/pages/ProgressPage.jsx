import { HiChartBar } from 'react-icons/hi2';
import '../styles/ProgressPage.css';

function ProgressPage() {
  return (
    <div className="progress-page" id="progress-page">
      <div className="progress-page__content">
        <div className="progress-page__icon">
          <HiChartBar />
        </div>
        <h1 className="progress-page__title">Progress Tracking</h1>
        <p className="progress-page__subtitle">
          This feature is coming soon. Stay tuned!
        </p>
        <div className="progress-page__badge">🚧 Under Development</div>
      </div>
    </div>
  );
}

export default ProgressPage;
