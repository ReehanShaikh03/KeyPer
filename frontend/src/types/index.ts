export interface FeatureCard {
  id: string;
  iconName: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export interface HighlightBadge {
  iconName: string;
  label: string;
}
