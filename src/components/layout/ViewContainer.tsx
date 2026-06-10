import type { ReactNode } from 'react';

interface ViewContainerProps {
  children: ReactNode;
}

export default function ViewContainer({ children }: ViewContainerProps) {
  return (
    <main className="mx-auto pt-14 min-h-[calc(100vh-56px)] w-full max-w-content px-6 py-8">
      {children}
    </main>
  );
}
