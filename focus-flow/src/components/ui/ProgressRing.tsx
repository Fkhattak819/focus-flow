interface ProgressRingProps {
  progress: number
}

export function ProgressRing({ progress }: ProgressRingProps) {
  const size = 200
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(1, progress)) * c

  return (
    <svg width={size} height={size} className="mx-auto text-[#601ff5]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

