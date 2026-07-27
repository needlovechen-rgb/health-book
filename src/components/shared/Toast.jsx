import { useHealth } from '../../context/HealthContext';

export default function Toast() {
  const { toast } = useHealth();
  if (!toast) return null;
  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.kind}`}>
        {toast.kind === 'ok' ? '✓' : '✕'} {toast.msg}
      </div>
    </div>
  );
}
