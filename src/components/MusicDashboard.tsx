'use client';
import { useDojo } from '@/lib/dojo/hooks/useDojo';
import { useEffect, useState } from 'react';

interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  points: number; 
}

interface Song {
  id: string;
  title: string;
  artist: string;
  category: string;
  plays: number;
}

interface Category {
  id: string;
  name: string;
  songCount: number;
}

export default function MusicDashboard() {
  const { systemCalls } = useDojo();
  const [songs, setSongs] = useState<Song[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!systemCalls) {
          setError('System calls not initialized');
          return;
        }

        const [songsData, categoriesData, leaderboardData] = await Promise.all([
          systemCalls.getSongs(),
          systemCalls.getCategories(),
          systemCalls.getLeaderboard()
        ]);

        setSongs(songsData);
        setCategories(categoriesData);
        setLeaderboard(leaderboardData.map((user: any, index: number) => ({
          ...user,
          rank: index + 1,
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [systemCalls]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading music data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Music Dashboard</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Songs</h2>
        <div className="grid gap-4">
          {songs?.map((song) => (
            <div key={song.id} className="p-4 border rounded-lg">
              <h3 className="font-medium">{song.title}</h3>
              <p className="text-gray-600">{song.artist}</p>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">{song.category}</span>
                <span className="text-sm font-medium">{song.plays.toLocaleString()} plays</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex gap-2 flex-wrap">
          {categories?.map((category) => (
            <span key={category.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {category.name} ({category.songCount})
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
        <div className="space-y-3">
          {leaderboard?.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-medium w-6 text-center">{user.rank}</span>
                <span>{user.username}</span>
              </div>
              <span className="font-medium">{user.points} pts</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}