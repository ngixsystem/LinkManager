import {
  Folder,
  Bookmark,
  Star,
  Heart,
  Briefcase,
  Code,
  Globe,
  Music,
  Film,
  ShoppingBag,
  Book,
  Camera,
  Coffee,
  Gift,
  Home,
  LucideProps,
} from 'lucide-react';

const iconMap: Record<string, React.FC<LucideProps>> = {
  folder: Folder,
  bookmark: Bookmark,
  star: Star,
  heart: Heart,
  briefcase: Briefcase,
  code: Code,
  globe: Globe,
  music: Music,
  film: Film,
  'shopping-bag': ShoppingBag,
  book: Book,
  camera: Camera,
  coffee: Coffee,
  gift: Gift,
  home: Home,
};

interface GroupIconProps extends LucideProps {
  icon: string;
}

export function GroupIcon({ icon, ...props }: GroupIconProps) {
  const IconComponent = iconMap[icon] || Folder;
  return <IconComponent {...props} />;
}
