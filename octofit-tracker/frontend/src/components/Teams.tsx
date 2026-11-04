import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then((response) => {
        if (!isMounted) return;
        setTeams(response.teams ?? []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError('Unable to load teams');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <CapabilityCard title="Teams" description="Manage teams and members." status="loading" />;
  if (error) return <CapabilityCard title="Teams" description="Manage teams and members." status="error" message={error} />;
  if (teams.length === 0) return <CapabilityCard title="Teams" description="Manage teams and members." status="empty" message="No teams" />;

  return (
    <CapabilityCard title="Teams" description="Manage teams and members.">
      <ul className="list-unstyled mb-0">
        {teams.map((team) => (
          <li key={team.name}>
            {team.name} ({team.members?.length ?? 0} members)
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
