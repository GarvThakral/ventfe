import { Skeleton } from './ui/skeleton';

export function ChatListSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 rounded-xl">
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-full" />}
          <div className={`max-w-[70%] space-y-2`}>
            <Skeleton className="h-20 w-64 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
