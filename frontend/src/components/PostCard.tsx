import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays } from 'date-fns';
import type { GeneratedPost, LinkedInProfile } from '../types';

interface PostCardProps {
  post: GeneratedPost;
  index: number;
  profile: LinkedInProfile | null;
  onEdit: (index: number, text: string) => void;
  onSchedule: (index: number, date: Date) => void;
  onConnectLinkedIn: () => void;
  scheduledDate: Date | null;
  isScheduling: boolean;
  isScheduled: boolean;
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function PostCard({
  post,
  index,
  profile,
  onEdit,
  onSchedule,
  onConnectLinkedIn,
  scheduledDate,
  isScheduling,
  isScheduled,
}: PostCardProps) {
  const [editing, setEditing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date | null>(
    scheduledDate ?? addDays(new Date(), index + 1)
  );

  const wordCount = countWords(post.linkedin_post);
  const inRange = wordCount >= 300 && wordCount <= 500;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all
        ${isScheduled ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-gray-100">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Post {index + 1}
          </span>
          <h3 className="font-semibold text-gray-900 mt-0.5">{post.topic}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setPreviewing(!previewing); setEditing(false); }}
            className="text-xs px-2.5 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50"
          >
            {previewing ? 'Hide' : 'Preview'}
          </button>
          <button
            onClick={() => { setEditing(!editing); setPreviewing(false); }}
            className="text-xs px-2.5 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50"
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Preview / Edit area */}
      {previewing && (
        <div className="px-5 py-4 max-h-72 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50">
          {post.linkedin_post}
        </div>
      )}
      {editing && (
        <div className="px-5 py-4">
          <textarea
            className="w-full h-52 p-3 border border-gray-300 rounded-lg text-sm text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={post.linkedin_post}
            onChange={(e) => onEdit(index, e.target.value)}
          />
          <div className="flex justify-between mt-1 text-xs">
            <span className={inRange ? 'text-green-600' : 'text-red-500'}>
              {wordCount} words {inRange ? '✓' : '(target: 300–500)'}
            </span>
            <span className={post.linkedin_post.length > 3000 ? 'text-red-500' : 'text-gray-400'}>
              {post.linkedin_post.length}/3000
            </span>
          </div>
        </div>
      )}

      {/* Schedule row */}
      <div className="px-5 py-4 flex flex-wrap items-center gap-3">
        {isScheduled ? (
          <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
            <span>✓</span>
            <span>
              Scheduled for{' '}
              {scheduledDate
                ? new Date(scheduledDate).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </span>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-[200px]">
              <DatePicker
                selected={pickerDate}
                onChange={(date: Date | null) => setPickerDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="d MMM yyyy, HH:mm"
                minDate={new Date()}
                placeholderText="Pick a date & time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {profile ? (
              <button
                onClick={() => pickerDate && onSchedule(index, pickerDate)}
                disabled={!pickerDate || isScheduling}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isScheduling ? 'Scheduling…' : 'Schedule Post'}
              </button>
            ) : (
              <button
                onClick={onConnectLinkedIn}
                className="px-4 py-2 bg-[#0A66C2] text-white text-sm font-medium rounded-lg hover:bg-[#004182] whitespace-nowrap"
              >
                Connect LinkedIn to Schedule
              </button>
            )}
          </>
        )}

        {post.word_count_warning && !isScheduled && (
          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
            Word count outside 300–500 target
          </span>
        )}
      </div>
    </div>
  );
}
