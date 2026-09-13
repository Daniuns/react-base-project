type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export function notifySessionExpired() {
  listeners.forEach((listener) => listener());
}

export function subscribeToSessionExpired(listener: SessionExpiredListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
