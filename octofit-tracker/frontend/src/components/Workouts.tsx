import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; focus?: string; reason?: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getJson<{ suggestions: WorkoutSuggestion[] }>('/api/workouts/suggestions/mona@example.com')
      .then((response) => {
        if (!isMounted) return;
        setSuggestions(response.suggestions ?? []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError('Unable to load workout suggestions');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." status="loading" />;
  if (error) return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." status="error" message={error} />;
  if (suggestions.length === 0) return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." status="empty" message="No suggestions" />;

  return (
    <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns.">
      <ul className="list-unstyled mb-0">
        {suggestions.map((suggestion) => (
          <li key={suggestion.title}>
            <strong>{suggestion.title}</strong>
            {suggestion.reason ? <div>{suggestion.reason}</div> : null}
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
