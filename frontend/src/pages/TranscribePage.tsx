import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/StepIndicator';
import { useTranscriptionPoller } from '../hooks/useTranscriptionPoller';
import { useAppStore } from '../store/useAppStore';

const STATUS_LABELS: Record<string, string> = {
  queued: 'Waiting in queue…',
  processing: 'Transcribing your video…',
  completed: 'Transcription complete!',
  error: 'Transcription failed',
};

export function TranscribePage() {
  const jobId = useAppStore((s) => s.jobId);
  const setTranscript = useAppStore((s) => s.setTranscript);
  const navigate = useNavigate();
  const { status, transcript, error } = useTranscriptionPoller(jobId);

  useEffect(() => {
    if (!jobId) {
      navigate('/upload');
      return;
    }
  }, [jobId, navigate]);

  useEffect(() => {
    if (status === 'completed' && transcript) {
      setTranscript(transcript);
      setTimeout(() => navigate('/posts'), 800);
    }
  }, [status, transcript, setTranscript, navigate]);

  const label = status ? STATUS_LABELS[status] ?? 'Processing…' : 'Connecting…';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-2xl">
        <StepIndicator current={2} />
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Transcribing</h1>
        <p className="text-gray-500 text-center mb-10">
          AssemblyAI is processing your file. This usually takes 1–3 minutes.
        </p>

        <div className="flex flex-col items-center gap-6">
          {!error && (
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
          )}

          <p className={`text-lg font-medium ${error ? 'text-red-600' : 'text-gray-700'}`}>
            {error ?? label}
          </p>

          {status && !error && (
            <div className="flex gap-2 text-sm text-gray-400">
              {['queued', 'processing', 'completed'].map((s) => (
                <span
                  key={s}
                  className={`px-2 py-0.5 rounded-full ${
                    status === s
                      ? 'bg-blue-100 text-blue-600 font-medium'
                      : status === 'completed' || (status === 'processing' && s === 'queued')
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100'
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {error && (
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
