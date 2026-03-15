import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage';
import { TranscribePage } from './pages/TranscribePage';
import { PostsPage } from './pages/PostsPage';
import { ScheduledPage } from './pages/ScheduledPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/transcribe" element={<TranscribePage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/scheduled" element={<ScheduledPage />} />
        {/* Legacy redirects */}
        <Route path="/generate" element={<Navigate to="/posts" replace />} />
        <Route path="/preview" element={<Navigate to="/posts" replace />} />
        <Route path="/publish" element={<Navigate to="/posts" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
