import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchLinkedInProfile } from '../api/linkedin';
import { useAppStore } from '../store/useAppStore';

export function useLinkedInAuth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedinToken = useAppStore((s) => s.linkedinToken);
  const linkedinProfile = useAppStore((s) => s.linkedinProfile);
  const setLinkedinAuth = useAppStore((s) => s.setLinkedinAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    // Remove token from URL immediately
    setSearchParams({}, { replace: true });

    fetchLinkedInProfile(token)
      .then((profile) => setLinkedinAuth(token, profile))
      .catch(console.error);
  }, [searchParams, setSearchParams, setLinkedinAuth]);

  return { linkedinToken, linkedinProfile };
}
