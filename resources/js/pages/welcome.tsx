import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUp, BadgeCheck, FileArchive, ScanSearch } from 'lucide-react';
import { dashboard, login, register } from '@/routes';
import type { WelcomeImages, WelcomePageContent } from '@/types';

const fallbackContent: WelcomePageContent = {
    hero: {
        badge_left: 'Deep Learning',
        badge_right: 'Forgery Detection',
        line_one: 'Detecting',
        line_highlight: 'TOR Forgeries',
        line_three: 'with Deep Learning',
        description:
            "A research-backed system that uses deep learning to help the USeP Registrar's Office identify forged Transcripts of Records - trained on both synthetic and real-world data.",
        cta_label: 'Go to Staff Portal',
        cta_note: 'This portal is for authorized Registrar personnel only.',
        tor_title: 'TRANSCRIPT OF RECORDS',
        tor_stamp: 'CERTIFIED COPY',
        verdict_title: 'Authentic',
        verdict_detail: 'No forgery detected.',
    },
    metrics: {
        training_samples: '124K+',
        training_label: 'Training Samples',
        detection_accuracy: '96.5%',
        detection_label: 'Detection Accuracy',
        f1_score: '0.916',
        f1_label: 'F1 Score',
    },
    about: {
        eyebrow: 'ABOUT THE SYSTEM',
        title: 'What This System Does',
        description:
            'The USeP - OUR TOR Forgery Detection System (OUR AuthenticaTOR) assists Registrar staff in identifying potentially falsified Transcripts of Records using a trained deep learning model - providing an objective, second layer of document verification.',
        steps: [
            {
                title: 'Upload TOR',
                description:
                    'Registrar staff captures or upload a scanned or photographed TOR directly into the system. No student interaction required.',
            },
            {
                title: 'Deep Learning Model Analysis',
                description:
                    'The model analyzes the document for inconsistencies, compression artifacts, and signature anomalies.',
            },
            {
                title: 'Verdict',
                description:
                    'Each check produces a verdict - Authentic or Likely Forged - with a confidence score and visual heatmap of flagged regions.',
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
                value: 'A Patch-Based Deep Learning Framework for Detecting Forged Transcripts of Records Using GAN-Assisted Synthetic Data and Real-World Forgeries',
            },
            {
                label: 'COLLEGE',
                value: 'College of Information and Computing (CIC)',
            },
            {
                label: 'MODEL ARCHITECTURE',
                value: 'GAN-Assisted + Pix2Pix + Triple Siamese + GradCAM',
            },
            {
                label: 'DATASET',
                value: '100,000 synthetic samples and 20,000 real-world samples',
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

const fallbackImages: WelcomeImages = {
    logo: null,
    heroBackground: null,
    torPreview: null,
};

const aboutIcons = [FileArchive, ScanSearch, BadgeCheck] as const;

export default function Welcome({
    canRegister = true,
    content = fallbackContent,
    images = fallbackImages,
}: {
    canRegister?: boolean;
    content?: WelcomePageContent;
    images?: WelcomeImages;
}) {
    const { auth } = usePage().props as {
        auth: {
            user?: {
                id: number;
            } | null;
        };
    };

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
                <header className="sticky top-0 z-50 border-b-2 border-[#efbf00] bg-[#60060d]/95 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                            {images.logo ? (
                                <img
                                    src={images.logo}
                                    alt="USeP"
                                    className="size-10 rounded-full border border-[#efbf00]/70 object-cover"
                                />
                            ) : (
                                <div className="flex size-10 items-center justify-center rounded-full border border-[#efbf00]/70 bg-[#2a0000] text-sm font-semibold text-[#efbf00]">
                                    U
                                </div>
                            )}

                            <div className="leading-tight">
                                <p className="font-['Cinzel_Decorative',serif] text-[10px] font-bold sm:text-xs">
                                    University of Southeastern Philippines
                                </p>
                                <p className="font-['Inter',sans-serif] text-[9px] text-[#f4c6c6] sm:text-[11px]">
                                    Obrero Campus, Davao City
                                </p>
                            </div>
                        </div>

                        <nav className="flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-full border border-[#efbf00]/60 px-4 py-1.5 text-xs font-semibold text-[#efbf00] transition hover:border-[#efbf00] hover:bg-[#efbf00]/10 sm:text-sm"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-full border border-[#f3d8bf]/30 px-4 py-1.5 text-xs font-semibold text-[#f3d8bf] transition hover:border-[#f3d8bf]/70 hover:bg-[#f3d8bf]/10 sm:text-sm"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-full bg-[#efbf00] px-4 py-1.5 text-xs font-semibold text-[#3a1500] transition hover:bg-[#f4cb3d] sm:text-sm"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <section className="relative overflow-hidden bg-[#400c10]">
                    {images.heroBackground && (
                        <img
                            src={images.heroBackground}
                            alt=""
                            className="absolute inset-0 size-full object-cover opacity-30"
                        />
                    )}
                    <div className="absolute inset-0 bg-linear-to-b from-black/70 to-[#6f0000]/70" />

                    <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#efbf00] bg-[#400c10]/50 px-4 py-2 text-[10px] font-semibold tracking-wide text-[#efbf00] uppercase sm:text-xs">
                                <span>{content.hero.badge_left}</span>
                                <span className="size-1 rounded-full bg-[#efbf00]" />
                                <span>{content.hero.badge_right}</span>
                            </div>

                            <div className="space-y-3">
                                <h1 className="font-['Source_Code_Pro',monospace] text-4xl leading-[1.1] font-bold sm:text-5xl">
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
                                <p className="max-w-xl font-['Inter',sans-serif] text-sm leading-7 text-[#d3d3d3] sm:text-base">
                                    {content.hero.description}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-[#efab00] to-[#e7730e] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                                >
                                    {content.hero.cta_label}
                                </Link>
                                <p className="text-xs text-[#a7a7a7] sm:text-sm">
                                    {content.hero.cta_note}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#eadfd4]/40 bg-white/95 p-4 text-[#2a2121] shadow-2xl">
                            <div className="flex items-center justify-between rounded-t-md bg-[#9a0000] px-4 py-3 text-white">
                                <p className="font-['Inter',sans-serif] text-[11px] font-bold tracking-wide sm:text-xs">
                                    {content.hero.tor_title}
                                </p>
                                <span className="rounded bg-white px-2 py-1 text-[10px] font-bold text-[#393939]">
                                    {content.hero.tor_stamp}
                                </span>
                            </div>

                            <div className="space-y-4 rounded-b-md border border-[#eadfd4] bg-white p-4">
                                <div className="grid place-items-center rounded-md border border-[#d9cebf] bg-[#f6f0e7] p-3">
                                    {images.torPreview ? (
                                        <img
                                            src={images.torPreview}
                                            alt="TOR preview"
                                            className="h-96 w-full rounded-sm sm:h-80"
                                        />
                                    ) : (
                                        <div className="flex h-72 w-full flex-col items-center justify-center rounded-sm border border-dashed border-[#d0c3b5] bg-white text-center text-xs text-[#7c6f63] sm:h-80">
                                            <span className="font-semibold">
                                                TOR Preview Placeholder
                                            </span>
                                            <span>
                                                Upload an image from Welcome
                                                content settings.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-md border border-[#077336]/30 bg-[#e7fff4] px-3 py-2 text-center text-sm text-[#066a47]">
                                    <span className="font-semibold">
                                        {content.hero.verdict_title}
                                    </span>{' '}
                                    - {content.hero.verdict_detail}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-12 text-center">
                    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 sm:px-6 md:grid-cols-3">
                        {metricItems.map((item) => (
                            <div key={item.label}>
                                <p className="font-['Source_Code_Pro',monospace] text-5xl font-bold text-[#9a0000] sm:text-6xl">
                                    {item.value}
                                </p>
                                <p className="mt-2 font-['Inter',sans-serif] text-sm text-[#656565]">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[#f4f1ee] py-12 text-[#232323]">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <div className="max-w-3xl space-y-3">
                            <p className="text-xs font-semibold tracking-[0.12em] text-[#c49d00]">
                                {content.about.eyebrow}
                            </p>
                            <h2 className="font-['Source_Code_Pro',monospace] text-3xl font-bold text-[#9a0000] sm:text-4xl">
                                {content.about.title}
                            </h2>
                            <p className="font-['Inter',sans-serif] text-sm leading-7 text-[#656565] sm:text-base">
                                {content.about.description}
                            </p>
                        </div>

                        <div className="mt-8 grid gap-4 lg:grid-cols-3">
                            {content.about.steps.map((step, index) => {
                                const Icon = aboutIcons[index] ?? BadgeCheck;

                                return (
                                    <article
                                        key={`about-step-${step.title}`}
                                        className="rounded-xl border border-[#d8d0c9] bg-white p-5"
                                    >
                                        <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg border border-[#ecdcdc] bg-[#f5eaea] text-[#9a0000]">
                                            <Icon className="size-5" />
                                        </div>
                                        <h3 className="font-['Inter',sans-serif] text-base font-bold text-[#232323]">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 font-['Inter',sans-serif] text-sm leading-7 text-[#7b7b7b]">
                                            {step.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="bg-[#400000] py-12 text-white">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <div className="max-w-3xl space-y-3">
                            <p className="text-xs font-semibold tracking-[0.12em] text-[#c49d00]">
                                {content.thesis.eyebrow}
                            </p>
                            <h2 className="font-['Source_Code_Pro',monospace] text-3xl font-bold sm:text-4xl">
                                {content.thesis.title}
                            </h2>
                            <p className="font-['Inter',sans-serif] text-sm leading-7 text-[#bdbdbd] sm:text-base">
                                {content.thesis.description}
                            </p>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {content.thesis.cards.map((card) => (
                                <article
                                    key={`thesis-card-${card.label}`}
                                    className="rounded-xl border border-[#902727] bg-[#9a000066] p-5"
                                >
                                    <p className="text-xs font-semibold tracking-[0.12em] text-[#c49d00]">
                                        {card.label}
                                    </p>
                                    <p className="mt-3 font-['Source_Code_Pro',monospace] text-base leading-7 font-bold text-white">
                                        {card.value}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className="bg-[#1a0000] py-10 text-[#df8383]">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-4">
                            <div className="space-y-1 text-[11px] sm:text-xs">
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

                            <div className="space-y-1 text-[11px] text-[#8a5555] sm:text-xs">
                                <p>{content.footer.system_name}</p>
                                <p>{content.footer.college}</p>
                                <p>
                                    {content.footer.tag_one} -{' '}
                                    {content.footer.tag_two}
                                </p>
                            </div>

                            <p className="text-[11px] text-[#d3d3d3] sm:text-xs">
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
