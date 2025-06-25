'use client';

import { Disposition, PopulatedUser } from '@sipas/types';
import { ArrowRight } from 'lucide-react';

interface DispositionTimelineProps {
  dispositions: Disposition[];
}

export default function DispositionTimeline({ dispositions }: DispositionTimelineProps) {
  if (dispositions.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat disposisi untuk surat ini.</p>;
  }

  const isPopulatedUser = (user: unknown): user is PopulatedUser => {
    return !!(user && typeof user === 'object' && 'name' in user);
  };

  return (
    <div className="space-y-6">
      {dispositions.map((item, index) => (
        <div key={item._id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            {index < dispositions.length - 1 && <div className="w-px h-full bg-border"></div>}
          </div>
          <div className="pb-6 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>{isPopulatedUser(item.fromUser) ? item.fromUser.name : 'N/A'}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                    <span>{isPopulatedUser(item.toUser) ? item.toUser.name : 'N/A'}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))}
                </p>
            </div>
            <p className="mt-2 p-3 bg-muted/50 rounded-md text-sm">{item.instructions}</p>
          </div>
        </div>
      ))}
    </div>
  );
}