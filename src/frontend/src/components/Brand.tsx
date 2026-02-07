export default function Brand({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="font-bold text-lg leading-tight">SevaSangam</span>
      <span className="text-sm leading-tight opacity-80">सेवा संगम • সেৱা সংগম</span>
    </div>
  );
}
