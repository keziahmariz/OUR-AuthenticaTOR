import { Head, Link } from '@inertiajs/react';
import {
    ArrowUp,
    BadgeCheck,
    FileArchive,
    LogIn,
    ScanSearch,
} from 'lucide-react';
import { login } from '@/routes';
import type { WelcomeImages, WelcomePageContent } from '@/types';

const fallbackContent: WelcomePageContent = {
    hero: {
        badge_left: 'Deep Learning',
        badge_right: 'Forgery Detection',
        line_one: 'Detecting',
        line_highlight: 'TOR Forgeries',
        line_three: 'with Deep Learning',
        description:
            "A research-backed system that uses deep learning to help the USeP Registrar's Office identify forged Transcripts of Records - trained on fabricated forgery samples and GAN-assisted synthetic data.",
        cta_label: 'Go to Staff Portal',
        cta_note: 'This portal is for authorized Registrar personnel only.',
        tor_title: 'TRANSCRIPT OF RECORDS',
        tor_stamp: 'CERTIFIED COPY',
        verdict_title: 'Authentic',
        verdict_detail: 'No forgery detected.',
    },
    metrics: {
        training_samples: '135K+',
        training_label: 'Training Samples of Patches',
        detection_accuracy: '95%',
        detection_label: 'Detection Accuracy',
        f1_score: '0.90',
        f1_label: 'F1 Score',
    },
    about: {
        eyebrow: 'ABOUT THE SYSTEM',
        title: 'What This System Does',
        description:
            'The USeP - OUR TOR Forgery Detection System (OUR AuthenticaTOR) assists Registrar staff in identifying potentially forged Transcripts of Records using a trained deep learning model - providing an objective, second layer of document verification.',
        steps: [
            {
                title: 'Upload TOR',
                description:
                    'Registrar staff captures or uploads a photographed TOR directly into the system. No student interaction required.',
            },
            {
                title: 'Deep Learning Model Analysis',
                description:
                    'The model analyzes the document for known inconsistencies based on trained data.',
            },
            {
                title: 'Verdict',
                description:
                    'Each check produces a verdict - Likely Authentic or Suspicious - with a per-region score and graph.',
            },
        ],
    },
    thesis: {
        eyebrow: 'THESIS STUDY',
        title: 'About This Research',
        description:
            'This system is the deployment product of a thesis study conducted at the College of Information and Computing, University of Southeastern Philippines (USeP).',
        cards: [
            {
                label: 'TITLE',
                value: 'A Patch-Based Deep Learning Framework for Detecting Forged Transcripts of Records Using Fabricated Forgery Samples and GAN-Assisted Synthetic Data',
            },
            {
                label: 'COLLEGE',
                value: 'College of Information and Computing (CIC)',
            },
            {
                label: 'MODEL ARCHITECTURE',
                value: 'EfficientNet-B0 + Pix2Pix + ResNet18 Siamese + Tesseract OCR',
            },
            {
                label: 'TRAINING SAMPLES',
                value: '135,884 patches (Combined: 89,516 genuine + 46,368 forged)',
            },
        ],
    },
    footer: {
        university: 'University of Southeastern Philippines',
        office: 'Office of the University Registrar',
        location: 'Obrero Campus, Davao City',
        email: 'registrar@usep.edu.ph',
        system_name: 'OUR AuthenticaTOR (TOR Forgery Detection System)',
        college: 'College of Information and Computing',
        tag_one: 'Thesis Research',
        tag_two: '2026',
        copyright:
            'Copyright 2026 Krishna Laureto, Neziel Aniga, and Keziah Bante. All Rights Reserved.',
    },
};

const fallbackImages = {
    logo: '/usep-logo-small.png',
    heroBackground: '/welcome-hero-background.png',
    heroBackgroundMobile: '/welcome-hero-background-mobile.png',
    torPreview: '/welcome-tor-preview.svg',
} satisfies Record<keyof WelcomeImages | 'heroBackgroundMobile', string>;

const aboutIcons = [FileArchive, ScanSearch, BadgeCheck] as const;

