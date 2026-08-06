import { HealthProvider } from './context/HealthContext';
import { I18nProvider } from './context/I18nContext';
import Dashboard from './pages/Dashboard';
import Toast from './components/shared/Toast';

export default function App() {
  return (
    <I18nProvider>
      <HealthProvider>
        <Dashboard />
        <Toast />
      </HealthProvider>
    </I18nProvider>
  );
}
