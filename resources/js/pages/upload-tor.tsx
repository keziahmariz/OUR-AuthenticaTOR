import { Head, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Camera,
    CheckCircle2,
    Cpu,
    FileImage,
    Frown,
    RotateCcw,
    Search,
    Smile,
    X,
    Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { analyze } from '@/actions/App/Http/Controllers/UploadTorController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { uploadTor } from '@/routes';

const allowedMimeTypes = ['image/jpeg', 'image/png'];
const maxFileSize = 10 * 1024 * 1024;
const modelOptions = [
    {
        key: 'efficientnet_b0',
        label: 'EfficientNet-B0 baseline',
        description: 'Current production detector',
    },
    {
        key: 'resnet50_mean',
        label: 'ResNet50 mean aggregation',
        description: 'New checkpoint, same preprocessing',
    },
] as const;
const defaultModelKey = 'efficientnet_b0' as const;
const modelThresholds: Record<ModelKey, number> = {
    efficientnet_b0: 0.38,
    resnet50_mean: 0.34,
};
const signaturePickerSlots = [
    {
        key: 'sig1_prepared_by',
        label: '1st Signatory - Left',
    },
    {
        key: 'sig2_checked_by',
        label: '2nd Signatory - Center',
    },
    {
        key: 'sig3_certified_by',
        label: '3rd Signatory - Right',
    },
] as const;
const analysisStages = [
    'Preprocessing document image',
    'Extracting document features',
    'Scoring anomaly patterns',
    'Preparing preprocessed image',
] as const;

type StepStatus = 'active' | 'complete' | 'inactive';

type TorAnalysisResult = {
    id: number;
    model_key: ModelKey;
    model_label: string;
    forgery_confidence: number;
    authenticity_score: number;
    verdict: string;
    detected_indicators: string[];
    preprocessed_image_url: string | null;
    model_result?: ModelResult | null;
    signature_verification: SignatureVerification | null;
};

type ModelResult = {
    label?: string | null;
    score?: number | null;
    model_threshold?: number | null;
    roi_scores?: Record<string, number> | null;
    top_roi?: string | null;
    ocr?: OcrResult | null;
    degree_extraction?: OcrResult | null;
};

type OcrResult = {
    degree?: string | null;
    title?: string | null;
    course?: string | null;
    program_match?: ProgramMatch | null;
    message?: string | null;
};

type ProgramMatch = {
    matched: boolean;
    normalized_degree: string;
    program: {
        id: number;
        campus: string;
        college: string;
        program_level: string;
        degree: string;
        specialization: string | null;
        display_name: string;
    } | null;
};

type SignatureVerification = {
    success: boolean;
    threshold: number;
    signatures: SignatureResult[];
    error: string;
};

type SignatureResult = {
    slot: string;
    label: string;
    best_match_id: string | null;
    best_match_name: string | null;
    distance: number | null;
    score?: number | null;
    verdict?: string | null;
    status?: string | null;
    reason?: string | null;
    message?: string | null;
    signature_detected?: boolean;
    is_match: boolean;
    model_inference_ran?: boolean;
    presence?: {
        passed: boolean;
        reason: string;
        ink_pixels: number;
        ink_ratio: number;
        max_component_area: number;
        signature_like_components: number;
    };
    ink_pixels: number;
    bbox_xywh: number[];
    band_crop_url?: string | null;
    ink_mask_url?: string | null;
    error?: string;
};

type Props = {
    latestAnalysis: TorAnalysisResult | null;
    signaturePersonnel: SignaturePersonnelBySlot;
};

type UploadForm = {
    tor_file: File | null;
    model_key: ModelKey;
    expected_signatures: ExpectedSignatures;
};

type ModelKey = (typeof modelOptions)[number]['key'];
type SignatureSlot = (typeof signaturePickerSlots)[number]['key'];
type ExpectedSignatures = Record<SignatureSlot, string>;
type SignaturePersonnelOption = {
    id: string;
    name: string;
};
type SignaturePersonnelBySlot = Record<SignatureSlot, SignaturePersonnelOption[]>;

interface StepIndicatorProps {
    number: number;
    label: string;
    status: StepStatus;
}

function StepIndicator({ number, label, status }: StepIndicatorProps) {
    const isActive = status === 'active';
    const isComplete = status === 'complete';

    return (
        <div
            className={`flex shrink-0 items-center justify-center gap-1 rounded-full py-1 pr-2 pl-1 ${
                isActive ? 'bg-[#6f0000]' : ''
            }`}
        >
            <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${
                    isComplete
                        ? 'bg-[#20966b]'
                        : isActive
                          ? 'bg-[#9a0000]'
                          : 'bg-[#a7a7a7]'
                }`}
            >
                {number}
            </span>
            <span
                className={`text-[8px] ${
                    isComplete
                        ? 'font-normal text-[#20966b]'
                        : isActive
                          ? 'font-bold text-white'
                          : 'font-normal text-[#a7a7a7]'
                }`}
            >
                {label}
            </span>
        </div>
    );
}

interface UploadAreaProps {
    isDragOver: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function UploadArea({
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    onChange,
}: UploadAreaProps) {
    return (
        <label
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed px-5 py-8 transition-colors ${
                isDragOver
                    ? 'border-[#9a0000] bg-[#fff6f6]'
                    : 'border-[#d3d3d3] bg-[#f9f9f9]'
            }`}
        >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5eaea]">
                <Upload className="h-5 w-5 text-[#c4a4a4]" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-xs font-bold text-[#393939]">
                    Click to upload or drag and drop
                </p>
                <p className="text-[10px] text-[#7b7b7b]">
                    Upload a clear, complete scan of the TOR
                </p>
                <div className="flex gap-1 text-[10px] text-[#919191]">
                    <span>JPG</span>
                    <span>&middot;</span>
                    <span>PNG</span>
                    <span>&middot;</span>
                    <span>Max 10 MB</span>
                </div>
            </div>
            <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={onChange}
                className="hidden"
            />
        </label>
    );
}

