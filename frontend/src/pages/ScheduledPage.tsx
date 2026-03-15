import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { format, isPast } from 'date-fns';
import { listScheduledPosts, cancelScheduledPost } from '../api/linkedin';
import { StepIndicator } from '../components/StepIndicator';
import { LinkedInConnect } from '../components/LinkedInConnect';
import { useLinkedInAuth } from '../hooks/useLinkedInAuth';
import type { ScheduledPost } from '../types';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

function formatDate(iso: string) {
  return format(new Date(iso), "d MMM yyyy 'at' HH:mm");
}

export function ScheduledPage() {
  const navigate = useNavigate();
  const { linkedinProfile } = useLinkedInAuth();

  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await listScheduledPosts(linkedinProfile?.linkedin_id);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scheduled posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [linkedinProfile?.linkedin_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async (postId: string) => {
    setCancellingId(postId);
    try {
      await cancelScheduledPost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: 'cancelled' } : p))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed.');
    } finally {
      setCancellingId(null);
    }
  };

  const pending = posts.filter((p) => p.status === 'pending');
  const rest = posts.filter((p) => p.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-16">
        <StepIndicator current={4} />
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-1">Scheduled Posts</h1>
        <p className="text-gray-500 text-center mb-8">
          Posts will be automatically published to LinkedIn at their scheduled time.
        </p>

        {/* LinkedIn connect */}
        <div className="mb-6">
          <LinkedInConnect profile={linkedinProfile ?? null} />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-lg font-medium text-gray-600 mb-1">No scheduled posts yet</p>
            <p className="text-sm mb-6">Go back to your posts and schedule them on specific dates.</p>
            <button
              onClick={() => navigate('/posts')}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              ← Back to Posts
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Pending (upcoming) */}
            {pending.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-2">
                  Upcoming ({pending.length})
                </h2>
                {pending.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onCancel={handleCancel}
                    cancellingId={cancellingId}
                  />
                ))}
              </>
            )}

            {/* Past */}
            {rest.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-4">
                  Past
                </h2>
                {rest.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onCancel={handleCancel}
                    cancellingId={cancellingId}
                  />
                ))}
              </>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => navigate('/posts')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm"
          >
            ← Schedule More Posts
          </button>
          <button
            onClick={() => { fetchPosts(); }}
            className="px-4 py-2.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 font-medium"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              useAppStore.getState().reset();
              navigate('/upload');
            }}
            className="ml-auto px-5 py-2.5 text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Start over with new video
          </button>
        </div>
      </div>
    </div>
  );
}

interface PostRowProps {
  post: ScheduledPost;
  onCancel: (id: string) => void;
  cancellingId: string | null;
}

function PostRow({ post, onCancel, cancellingId }: PostRowProps) {
  const [expanded, setExpanded] = useState(false);
  const due = isPast(new Date(post.scheduled_at));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-start justify-between px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[post.status] ?? 'bg-gray-100'}`}
            >
              {post.status}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(post.scheduled_at)}
              {post.status === 'pending' && due && (
                <span className="ml-1 text-orange-500">(publishing soon…)</span>
              )}
            </span>
          </div>
          <p className="font-semibold text-gray-900 text-sm truncate">{post.topic}</p>
        </div>

        <div className="flex items-center gap-2 ml-3 shrink-0">
          {post.post_url && (
            <a
              href={post.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View →
            </a>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {expanded ? 'Hide' : 'Show'}
          </button>
          {post.status === 'pending' && (
            <button
              onClick={() => onCancel(post.id)}
              disabled={cancellingId === post.id}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              {cancellingId === post.id ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-100 pt-3 max-h-48 overflow-y-auto">
          {post.linkedin_post}
        </div>
      )}

      {post.error && (
        <div className="px-5 pb-3 text-xs text-red-600 border-t border-red-100 pt-2 bg-red-50">
          Error: {post.error}
        </div>
      )}
    </div>
  );
}
