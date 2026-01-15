export interface Link {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  createdAt: Date;
}

export interface LinkGroup {
  id: string;
  name: string;
  color: string;
  icon: string;
  links: Link[];
  isExpanded: boolean;
  createdAt: Date;
}

export const GROUP_COLORS = [
  { name: 'Blue', value: 'hsl(211 100% 50%)' },
  { name: 'Purple', value: 'hsl(270 70% 55%)' },
  { name: 'Pink', value: 'hsl(330 80% 60%)' },
  { name: 'Red', value: 'hsl(0 80% 55%)' },
  { name: 'Orange', value: 'hsl(25 95% 55%)' },
  { name: 'Yellow', value: 'hsl(45 100% 50%)' },
  { name: 'Green', value: 'hsl(145 65% 45%)' },
  { name: 'Teal', value: 'hsl(180 60% 45%)' },
];

export const GROUP_ICONS = [
  'folder', 'bookmark', 'star', 'heart', 'briefcase', 
  'code', 'globe', 'music', 'film', 'shopping-bag',
  'book', 'camera', 'coffee', 'gift', 'home'
];
