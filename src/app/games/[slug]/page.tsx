'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GamePage() {
  const { slug } = useParams();
  const [gamePath, setGamePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchGamePath = async () => {
        try {
          const res = await fetch(`/api/games/${slug}`);
          if (res.ok) {
            const data = await res.json();
            setGamePath(data.gamePath);
          } else {
            setError('Game not found');
          }
        } catch (err) {
          setError('Error fetching game path');
        }
        setLoading(false);
      };

      fetchGamePath();
    }
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!gamePath) {
    return <div>Game not found</div>;
  }

  return (
    <iframe src={gamePath} style={{ width: '100%', height: '100vh', border: 'none' }} />
  );
}