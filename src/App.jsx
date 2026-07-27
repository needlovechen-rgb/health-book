import { HealthProvider } from './context/HealthContext';
import Dashboard from './pages/Dashboard';
import Toast from './components/shared/Toast';

export default function App() {
  return (
    <HealthProvider>
      <Dashboard />
      <Toast />
    </HealthProvider>
  );
}
