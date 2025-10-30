interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="border-b border-zinc-800 bg-black">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
