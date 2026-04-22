<?php

namespace App\Models;

use Database\Factories\WelcomePageContentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WelcomePageContent extends Model
{
    /** @use HasFactory<WelcomePageContentFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'content',
        'logo_image_path',
        'hero_background_image_path',
        'tor_preview_image_path',
        'updated_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    /**
     * Get default content used by the public welcome page.
     *
     * @return array<string, mixed>
     */
    public static function defaultContent(): array
    {
        return [
            'hero' => [
                'badge_left' => 'Deep Learning',
                'badge_right' => 'Forgery Detection',
                'line_one' => 'Detecting',
                'line_highlight' => 'TOR Forgeries',
                'line_three' => 'with Deep Learning',
                'description' => "A research-backed system that uses deep learning to help the USeP Registrar's Office identify forged Transcripts of Records - trained on both synthetic and real-world data.",
                'cta_label' => 'Go to Staff Portal',
                'cta_note' => 'This portal is for authorized Registrar personnel only.',
                'tor_title' => 'TRANSCRIPT OF RECORDS',
                'tor_stamp' => 'CERTIFIED COPY',
                'verdict_title' => 'Authentic',
                'verdict_detail' => 'No forgery detected.',
            ],
            'metrics' => [
                'training_samples' => '124K+',
                'training_label' => 'Training Samples',
                'detection_accuracy' => '96.5%',
                'detection_label' => 'Detection Accuracy',
                'f1_score' => '0.916',
                'f1_label' => 'F1 Score',
            ],
            'about' => [
                'eyebrow' => 'ABOUT THE SYSTEM',
                'title' => 'What This System Does',
                'description' => 'The USeP - OUR TOR Forgery Detection System (OUR AuthenticaTOR) assists Registrar staff in identifying potentially falsified Transcripts of Records using a trained deep learning model - providing an objective, second layer of document verification.',
                'steps' => [
                    [
                        'title' => 'Upload TOR',
                        'description' => 'Registrar staff captures or upload a scanned or photographed TOR directly into the system. No student interaction required.',
                    ],
                    [
                        'title' => 'Deep Learning Model Analysis',
                        'description' => 'The model analyzes the document for inconsistencies, compression artifacts, and signature anomalies.',
                    ],
                    [
                        'title' => 'Verdict',
                        'description' => 'Each check produces a verdict - Authentic or Likely Forged - with a confidence score and visual heatmap of flagged regions.',
                    ],
                ],
            ],
            'thesis' => [
                'eyebrow' => 'THESIS STUDY',
                'title' => 'About This Research',
                'description' => 'This system is the deployment product of a thesis study conducted at the College of Information and Computing, University of Southeastern Philippines (USeP).',
                'cards' => [
                    [
                        'label' => 'TITLE',
                        'value' => 'A Patch-Based Deep Learning Framework for Detecting Forged Transcripts of Records Using GAN-Assisted Synthetic Data and Real-World Forgeries',
                    ],
                    [
                        'label' => 'COLLEGE',
                        'value' => 'College of Information and Computing (CIC)',
                    ],
                    [
                        'label' => 'MODEL ARCHITECTURE',
                        'value' => 'GAN-Assisted + Pix2Pix + Triple Siamese + GradCAM',
                    ],
                    [
                        'label' => 'DATASET',
                        'value' => '100,000 synthetic samples and 20,000 real-world samples',
                    ],
                ],
            ],
            'footer' => [
                'university' => 'University of Southeastern Philippines',
                'office' => 'Office of the University Registrar',
                'location' => 'Obrero Campus, Davao City',
                'email' => 'registrar@usep.edu.ph',
                'system_name' => 'OUR AuthenticaTOR (TOR Forgery Detection System)',
                'college' => 'College of Information and Computing',
                'tag_one' => 'Thesis Research',
                'tag_two' => '2026',
                'copyright' => 'Copyright 2026 Krishna Laureto, Neziel Aniga, and Keziah Bante. All Rights Reserved.',
            ],
        ];
    }

    /**
     * Merge persisted content with defaults to keep a stable render contract.
     *
     * @param  array<string, mixed>|null  $content
     * @return array<string, mixed>
     */
    public static function mergeContent(?array $content): array
    {
        return array_replace_recursive(self::defaultContent(), $content ?? []);
    }
}
