export type WelcomeHeroContent = {
    badge_left: string;
    badge_right: string;
    line_one: string;
    line_highlight: string;
    line_three: string;
    description: string;
    cta_label: string;
    cta_note: string;
    tor_title: string;
    tor_stamp: string;
    verdict_title: string;
    verdict_detail: string;
};

export type WelcomeMetricsContent = {
    training_samples: string;
    training_label: string;
    detection_accuracy: string;
    detection_label: string;
    f1_score: string;
    f1_label: string;
};

export type WelcomeStepContent = {
    title: string;
    description: string;
};

export type WelcomeAboutContent = {
    eyebrow: string;
    title: string;
    description: string;
    steps: WelcomeStepContent[];
};

export type WelcomeCardContent = {
    label: string;
    value: string;
};

export type WelcomeThesisContent = {
    eyebrow: string;
    title: string;
    description: string;
    cards: WelcomeCardContent[];
};

export type WelcomeFooterContent = {
    university: string;
    office: string;
    location: string;
    email: string;
    system_name: string;
    college: string;
    tag_one: string;
    tag_two: string;
    copyright: string;
};

export type WelcomePageContent = {
    hero: WelcomeHeroContent;
    metrics: WelcomeMetricsContent;
    about: WelcomeAboutContent;
    thesis: WelcomeThesisContent;
    footer: WelcomeFooterContent;
};

export type WelcomeImages = {
    logo: string | null;
    heroBackground: string | null;
    torPreview: string | null;
};