export default function Welcome({
    content = fallbackContent,
    images = fallbackImages,
}: {
    canRegister?: boolean;
    content?: WelcomePageContent;
    images?: WelcomeImages;
}) {
    const metricItems = [
        {
            value: content.metrics.training_samples,
            label: content.metrics.training_label,
        },
        {
            value: content.metrics.detection_accuracy,
            label: content.metrics.detection_label,
        },
        {
            value: content.metrics.f1_score,
            label: content.metrics.f1_label,
        },
    ];
    const heroBackground =
        images.heroBackground ?? fallbackImages.heroBackground;
    const mobileHeroBackground =
        images.heroBackground ?? fallbackImages.heroBackgroundMobile;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=cinzel-decorative:700|inter:400,500,600,700|source-code-pro:600,700"
                    rel="stylesheet"
                />
            </Head>

            <div id="top" className="min-h-screen bg-[#1e1a1a] text-white">
                <header className="sticky top-0 z-50 border-b-2 border-[#efbf00] bg-[#60060d]">
                    <div className="mx-auto flex h-[60px] w-full max-w-6xl items-center gap-2 px-6 py-2">
                        {images.logo ? (
                            <img
                                src={images.logo}
                                alt="USeP"
                                className="size-8 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2a0000] text-xs font-semibold text-[#efbf00]">
                                U
                            </div>
                        )}

                        <div className="leading-none">
                            <p className="font-['Cinzel_Decorative',serif] text-[10px] font-bold sm:text-xs">
                                University of Southeastern Philippines
                            </p>
                            <p className="mt-1 font-['Inter',sans-serif] text-[9px] text-white sm:text-[10px]">
                                Obrero Campus, Davao City
                            </p>
                        </div>
                    </div>
                </header>

                <section className="relative overflow-hidden bg-[#400c10]">
                    <picture>
                        <source
                            media="(min-width: 768px)"
                            srcSet={heroBackground}
                        />
                        <img
                            src={mobileHeroBackground}
                            alt=""
                            className="absolute inset-0 size-full object-cover object-center"
                        />
                    </picture>
                    <div className="absolute inset-0 bg-linear-to-b from-black/80 to-[#6f0000]/80" />

                    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12 lg:py-14">
                        <div className="space-y-8 lg:sticky lg:top-24">
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#efbf00] bg-[#400c10]/40 px-3 py-2 text-[8px] font-semibold text-[#efbf00] uppercase sm:text-[10px]">
                                <span>{content.hero.badge_left}</span>
                                <span className="size-1 rounded-full bg-[#efbf00]" />
                                <span>{content.hero.badge_right}</span>
                            </div>

                            <div className="space-y-3">
                                <h1 className="font-['Source_Code_Pro',monospace] text-[32px] leading-[1.16] font-bold sm:text-5xl">
                                    <span className="block">
                                        {content.hero.line_one}
                                    </span>
                                    <span className="block text-[#efbf00]">
                                        {content.hero.line_highlight}
                                    </span>
                                    <span className="block">
                                        {content.hero.line_three}
                                    </span>
                                </h1>
                                <p className="max-w-xl font-['Inter',sans-serif] text-sm leading-[1.6] text-[#d3d3d3]">
                                    {content.hero.description}
                                </p>
                            </div>

                            <div className="space-y-3.5">
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center gap-1 rounded-full bg-linear-to-r from-[#efab00] to-[#e7730e] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                                >
                                    <LogIn className="size-5" />
                                    {content.hero.cta_label}
                                </Link>
                                <p className="text-xs text-[#a7a7a7]">
                                    {content.hero.cta_note}
                                </p>
                            </div>
                        </div>

                        <div className="w-full overflow-hidden rounded-lg">
                            <div className="flex items-center justify-between bg-[#9a0000] px-5 py-4 text-white">
                                <p className="font-['Inter',sans-serif] text-[11px] font-bold sm:text-xs">
                                    {content.hero.tor_title}
                                </p>
                                <span className="rounded bg-white px-3 py-1 text-[10px] font-bold text-[#393939]">
                                    {content.hero.tor_stamp}
                                </span>
                            </div>

                            <div className="grid place-items-center rounded-b-lg border border-[#eadfd4] bg-white p-5">
                                <img
                                    src={
                                        images.torPreview ??
                                        fallbackImages.torPreview
                                    }
                                    alt="TOR preview"
                                    className="h-auto max-h-[418px] w-full max-w-[275px] object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-14 text-center">
                    <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 md:grid-cols-3">
                        {metricItems.map((item, idx) => (
                            <div key={`metric-${idx}`}>
                                <p className="font-['Source_Code_Pro',monospace] text-6xl leading-none font-bold text-[#9a0000]">
                                    {item.value}
                                </p>
                                <p className="mt-2 font-['Inter',sans-serif] text-xs text-[#656565]">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[#f4f1ee] py-8 text-[#232323]">
                    <div className="mx-auto w-full max-w-6xl px-6">
                        <div className="max-w-3xl space-y-8">
                            <p className="text-xs font-semibold text-[#c49d00]">
                                {content.about.eyebrow}
                            </p>
                            <div className="space-y-3">
                                <h2 className="font-['Source_Code_Pro',monospace] text-[26px] leading-[1.16] font-bold text-[#9a0000] sm:text-4xl">
                                    {content.about.title}
                                </h2>
                                <p className="font-['Inter',sans-serif] text-sm leading-[1.6] text-[#656565]">
                                    {content.about.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 lg:grid-cols-3">
                            {content.about.steps.map((step, index) => {
                                const Icon = aboutIcons[index] ?? BadgeCheck;

                                return (
                                    <article
                                        key={`about-step-${index}`}
                                        className="rounded-xl border border-[#d8d0c9] bg-white p-6"
                                    >
                                        <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[#ecdcdc] bg-[#f5eaea] text-[#9a0000]">
                                            <Icon className="size-4" />
                                        </div>
                                        <h3 className="font-['Inter',sans-serif] text-sm font-bold text-[#232323]">
                                            {step.title}
                                        </h3>
                                        <p className="mt-3 font-['Inter',sans-serif] text-sm leading-[1.6] text-[#7b7b7b]">
                                            {step.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="bg-[#440000] py-8 text-white">
                    <div className="mx-auto w-full max-w-6xl px-6">
                        <div className="max-w-3xl space-y-8">
                            <p className="text-xs font-semibold text-[#c49d00]">
                                {content.thesis.eyebrow}
                            </p>
                            <div className="space-y-3">
                                <h2 className="font-['Source_Code_Pro',monospace] text-[26px] leading-[1.16] font-bold sm:text-4xl">
                                    {content.thesis.title}
                                </h2>
                                <p className="font-['Inter',sans-serif] text-sm leading-[1.6] text-[#bdbdbd]">
                                    {content.thesis.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                            {content.thesis.cards.map((card, idx) => (
                                <article
                                    key={`thesis-card-${idx}`}
                                    className="rounded-xl border border-[#902727] bg-[#9a0000]/40 p-5"
                                >
                                    <p className="text-xs font-semibold text-[#c49d00]">
                                        {card.label}
                                    </p>
                                    <p className="mt-3 font-['Source_Code_Pro',monospace] text-base leading-[1.6] font-bold text-white">
                                        {card.value}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className="bg-[#1a0000] py-8 text-[#df8383]">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-7 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-4">
                            <div className="space-y-1 text-[8px] sm:text-xs">
                                <p className="font-semibold">
                                    {content.footer.university}
                                </p>
                                <p>
                                    {content.footer.office} -{' '}
                                    {content.footer.location}
                                </p>
                                <p>{content.footer.email}</p>
                            </div>

                            <div className="h-px w-12 bg-[#662929]" />

                            <div className="space-y-1 text-[8px] text-[#8a5555] sm:text-xs">
                                <p>{content.footer.system_name}</p>
                                <p>{content.footer.college}</p>
                                <p>
                                    {content.footer.tag_one} -{' '}
                                    {content.footer.tag_two}
                                </p>
                            </div>

                            <p className="text-[9px] text-[#d3d3d3] sm:text-xs">
                                {content.footer.copyright}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }
                            className="inline-flex size-11 items-center justify-center rounded-full bg-[#f4f1ee] text-[#662f2f] shadow-[0px_1px_15px_0px_rgba(102,47,47,0.8)] transition hover:scale-105"
                            aria-label="Back to top"
                        >
                            <ArrowUp className="size-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
}