function SignaturePicker({
    personnel,
    value,
    onChange,
}: {
    personnel: SignaturePersonnelBySlot;
    value: ExpectedSignatures;
    onChange: (slot: SignatureSlot, signerId: string) => void;
}) {
    return (
        <div className="flex w-full flex-col overflow-hidden rounded-lg border border-[#fddada]">
            <div className="flex flex-col gap-1.5 bg-[#ffeaea] p-4">
                <h3 className="text-[10px] font-bold text-[#9a0000]">
                    Identify Signatories
                </h3>
                <p className="text-[8px] text-[#656565]">
                    Select the signatories in the footer from left to right
                </p>
            </div>
            <div className="flex flex-col gap-4 border-t border-[#fddada] bg-[#fff9f9] p-4">
                {signaturePickerSlots.map((slot) => (
                    <label
                        key={slot.key}
                        className="flex flex-col gap-1.5 text-[10px] font-bold text-[#1e1a1a]"
                    >
                        <span>{slot.label}</span>
                        <select
                            value={value[slot.key]}
                            onChange={(event) =>
                                onChange(slot.key, event.currentTarget.value)
                            }
                            className="h-10 w-full rounded-md border border-[#cdc9c9] bg-white px-3 text-[10px] font-normal text-[#635858] uppercase transition outline-none focus:border-[#9a0000] focus:ring-2 focus:ring-[#ffeaea]"
                        >
                            {(personnel[slot.key] ?? []).map((person) => (
                                <option key={person.id} value={person.id}>
                                    {person.name}
                                </option>
                            ))}
                        </select>
                    </label>
                ))}
            </div>
        </div>
    );
}

