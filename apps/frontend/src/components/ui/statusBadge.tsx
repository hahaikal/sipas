import { cn } from "@/lib/utils";

type LetterStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface StatusBadgeProps {
  status: LetterStatus;
  className?: string;
}

const statusColorMap: Record<LetterStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusText: Record<LetterStatus, string> = {
    PENDING: "Menunggu Persetujuan",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 text-xs font-medium rounded-full border",
        statusColorMap[status],
        className
      )}
    >
      {statusText[status]}
    </span>
  );
};