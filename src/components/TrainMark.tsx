type TrainMarkProps = {
  className?: string
}

export function TrainMark({ className = '' }: TrainMarkProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 8h28c5 0 9 4 9 9v25c0 7-5 12-12 13l5 5h-7l-4-5H27l-4 5h-7l5-5c-7-1-12-6-12-13V17c0-5 4-9 9-9Z" fill="currentColor" />
      <path d="M17 18c0-2 2-4 4-4h22c2 0 4 2 4 4v11H17V18Z" fill="#10241f" />
      <path d="M21 34h22" stroke="#10241f" strokeWidth="4" strokeLinecap="round" />
      <circle cx="22" cy="42" r="3" fill="#10241f" />
      <circle cx="42" cy="42" r="3" fill="#10241f" />
    </svg>
  )
}
