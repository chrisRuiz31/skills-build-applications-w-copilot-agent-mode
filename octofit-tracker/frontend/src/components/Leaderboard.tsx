import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type TeamScore = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getJson<{ leaderboard: TeamScore[] }>('/api/leaderboard')
      .then((response) => {
        if (!isMounted) return;
        setLeaderboard(response.leaderboard ?? []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError('Unable to load leaderboard');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <CapabilityCard title="Leaderboard" description="Compare team point totals." status="loading" />;
  if (error) return <CapabilityCard title="Leaderboard" description="Compare team point totals." status="error" message={error} />;
  if (leaderboard.length === 0) return <CapabilityCard title="Leaderboard" description="Compare team point totals." status="empty" message="No leaderboard" />;

  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals.">
      <ol className="mb-0">
        {leaderboard.map((entry) => (
          <li key={`${entry.teamName}-${entry.rank}`}>
            {entry.teamName}: {entry.totalPoints} pts (rank {entry.rank})
          </li>
        ))}
      </ol>
    </CapabilityCard>
  );
}