function ModelPicker({
    value,
    onChange,
}: {
    value: ModelKey;
    onChange: (modelKey: ModelKey) => void;
}) {
    return (
        <div className="flex w-full flex-col overflow-hidden rounded-lg border border-[#e2ddd8]">
            <div className="flex flex-col gap-1.5 bg-[#fbfaf9] p-4">
                <h3 className="text-[10px] font-bold text-[#393939]">
                    Detection Model
                </h3>
                <p className="text-[8px] text-[#7b7b7b]">
                    Choose which trained detector will score this TOR.
                </p>
            </div>
            <div className="grid gap-3 border-t border-[#e2ddd8] bg-white p-4 sm:grid-cols-2">
                {modelOptions.map((model) => {
                    const isSelected = value === model.key;

                    return (
                        <label
                            key={model.key}
                            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                                isSelected
                                    ? 'border-[#9a0000] bg-[#fff6f6]'
                                    : 'border-[#d3d3d3] bg-white hover:border-[#c4a4a4]'
                            }`}
                        >
                            <input
                                type="radio"
                                name="model_key"
                                value={model.key}
                                checked={isSelected}
                                onChange={() => onChange(model.key)}
                                className="mt-0.5 h-3 w-3 accent-[#9a0000]"
                            />
                            <span className="flex min-w-0 flex-col gap-1">
                                <span className="text-[10px] font-bold text-[#393939]">
                                    {model.label}
                                </span>
                                <span className="text-[8px] text-[#7b7b7b]">
                                    {model.description}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

function SectionBox({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-lg border border-[#e2ddd8] bg-white">
            <div className="flex flex-col gap-2 border-b border-[#e2ddd8] p-5">
                <h2 className="text-[10px] font-bold text-[#393939]">
                    {title}
                </h2>
                <p className="text-[8px] text-[#919191]">{description}</p>
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

function ConfidenceBar({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    const width = `${Math.max(0, Math.min(100, value))}%`;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#4f4f4f]">{label}</span>
                <span className="font-mono font-bold" style={{ color }}>
                    {value.toFixed(1)}%
                </span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-full bg-[#d3d3d3]">
                <div
                    className="h-full rounded-full"
                    style={{ width, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function ResultsPanel({ result }: { result: TorAnalysisResult }) {
    const ocrResult =
        result.model_result?.degree_extraction ?? result.model_result?.ocr;
    const isAuthentic = result.verdict === 'Likely Authentic';

    return (
        <div className="flex flex-col gap-3">
            <SectionBox
                title="Verdict & Confidence"
                description="View results of deep learning model authentication."
            >
                <div className="flex flex-col items-center gap-4">
                    {result.preprocessed_image_url ? (
                        <img
                            src={result.preprocessed_image_url}
                            alt="Analyzed TOR document"
                            className="max-h-[32rem] w-full max-w-[278px] rounded-sm object-contain"
                        />
                    ) : (
                        <div className="flex h-72 w-full max-w-[278px] items-center justify-center rounded-md border border-dashed border-[#d3d3d3] bg-[#f9f9f9] text-center text-[10px] text-[#919191]">
                            Processed TOR preview will appear here when the
                            model pipeline returns one.
                        </div>
                    )}

                    <div
                        className={`flex w-full items-center gap-4 rounded-lg border p-5 ${
                            isAuthentic
                                ? 'border-[#84d5ac] bg-[#eaf5ee]'
                                : 'border-[#ffc5c5] bg-[#fff4f4]'
                        }`}
                    >
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                                isAuthentic
                                    ? 'border-[#84d5ac] bg-[#eaf5ee] text-[#0b7b4a]'
                                    : 'border-[#ffc5c5] text-[#9a0000]'
                            }`}
                        >
                            {isAuthentic ? (
                                <Smile className="h-6 w-6" strokeWidth={1.8} />
                            ) : (
                                <Frown className="h-6 w-6" />
                            )}
                        </div>
                        <div className="flex min-w-0 flex-col justify-center gap-2.5">
                            <h3
                                className={`text-sm leading-none font-bold ${
                                    isAuthentic
                                        ? 'text-[#0b7b4a]'
                                        : 'text-[#9a0000]'
                                }`}
                            >
                                {result.verdict}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 font-mono text-[7px] leading-none text-[#656565]">
                                <span>High-confidence detection</span>
                                <span>&middot;</span>
                                <span>Human review recommended</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full items-center gap-3 rounded-lg border border-[#e2ddd8] bg-[#fbfaf9] p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f5eaea] text-[#9a0000]">
                            <Cpu className="h-4 w-4" />
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <span className="text-[8px] font-bold text-[#897b7b] uppercase">
                                Detection model
                            </span>
                            <span className="truncate text-[10px] font-bold text-[#393939]">
                                {result.model_label}
                            </span>
                        </div>
                    </div>

                    <ConfidenceBar
                        label="Forgery confidence"
                        value={result.forgery_confidence}
                        color="#9a0000"
                    />
                    <ConfidenceBar
                        label="Authenticity score"
                        value={result.authenticity_score}
                        color="#1b622f"
                    />
                </div>
            </SectionBox>

            <SectionBox
                title="Score Breakdown"
                description="Patch-based classification per document region"
            >
                <ScoreBreakdown result={result} />
            </SectionBox>

            <SectionBox
                title="Signature Integrity Check"
                description="Footer signatures analyzed individually."
            >
                <SignatureVerificationPanel
                    verification={result.signature_verification}
                />
            </SectionBox>

            <SectionBox
                title="OCR - Degree Extraction"
                description="Text extracted from the header region of the TOR"
            >
                <OcrDegreePanel ocr={ocrResult} />
            </SectionBox>
        </div>
    );
}

function ScoreBreakdown({ result }: { result: TorAnalysisResult }) {
    const roiScores = result.model_result?.roi_scores ?? {};
    const threshold = clampScore(
        result.model_result?.model_threshold ??
            modelThresholds[result.model_key] ??
            modelThresholds[defaultModelKey],
    );
    const thresholdLineTop = `${Math.max(0, Math.min(100, (1 - threshold) * 100))}px`;
    const rows = ['header', 'body', 'footer'].map((region) => {
        const score = clampScore(roiScores[region] ?? 0);
        const isForged = score >= threshold;
        const excess = Math.max(0, score - threshold);

        return {
            region,
            score,
            isForged,
            excess,
        };
    });

    const barStyles: Record<
        string,
        { bg: string; border: string; text: string }
    > = {
        header: { bg: '#eaedff', border: '#6377eb', text: '#576ad6' },
        body: { bg: '#e8ffcc', border: '#78d750', text: '#58983c' },
        footer: { bg: '#ffeaea', border: '#d34040', text: '#d34040' },
    };

    return (
        <div className="flex flex-col gap-7">
            <div className="relative flex w-full items-end">
                <div className="flex items-center gap-1.5">
                    <div className="flex h-[106px] flex-col justify-between text-center font-mono text-[8px] text-[#4d4d4d]">
                        {['1.0', '0.8', '0.6', '0.4', '0.2', '0.0'].map(
                            (tick) => (
                                <span key={tick}>{tick}</span>
                            ),
                        )}
                    </div>
                    <div className="h-[100px] w-px bg-[#808080]" />
                </div>

                <div className="relative flex min-w-0 flex-1 flex-col">
                    <div className="flex h-[106px] items-end justify-between px-6">
                        {rows.map((row) => {
                            const style = barStyles[row.region];

                            return (
                                <div
                                    key={row.region}
                                    className="flex flex-col items-center gap-0.5"
                                >
                                    <span className="font-mono text-[8px] text-[#4d4d4d]">
                                        {row.score.toFixed(2)}
                                    </span>
                                    <div
                                        className="w-[52px] rounded-t border"
                                        style={{
                                            height: `${Math.max(4, row.score * 90)}px`,
                                            backgroundColor: style.bg,
                                            borderColor: style.border,
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-px w-full bg-[#808080]" />
                    <div className="mt-2 flex justify-between px-7 text-[6px] text-[#4f4f4f]">
                        <span>HEADER</span>
                        <span>BODY</span>
                        <span>FOOTER</span>
                    </div>
                    <div
                        className="absolute h-px w-full border-t border-dashed border-[#9a0000]"
                        style={{ top: thresholdLineTop }}
                    />
                    <span className="absolute top-3 right-0 font-mono text-[6px] text-black">
                        threshold: {threshold.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="overflow-hidden rounded border border-[#d3d3d3] text-[8px]">
                <div className="grid grid-cols-[52px_78px_minmax(0,1fr)] bg-[#e9e9e9] text-[6px] font-bold text-[#897b7b]">
                    <div className="px-2 py-1">REGION</div>
                    <div className="px-2 py-1">VERDICT</div>
                    <div className="px-2 py-1">FLAG</div>
                </div>
                {rows.map((row) => (
                    <div
                        key={row.region}
                        className="grid min-h-8 grid-cols-[52px_78px_minmax(0,1fr)] items-center border-t border-[#d3d3d3] bg-white"
                    >
                        <div className="px-2 py-1">
                            <RegionBadge region={row.region} />
                        </div>
                        <div className="px-2 py-1">
                            <VerdictBadge isForged={row.isForged} />
                        </div>
                        <div className="px-2 py-1 text-[#897b7b]">
                            {row.isForged
                                ? `Suspicious activities found in region. Exceeds threshold by ${row.excess.toFixed(3)}.`
                                : 'No suspicious region activity above threshold.'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RegionBadge({ region }: { region: string }) {
    const styles: Record<string, string> = {
        header: 'border-[#d2d8fd] bg-[#edeffe] text-[#576ad6]',
        body: 'border-[#c5fdad] bg-[#e5ffd9] text-[#58983c]',
        footer: 'border-[#fcc] bg-[#fdeaea] text-[#d34040]',
    };

    return (
        <span
            className={`inline-flex rounded-full border px-1 py-0.5 text-[8px] font-bold capitalize ${styles[region]}`}
        >
            {region}
        </span>
    );
}

function VerdictBadge({ isForged }: { isForged: boolean }) {
    return (
        <span
            className={`inline-flex rounded-full border px-1 py-0.5 text-[8px] font-bold ${
                isForged
                    ? 'border-[#fdb1b1] bg-[#f5eaea] text-[#9a0000]'
                    : 'border-[#c5fdad] bg-[#e5ffd9] text-[#58983c]'
            }`}
        >
            {isForged ? 'Likely Forged' : 'Likely Genuine'}
        </span>
    );
}

function SignatureVerificationPanel({
    verification,
}: {
    verification: SignatureVerification | null;
}) {
    if (!verification) {
        return (
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-[#d3d3d3] bg-[#f9f9f9] text-[10px] text-[#919191]">
                Signature verification will appear here when the model pipeline
                returns it.
            </div>
        );
    }

    if (!verification.success) {
        return (
            <div className="flex gap-2 rounded-md border border-[#ffc5c5] bg-[#fff6f6] p-4 text-[10px] text-[#9a0000]">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                    {verification.error ||
                        'Signature verification could not be completed.'}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {verification.signatures.map((signature, index) => (
                <SignatureResultCard
                    key={signature.slot}
                    signature={signature}
                    index={index}
                />
            ))}
        </div>
    );
}

function SignatureResultCard({
    signature,
    index,
}: {
    signature: SignatureResult;
    index: number;
}) {
    const score = signature.score ?? null;
    const signatureImageUrl = signature.ink_mask_url ?? signature.band_crop_url;
    const isGenuine = signature.is_match || signature.verdict === 'GENUINE';
    const needsReview = signature.verdict === 'NEEDS MANUAL REVIEW';
    const isInvalid =
        signature.verdict === 'INVALID' || signature.status === 'INVALID';
    const scoreLabel = score === null ? 'N/A' : score.toFixed(4);
    const verdictLabel = isGenuine
        ? 'Likely Genuine'
        : isInvalid
          ? 'Invalid'
          : needsReview
            ? 'Manual Review'
            : 'Suspicious';
    const cardClass = isGenuine
        ? 'border-[#a2ffaf] bg-[#f0fff4]'
        : isInvalid
          ? 'border-[#d3d3d3] bg-[#f9f9f9]'
          : needsReview
            ? 'border-[#f0d478] bg-[#fffbea]'
            : 'border-[#fdb1b1] bg-[#faf6f6]';
    const verdictClass = isGenuine
        ? 'bg-[#c7face] text-[#1b622f]'
        : isInvalid
          ? 'bg-[#e9e9e9] text-[#656565]'
          : needsReview
            ? 'bg-[#f8e7a1] text-[#7b5b00]'
            : 'bg-[#edd] text-[#9a0000]';
    const scoreClass = isGenuine
        ? 'text-[#1b622f]'
        : isInvalid
          ? 'text-[#656565]'
          : needsReview
            ? 'text-[#7b5b00]'
            : 'text-[#9a0000]';

    return (
        <div
            className={`flex flex-col items-center gap-3 rounded-lg border px-5 py-6 ${cardClass}`}
        >
            <div className="flex h-32 w-full max-w-[226px] items-center justify-center overflow-hidden rounded bg-black">
                {signatureImageUrl ? (
                    <img
                        src={signatureImageUrl}
                        alt={`${signature.label} extracted signature`}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <span className="text-[8px] text-[#b0b0b0]">
                        No signature image
                    </span>
                )}
            </div>

            <div className="flex w-full flex-col gap-2">
                <h3 className="text-[10px] font-bold text-[#897b7b]">
                    Extracted Signature {index + 1}
                </h3>
                <div className="flex items-center justify-between gap-3">
                    <span
                        className={`font-mono text-base font-bold ${scoreClass}`}
                    >
                        {scoreLabel}
                    </span>
                    <span className={`px-1 text-base ${verdictClass}`}>
                        {verdictLabel}
                    </span>
                </div>
                <p className="text-[8px] text-[#897b7b]">
                    {signature.best_match_name ?? 'No reference match'}
                    {signature.distance !== null
                        ? ` · distance ${signature.distance.toFixed(4)}`
                        : ''}
                </p>
                {(signature.message || signature.error) && (
                    <p className="text-[8px] text-[#9a0000]">
                        {signature.message ?? signature.error}
                    </p>
                )}
            </div>
        </div>
    );
}

function OcrDegreePanel({ ocr }: { ocr?: OcrResult | null }) {
    const degree = ocr?.degree ?? ocr?.title ?? ocr?.course ?? 'Unavailable';
    const hasMatch = ocr?.program_match?.matched === true;
    const wasChecked = ocr?.program_match !== null && ocr?.program_match !== undefined;
    const message =
        hasMatch && ocr?.program_match?.program
            ? `Matches ${ocr.program_match.program.display_name}.`
            : (ocr?.message ?? 'Does not match any USeP Program List.');

    return (
        <div className="flex flex-col gap-3 rounded border border-[#cdc9c9] bg-[#f5f5f5] p-3">
            <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-bold text-[#897b7b]">
                    DEGREE/TITLE/COURSE
                </span>
                <span className="font-mono text-xs font-bold text-[#1e1a1a]">
                    {degree}
                </span>
            </div>
            <div
                className={`flex h-[22px] items-center rounded-full border px-3 text-[8px] font-bold ${
                    hasMatch
                        ? 'border-[#c5fdad] bg-[#e5ffd9] text-[#58983c]'
                        : wasChecked
                          ? 'border-[#fdb1b1] bg-[#f5eaea] text-[#9a0000]'
                          : 'border-[#d3d3d3] bg-white text-[#656565]'
                }`}
            >
                {message}
            </div>
        </div>
    );
}

function clampScore(value: number) {
    return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

export default function UploadTor({ latestAnalysis, signaturePersonnel }: Props) {
    const defaultExpectedSignatures = signaturePickerSlots.reduce(
        (defaults, slot) => ({
            ...defaults,
            [slot.key]: signaturePersonnel[slot.key]?.[0]?.id ?? '',
        }),
        {} as ExpectedSignatures,
    );
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [clientError, setClientError] = useState<string | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(
        latestAnalysis ? 3 : 1,
    );
    const [analysisStageIndex, setAnalysisStageIndex] = useState(0);
    const stageTimers = useRef<number[]>([]);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<UploadForm>({
            tor_file: null,
            model_key: defaultModelKey,
            expected_signatures: { ...defaultExpectedSignatures },
        });

    const clearStageTimers = () => {
        stageTimers.current.forEach((timer) => window.clearTimeout(timer));
        stageTimers.current = [];
    };

    useEffect(
        () => () => {
            stageTimers.current.forEach((timer) => window.clearTimeout(timer));
            stageTimers.current = [];
        },
        [],
    );

    useEffect(() => {
        if (!cameraStream) {
            return;
        }

        const video = videoRef.current;

        if (video) {
            video.srcObject = cameraStream;
        }

        return () => {
            cameraStream.getTracks().forEach((track) => track.stop());

            if (video) {
                video.srcObject = null;
            }
        };
    }, [cameraStream]);

    const validateFile = (file: File): string | null => {
        if (!allowedMimeTypes.includes(file.type)) {
            return 'Upload a JPG or PNG image.';
        }

        if (file.size > maxFileSize) {
            return 'Upload an image smaller than 10 MB.';
        }

        return null;
    };

    const stopCamera = () => {
        setCameraStream(null);
    };

    const acceptFile = (file: File) => {
        const validationError = validateFile(file);

        if (validationError) {
            setSelectedFile(null);
            setData('tor_file', null);
            setClientError(validationError);

            return;
        }

        setSelectedFile(file);
        setData('tor_file', file);
        setClientError(null);
        setCameraError(null);
        stopCamera();
        clearErrors('tor_file');
        setCurrentStep(1);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files.item(0);

        if (file) {
            acceptFile(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.item(0);

        if (file) {
            acceptFile(file);
        }
    };

    const handleStartCamera = async () => {
        setCameraError(null);

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Camera capture is not supported in this browser.');

            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: { ideal: 'environment' },
                },
            });

            setCameraStream(stream);
        } catch {
            setCameraError(
                'Camera access was blocked. Allow camera permission and try again.',
            );
        }
    };

    const handleCapturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
            setCameraError('Camera is still starting. Try again in a moment.');

            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');

        if (!context) {
            setCameraError('Could not capture the camera image.');

            return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setCameraError('Could not save the captured image.');

                    return;
                }

                acceptFile(
                    new File([blob], `tor-camera-${Date.now()}.jpg`, {
                        type: 'image/jpeg',
                    }),
                );
            },
            'image/jpeg',
            0.92,
        );
    };

    const startStageProgress = () => {
        clearStageTimers();
        setAnalysisStageIndex(0);

        analysisStages.slice(1).forEach((_, index) => {
            const timer = window.setTimeout(
                () => {
                    setAnalysisStageIndex(index + 1);
                },
                (index + 1) * 700,
            );

            stageTimers.current.push(timer);
        });
    };

    const handleRunAnalysis = () => {
        if (!data.tor_file) {
            setClientError('Upload a TOR image before running analysis.');

            return;
        }

        post(analyze.url(), {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => {
                setCurrentStep(2);
                startStageProgress();
            },
            onSuccess: () => {
                clearStageTimers();
                setCurrentStep(3);
                setSelectedFile(null);
                reset('tor_file');
            },
            onError: () => {
                clearStageTimers();
                setCurrentStep(1);
            },
        });
    };

    const handleExpectedSignatureChange = (
        slot: SignatureSlot,
        signerId: string,
    ) => {
        setData('expected_signatures', {
            ...data.expected_signatures,
            [slot]: signerId,
        });
        clearErrors(`expected_signatures.${slot}`);
    };

    const handleModelChange = (modelKey: ModelKey) => {
        setData('model_key', modelKey);
        clearErrors('model_key');
    };

    const handleReset = () => {
        clearStageTimers();
        setCurrentStep(1);
        setSelectedFile(null);
        setClientError(null);
        setCameraError(null);
        stopCamera();
        setData({
            tor_file: null,
            model_key: defaultModelKey,
            expected_signatures: { ...defaultExpectedSignatures },
        });
    };

    return (
        <>
            <Head title="Upload Transcript of Records" />
            <div className="flex flex-1 flex-col gap-3 overflow-x-auto bg-[#f4f1ee] p-5">
                <div className="flex items-center justify-center gap-4 rounded-full border border-[#e2ddd8] bg-white px-2 py-1.5">
                    <StepIndicator
                        number={1}
                        label="Upload TOR"
                        status={
                            currentStep === 1
                                ? 'active'
                                : currentStep > 1
                                  ? 'complete'
                                  : 'inactive'
                        }
                    />
                    <div className="h-px flex-1 bg-[#20966b]" />
                    <StepIndicator
                        number={2}
                        label="Analyzing"
                        status={
                            currentStep === 2
                                ? 'active'
                                : currentStep > 2
                                  ? 'complete'
                                  : 'inactive'
                        }
                    />
                    <div
                        className={`h-px flex-1 ${
                            currentStep === 3 ? 'bg-[#20966b]' : 'bg-[#d3d3d3]'
                        }`}
                    />
                    <StepIndicator
                        number={3}
                        label="Results"
                        status={currentStep === 3 ? 'active' : 'inactive'}
                    />
                </div>

                {currentStep !== 3 && (
                    <section className="flex flex-col gap-4 rounded-lg border border-[#e2ddd8] bg-white p-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-base font-bold text-[#393939]">
                                Upload Transcript of Records
                            </h1>
                            <p className="text-xs text-[#919191]">
                                Upload the TOR image for deep learning forgery
                                analysis. The uploaded file is discarded after
                                processing.
                            </p>
                        </div>

                        {!selectedFile ? (
                            <div className="flex flex-col gap-3">
                                <UploadArea
                                    isDragOver={isDragOver}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onChange={handleFileChange}
                                />

                                <div className="flex flex-col gap-3 rounded-lg border border-[#e2ddd8] bg-[#fbfaf9] p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5eaea] text-[#9a0000]">
                                                <Camera className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xs font-bold text-[#393939]">
                                                    Take a photo
                                                </h3>
                                                <p className="text-[10px] text-[#7b7b7b]">
                                                    Use the device camera to
                                                    capture the TOR directly.
                                                </p>
                                            </div>
                                        </div>

                                        {cameraStream ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={stopCamera}
                                                className="gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                Stop camera
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleStartCamera}
                                                className="gap-2"
                                            >
                                                <Camera className="h-4 w-4" />
                                                Enable camera
                                            </Button>
                                        )}
                                    </div>

                                    {cameraStream && (
                                        <div className="flex flex-col gap-3">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                muted
                                                playsInline
                                                className="max-h-[28rem] w-full rounded-md border border-[#d3d3d3] bg-black object-contain"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleCapturePhoto}
                                                className="gap-2 bg-[#6f0000] text-white hover:bg-[#5a0000]"
                                            >
                                                <Camera className="h-4 w-4" />
                                                Capture photo
                                            </Button>
                                        </div>
                                    )}

                                    {cameraError && (
                                        <p className="text-xs text-[#9a0000]">
                                            {cameraError}
                                        </p>
                                    )}

                                    <canvas
                                        ref={canvasRef}
                                        className="hidden"
                                        aria-hidden="true"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-[#d3d3d3] bg-[#f9f9f9] p-4">
                                <div className="flex items-center gap-2">
                                    <FileImage className="h-4 w-4 text-[#919191]" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-[#393939]">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-[10px] text-[#919191]">
                                            {(
                                                selectedFile.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{' '}
                                            MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ModelPicker
                            value={data.model_key}
                            onChange={handleModelChange}
                        />

                        <SignaturePicker
                            personnel={signaturePersonnel}
                            value={data.expected_signatures}
                            onChange={handleExpectedSignatureChange}
                        />

                        {clientError && (
                            <p className="text-xs text-[#9a0000]">
                                {clientError}
                            </p>
                        )}
                        <InputError message={errors.tor_file} />
                        <InputError message={errors.model_key} />
                        <InputError
                            message={
                                errors['expected_signatures.sig1_prepared_by']
                            }
                        />
                        <InputError
                            message={
                                errors['expected_signatures.sig2_checked_by']
                            }
                        />
                        <InputError
                            message={
                                errors['expected_signatures.sig3_certified_by']
                            }
                        />

                        {currentStep === 2 && (
                            <div className="rounded-lg border border-[#e2ddd8] bg-[#f9f9f9] p-4">
                                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#393939]">
                                    <CheckCircle2 className="h-4 w-4 text-[#20966b]" />
                                    <span>
                                        {analysisStages[analysisStageIndex]}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-[#d3d3d3]">
                                    <div
                                        className="h-full rounded-full bg-[#20966b] transition-all"
                                        style={{
                                            width: `${
                                                ((analysisStageIndex + 1) /
                                                    analysisStages.length) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleRunAnalysis}
                            disabled={processing || !selectedFile}
                            className="flex gap-2 bg-[#6f0000] px-4 py-2 text-white hover:bg-[#5a0000]"
                        >
                            {processing ? (
                                <>
                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4" />
                                    <span>Run Forgery Analysis</span>
                                </>
                            )}
                        </Button>

                        <div className="rounded-lg border border-[#d3d3d3] bg-[#f9f9f9] p-4">
                            <h3 className="mb-3 text-xs font-bold text-[#656565]">
                                For best results
                            </h3>
                            <ul className="space-y-2 text-[10px] text-[#656565]">
                                <li className="flex gap-2">
                                    <span className="mt-0.5 shrink-0">
                                        &middot;
                                    </span>
                                    <span>
                                        Ensure all four edges of the TOR are
                                        visible
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="mt-0.5 shrink-0">
                                        &middot;
                                    </span>
                                    <span>
                                        Minimize shadows on the document
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="mt-0.5 shrink-0">
                                        &middot;
                                    </span>
                                    <span>
                                        Upload the original TOR, not a photocopy
                                        of a photocopy
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </section>
                )}

                {currentStep === 3 && latestAnalysis && (
                    <>
                        <ResultsPanel result={latestAnalysis} />
                        <SectionBox
                            title="Actions"
                            description="Start a new analysis when another TOR needs review."
                        >
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                className="gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Analyze another TOR
                            </Button>
                        </SectionBox>
                    </>
                )}
            </div>
        </>
    );
}

UploadTor.layout = {
    breadcrumbs: [
        {
            title: 'Upload Transcript of Records',
            href: uploadTor(),
        },
    ],
};
