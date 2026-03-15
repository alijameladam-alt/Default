import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/StepIndicator';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { PostCard } from '../components/PostCard';
import { LinkedInConnect } from '../components/LinkedInConnect';
import { generatePosts } from '../api/generation';
import { schedulePost, startLinkedInOAuth } from '../api/linkedin';
import { useAppStore } from '../store/useAppStore';
import { useLinkedInAuth } from '../hooks/useLinkedInAuth';

type Tone = 'professional' | 'casual' | 'inspiring';

export function PostsPage() {
  const navigate = useNavigate();
  const transcript = useAppStore((s) => s.transcript);
  const summary = useAppStore((s) => s.summary);
  const generatedPosts = useAppStore((s) => s.generatedPosts);
  const setGenerated = useAppStore((s) => s.setGenerated);
  const updatePost = useAppStore((s) => s.updatePost);

  const { linkedinToken, linkedinProfile } = useLinkedInAuth();

  const [tone, setTone] = useState<Tone>('professional');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track scheduled state per post index
  const [schedulingIndex, setSchedulingIndex] = useState<number | null>(null);
  const [scheduledDates, setScheduledDates] = useState<Record<number, Date>>({});
  const [scheduleErrors, setScheduleErrors] = useState<Record<number, string>>({});

  const scheduledCount = Object.keys(scheduledDates).length;

  useEffect(() => {
    if (!transcript) {
      navigate('/upload');
      return;
    }
    if (generatedPosts.length === 0) {
      handleGenerate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = async () => {
    if (!transcript) return;
    setGenerating(true);
    setError(null);
    setScheduledDates({});
    setScheduleErrors({});
    try {
      const res = await generatePosts({ transcript, tone });
      setGenerated(res.summary, res.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSchedule = async (index: number, date: Date) => {
    if (!linkedinToken || !linkedinProfile) return;
    setSchedulingIndex(index);
    const post = generatedPosts[index];
    try {
      await schedulePost({
        linkedin_post: post.linkedin_post,
        topic: post.topic,
        linkedin_id: linkedinProfile.linkedin_id,
        access_token: linkedinToken,
        scheduled_at: date.toISOString(),
      });
      setScheduledDates((prev) => ({ ...prev, [index]: date }));
      setScheduleErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    } catch (err) {
      setScheduleErrors((prev) => ({
        ...prev,
        [index]: err instanceof Error ? err.message : 'Scheduling failed.',
      }));
    } finally {
      setSchedulingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-16">
        <StepIndicator current={3} />
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-1">
          Your LinkedIn Posts
        </h1>
        <p className="text-gray-500 text-center mb-6">
          {generating
            ? 'Claude is analysing your video and generating posts…'
            : `${generatedPosts.length} post${generatedPosts.length !== 1 ? 's' : ''} generated from your video. Edit, preview, and schedule each one.`}
        </p>

        {/* Controls row */}
        {!generating && generatedPosts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {(['professional', 'casual', 'inspiring'] as Tone[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors capitalize
                  ${tone === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={handleGenerate}
              className="ml-auto px-4 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-full hover:bg-blue-50"
            >
              Regenerate all
            </button>
          </div>
        )}

        {/* Transcript viewer */}
        {transcript && !generating && (
          <div className="mb-5">
            <TranscriptViewer transcript={transcript} />
          </div>
        )}

        {/* Summary */}
        {summary && !generating && (
          <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-900">
            <p className="font-semibold text-xs uppercase tracking-wide text-blue-500 mb-1">Video Summary</p>
            {summary}
          </div>
        )}

        {/* LinkedIn connect banner */}
        {!linkedinProfile && !generating && generatedPosts.length > 0 && (
          <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between gap-4">
            <p className="text-sm text-yellow-800">
              Connect your LinkedIn account to schedule posts.
            </p>
            <LinkedInConnect profile={null} />
          </div>
        )}

        {linkedinProfile && !generating && (
          <div className="mb-5">
            <LinkedInConnect profile={linkedinProfile} />
          </div>
        )}

        {/* Loading spinner */}
        {generating && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Claude is reading your transcript and crafting unique posts…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Post cards */}
        {!generating && generatedPosts.length > 0 && (
          <div className="flex flex-col gap-4">
            {generatedPosts.map((post, i) => (
              <div key={i}>
                <PostCard
                  post={post}
                  index={i}
                  profile={linkedinProfile ?? null}
                  onEdit={updatePost}
                  onSchedule={handleSchedule}
                  onConnectLinkedIn={startLinkedInOAuth}
                  scheduledDate={scheduledDates[i] ?? null}
                  isScheduling={schedulingIndex === i}
                  isScheduled={i in scheduledDates}
                />
                {scheduleErrors[i] && (
                  <p className="text-xs text-red-600 mt-1 px-1">{scheduleErrors[i]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom nav */}
        {scheduledCount > 0 && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => navigate('/scheduled')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow"
            >
              View Scheduled Posts ({scheduledCount}) →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
