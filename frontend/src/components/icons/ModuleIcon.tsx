import * as AllIcons from "./lucide-icons.generated";

const iconLookup = AllIcons as Record<
  string,
  React.ComponentType<{ className?: string }>
>;

interface ModuleIconProps {
  name: string;
  className?: string;
}

function ModuleIcon({ name, className }: ModuleIconProps) {
  const Icon = iconLookup[name];
  if (Icon) return <Icon className={className} />;
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z"
      />
    </svg>
  );
}

export default ModuleIcon;
