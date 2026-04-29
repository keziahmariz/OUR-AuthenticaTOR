import { Form, Head } from '@inertiajs/react';
import type { TextareaHTMLAttributes } from 'react';
import WelcomeContentController from '@/actions/App/Http/Controllers/Settings/WelcomeContentController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/welcome-content';
import type { WelcomeImages, WelcomePageContent } from '@/types';

type Props = {
    content: WelcomePageContent;
    images: WelcomeImages;
};

type FormErrors = Record<string, string>;

function Textarea({
    className = '',
    ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={`flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 ${className}`}
            {...props}
        />
    );
}

export default function WelcomeContent({ content, images }: Props) {
    return (
        <>
            <Head title="Welcome content" />

            <h1 className="sr-only">Welcome content</h1>

            <div className="space-y-8">
                <Heading
                    variant="small"
                    title="Welcome page CMS"
                    description="Update landing page copy and image assets"
                />

                <Form
                    {...WelcomeContentController.update.form()}
                    options={{ preserveScroll: true }}
                    encType="multipart/form-data"
                    className="space-y-8"
                >
                    {({ processing, errors }) => {
                        const formErrors = errors as FormErrors;

                        return (
                            <>
                                <section className="space-y-4 rounded-lg border p-4">
                                    <h2 className="text-base font-medium">
                                        Hero section
                                    </h2>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-badge-left">
                                                Badge left
                                            </Label>
                                            <Input
                                                id="hero-badge-left"
                                                name="content[hero][badge_left]"
                                                defaultValue={
                                                    content.hero.badge_left
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.badge_left'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-badge-right">
                                                Badge right
                                            </Label>
                                            <Input
                                                id="hero-badge-right"
                                                name="content[hero][badge_right]"
                                                defaultValue={
                                                    content.hero.badge_right
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.badge_right'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-line-one">
                                                Title line one
                                            </Label>
                                            <Input
                                                id="hero-line-one"
                                                name="content[hero][line_one]"
                                                defaultValue={
                                                    content.hero.line_one
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.line_one'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-line-highlight">
                                                Title highlight
                                            </Label>
                                            <Input
                                                id="hero-line-highlight"
                                                name="content[hero][line_highlight]"
                                                defaultValue={
                                                    content.hero.line_highlight
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.line_highlight'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-line-three">
                                                Title line three
                                            </Label>
                                            <Input
                                                id="hero-line-three"
                                                name="content[hero][line_three]"
                                                defaultValue={
                                                    content.hero.line_three
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.line_three'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="hero-description">
                                            Hero description
                                        </Label>
                                        <Textarea
                                            id="hero-description"
                                            name="content[hero][description]"
                                            defaultValue={
                                                content.hero.description
                                            }
                                        />
                                        <InputError
                                            message={
                                                formErrors[
                                                    'content.hero.description'
                                                ]
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-cta-label">
                                                CTA button label
                                            </Label>
                                            <Input
                                                id="hero-cta-label"
                                                name="content[hero][cta_label]"
                                                defaultValue={
                                                    content.hero.cta_label
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.cta_label'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-cta-note">
                                                CTA note
                                            </Label>
                                            <Input
                                                id="hero-cta-note"
                                                name="content[hero][cta_note]"
                                                defaultValue={
                                                    content.hero.cta_note
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.cta_note'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-tor-title">
                                                TOR card title
                                            </Label>
                                            <Input
                                                id="hero-tor-title"
                                                name="content[hero][tor_title]"
                                                defaultValue={
                                                    content.hero.tor_title
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.tor_title'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-tor-stamp">
                                                TOR stamp
                                            </Label>
                                            <Input
                                                id="hero-tor-stamp"
                                                name="content[hero][tor_stamp]"
                                                defaultValue={
                                                    content.hero.tor_stamp
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.tor_stamp'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-verdict-title">
                                                Verdict title
                                            </Label>
                                            <Input
                                                id="hero-verdict-title"
                                                name="content[hero][verdict_title]"
                                                defaultValue={
                                                    content.hero.verdict_title
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.verdict_title'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="hero-verdict-detail">
                                                Verdict detail
                                            </Label>
                                            <Input
                                                id="hero-verdict-detail"
                                                name="content[hero][verdict_detail]"
                                                defaultValue={
                                                    content.hero.verdict_detail
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.hero.verdict_detail'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4 rounded-lg border p-4">
                                    <h2 className="text-base font-medium">
                                        Metrics
                                    </h2>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="metric-training-samples">
                                                Training samples
                                            </Label>
                                            <Input
                                                id="metric-training-samples"
                                                name="content[metrics][training_samples]"
                                                defaultValue={
                                                    content.metrics
                                                        .training_samples
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.metrics.training_samples'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="metric-detection-accuracy">
                                                Detection accuracy
                                            </Label>
                                            <Input
                                                id="metric-detection-accuracy"
                                                name="content[metrics][detection_accuracy]"
                                                defaultValue={
                                                    content.metrics
                                                        .detection_accuracy
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.metrics.detection_accuracy'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="metric-f1-score">
                                                F1 score
                                            </Label>
                                            <Input
                                                id="metric-f1-score"
                                                name="content[metrics][f1_score]"
                                                defaultValue={
                                                    content.metrics.f1_score
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.metrics.f1_score'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="metric-training-label">
                                                Training label
                                            </Label>
                                            <Input
                                                id="metric-training-label"
                                                name="content[metrics][training_label]"
                                                defaultValue={
                                                    content.metrics
                                                        .training_label
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.metrics.training_label'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="metric-detection-label">
                                                Detection label
                                            </Label>
                                            <Input
                                                id="metric-detection-label"
                                                name="content[metrics][detection_label]"
                                                defaultValue={
                                                    content.metrics
                                                        .detection_label
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.metrics.detection_label'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="metric-f1-label">
                                                F1 label
                                            </Label>
                                            <Input
                                                id="metric-f1-label"
                                                name="content[metrics][f1_label]"
                                                defaultValue={
                                                    content.metrics.f1_label
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.metrics.f1_label'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4 rounded-lg border p-4">
                                    <h2 className="text-base font-medium">
                                        About the system
                                    </h2>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="about-eyebrow">
                                                Eyebrow
                                            </Label>
                                            <Input
                                                id="about-eyebrow"
                                                name="content[about][eyebrow]"
                                                defaultValue={
                                                    content.about.eyebrow
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.about.eyebrow'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="about-title">
                                                Section title
                                            </Label>
                                            <Input
                                                id="about-title"
                                                name="content[about][title]"
                                                defaultValue={
                                                    content.about.title
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.about.title'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="about-description">
                                            Section description
                                        </Label>
                                        <Textarea
                                            id="about-description"
                                            name="content[about][description]"
                                            defaultValue={
                                                content.about.description
                                            }
                                        />
                                        <InputError
                                            message={
                                                formErrors[
                                                    'content.about.description'
                                                ]
                                            }
                                        />
                                    </div>

                                    {content.about.steps.map((step, index) => (
                                        <div
                                            key={`about-step-${index}`}
                                            className="grid gap-4 rounded-md border p-4 md:grid-cols-2"
                                        >
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`about-step-title-${index}`}
                                                >
                                                    Step {index + 1} title
                                                </Label>
                                                <Input
                                                    id={`about-step-title-${index}`}
                                                    name={`content[about][steps][${index}][title]`}
                                                    defaultValue={step.title}
                                                />
                                                <InputError
                                                    message={
                                                        formErrors[
                                                            `content.about.steps.${index}.title`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`about-step-description-${index}`}
                                                >
                                                    Step {index + 1} description
                                                </Label>
                                                <Textarea
                                                    id={`about-step-description-${index}`}
                                                    name={`content[about][steps][${index}][description]`}
                                                    defaultValue={
                                                        step.description
                                                    }
                                                    className="min-h-24"
                                                />
                                                <InputError
                                                    message={
                                                        formErrors[
                                                            `content.about.steps.${index}.description`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </section>

                                <section className="space-y-4 rounded-lg border p-4">
                                    <h2 className="text-base font-medium">
                                        Thesis section
                                    </h2>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="thesis-eyebrow">
                                                Eyebrow
                                            </Label>
                                            <Input
                                                id="thesis-eyebrow"
                                                name="content[thesis][eyebrow]"
                                                defaultValue={
                                                    content.thesis.eyebrow
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.thesis.eyebrow'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="thesis-title">
                                                Section title
                                            </Label>
                                            <Input
                                                id="thesis-title"
                                                name="content[thesis][title]"
                                                defaultValue={
                                                    content.thesis.title
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.thesis.title'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="thesis-description">
                                            Section description
                                        </Label>
                                        <Textarea
                                            id="thesis-description"
                                            name="content[thesis][description]"
                                            defaultValue={
                                                content.thesis.description
                                            }
                                        />
                                        <InputError
                                            message={
                                                formErrors[
                                                    'content.thesis.description'
                                                ]
                                            }
                                        />
                                    </div>

                                    {content.thesis.cards.map((card, index) => (
                                        <div
                                            key={`thesis-card-${index}`}
                                            className="grid gap-4 rounded-md border p-4 md:grid-cols-2"
                                        >
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`thesis-card-label-${index}`}
                                                >
                                                    Card {index + 1} label
                                                </Label>
                                                <Input
                                                    id={`thesis-card-label-${index}`}
                                                    name={`content[thesis][cards][${index}][label]`}
                                                    defaultValue={card.label}
                                                />
                                                <InputError
                                                    message={
                                                        formErrors[
                                                            `content.thesis.cards.${index}.label`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`thesis-card-value-${index}`}
                                                >
                                                    Card {index + 1} value
                                                </Label>
                                                <Textarea
                                                    id={`thesis-card-value-${index}`}
                                                    name={`content[thesis][cards][${index}][value]`}
                                                    defaultValue={card.value}
                                                    className="min-h-24"
                                                />
                                                <InputError
                                                    message={
                                                        formErrors[
                                                            `content.thesis.cards.${index}.value`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </section>

                                <section className="space-y-4 rounded-lg border p-4">
                                    <h2 className="text-base font-medium">
                                        Footer
                                    </h2>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="footer-university">
                                                University
                                            </Label>
                                            <Input
                                                id="footer-university"
                                                name="content[footer][university]"
                                                defaultValue={
                                                    content.footer.university
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.footer.university'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="footer-office">
                                                Office
                                            </Label>
                                            <Input
                                                id="footer-office"
                                                name="content[footer][office]"
                                                defaultValue={
                                                    content.footer.office
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.footer.office'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="footer-location">
                                                Location
                                            </Label>
                                            <Input
                                                id="footer-location"
                                                name="content[footer][location]"
                                                defaultValue={
                                                    content.footer.location
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.footer.location'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="footer-email">
                                                Email
                                            </Label>
                                            <Input
                                                id="footer-email"
                                                name="content[footer][email]"
                                                defaultValue={
                                                    content.footer.email
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.footer.email'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="footer-system-name">
                                            System name
                                        </Label>
                                        <Input
                                            id="footer-system-name"
                                            name="content[footer][system_name]"
                                            defaultValue={
                                                content.footer.system_name
                                            }
                                        />
                                        <InputError
                                            message={
                                                formErrors[
                                                    'content.footer.system_name'
                                                ]
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="footer-college">
                                                College
                                            </Label>
                                            <Input
                                                id="footer-college"
                                                name="content[footer][college]"
                                                defaultValue={
                                                    content.footer.college
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.footer.college'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="footer-tag-one">
                                                Tag one
                                            </Label>
                                            <Input
                                                id="footer-tag-one"
                                                name="content[footer][tag_one]"
                                                defaultValue={
                                                    content.footer.tag_one
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.footer.tag_one'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="footer-tag-two">
                                                Tag two
                                            </Label>
                                            <Input
                                                id="footer-tag-two"
                                                name="content[footer][tag_two]"
                                                defaultValue={
                                                    content.footer.tag_two
                                                }
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'content.footer.tag_two'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="footer-copyright">
                                            Copyright
                                        </Label>
                                        <Input
                                            id="footer-copyright"
                                            name="content[footer][copyright]"
                                            defaultValue={
                                                content.footer.copyright
                                            }
                                        />
                                        <InputError
                                            message={
                                                formErrors[
                                                    'content.footer.copyright'
                                                ]
                                            }
                                        />
                                    </div>
                                </section>

                                <section className="space-y-4 rounded-lg border p-4">
                                    <h2 className="text-base font-medium">
                                        Images
                                    </h2>

                                    <div className="grid gap-6 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="logo-image">
                                                Logo image
                                            </Label>
                                            {images.logo && (
                                                <img
                                                    src={images.logo}
                                                    alt="Current logo"
                                                    className="h-20 w-20 rounded-md border object-cover"
                                                />
                                            )}
                                            <Input
                                                id="logo-image"
                                                type="file"
                                                name="logo_image"
                                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                            />
                                            <InputError
                                                message={
                                                    formErrors['logo_image']
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="hero-background-image">
                                                Hero background image
                                            </Label>
                                            {images.heroBackground && (
                                                <img
                                                    src={images.heroBackground}
                                                    alt="Current hero background"
                                                    className="h-24 w-full rounded-md border object-cover"
                                                />
                                            )}
                                            <Input
                                                id="hero-background-image"
                                                type="file"
                                                name="hero_background_image"
                                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'hero_background_image'
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tor-preview-image">
                                                TOR preview image
                                            </Label>
                                            {images.torPreview && (
                                                <img
                                                    src={images.torPreview}
                                                    alt="Current TOR preview"
                                                    className="h-24 w-full rounded-md border object-cover"
                                                />
                                            )}
                                            <Input
                                                id="tor-preview-image"
                                                type="file"
                                                name="tor_preview_image"
                                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                            />
                                            <InputError
                                                message={
                                                    formErrors[
                                                        'tor_preview_image'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>
                                        Save content
                                    </Button>
                                </div>
                            </>
                        );
                    }}
                </Form>
            </div>
        </>
    );
}

WelcomeContent.layout = {
    breadcrumbs: [
        {
            title: 'Welcome content',
            href: edit(),
        },
    ],
};
