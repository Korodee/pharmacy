export interface NavigationItem {
  label: string;
  href: string;
}

export interface HeroButton {
  text: string;
  variant: 'primary' | 'secondary';
  href: string;
}

export interface HeroContent {
  primaryHeading: string;
  secondaryHeading: string;
  description: string;
  buttons: HeroButton[];
}

export interface HeroData {
  navigation: NavigationItem[];
  content: HeroContent;
  ctaButton: HeroButton;
}

export const heroData: HeroData = {
  navigation: [
    { label: 'Home', href: '#home' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Services', href: '#services' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'FAQ', href: '#faq' }
  ],
  content: {
    primaryHeading: "lakwa'nikòn:rare We lokwata'karitéhtshere",
    secondaryHeading: "We care about your health.",
    description: "Serving our community with care, convenience, and trusted pharmacy support every day.",
    buttons: [
      {
        text: "Request A Refill",
        variant: "primary",
        href: "modal"
      },
      {
        text: "Learn More",
        variant: "secondary",
        href: "#how-it-works"
      }
    ]
  },
  ctaButton: {
    text: "Request A Refill",
    variant: "primary",
    href: "modal"
  }
};
