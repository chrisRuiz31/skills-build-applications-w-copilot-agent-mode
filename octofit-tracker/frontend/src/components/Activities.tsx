import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((response) => {
        if (!isMounted) return;
        setActivities(response.activities ?? []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError('Unable to load activities');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <CapabilityCard title="Activities" description="Track student activity minutes and points." status="loading" />;
  if (error) return <CapabilityCard title="Activities" description="Track student activity minutes and points." status="error" message={error} />;
  if (activities.length === 0) return <CapabilityCard title="Activities" description="Track student activity minutes and points." status="empty" message="No activities" />;

  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points.">
      <ul className="list-unstyled mb-0">
        {activities.map((activity, index) => (
          <li key={`${activity.type}-${index}`}>
            {activity.type} · {activity.minutes} min · {activity.points} pts
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
