import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  status?: 'loading' | 'empty' | 'error' | 'ready';
  message?: string;
  children?: ReactNode;
};

export function CapabilityCard({ title, description, status = 'ready', message, children }: Props) {
  if (status === 'loading') {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p role="status">Loading...</p></div></section>;
  }

  if (status === 'error') {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p role="alert">{message ?? 'Unable to load data'}</p></div></section>;
  }

  if (status === 'empty') {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p>{message ?? `No ${title.toLowerCase()}`}</p></div></section>;
  }

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>{children}</div></section>;
}
