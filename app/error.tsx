'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-primary flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="glass rounded-lg px-4 py-2 border border-primary/50 hover:bg-primary/10"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

