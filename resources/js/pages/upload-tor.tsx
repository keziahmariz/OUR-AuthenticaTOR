import { Head, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    FileImage,
    Frown,
    RotateCcw,
    Search,
    Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { analyze } from '@/actions/App/Http/Controllers/UploadTorController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { uploadTor } from '@/routes';

const allowedMimeTypes = ['image/jpeg', 'image/png'];
const maxFileSize = 10 * 1024 * 1024;
const analysisStages = [
    'Preprocessing document image',
    'Extracting document features',
    'Scoring anomaly patterns',
    'Preparing preprocessed image',
] as const;

type StepStatus = 'active' | 'complete' | 'inactive';

type TorAnalysisResult = {
    id: number;
    forgery_confidence: number;
    authenticity_score: number;
    verdict: string;
    detected_indicators: string[];
    preprocessed_image_url: string | null;
};

type Props = {
    latestAnalysis: TorAnalysisResult | null;
};

type UploadForm = {
    tor_file: File | null;
};

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
    return (
        <div className="flex flex-col gap-3">
            <SectionBox
                title="Verdict & Confidence"
                description="View the persisted result of deep learning model authentication."
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 rounded-lg border border-[#ffc5c5] bg-[#f5eaea] p-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#ffc5c5] text-[#9a0000]">
                            <Frown className="h-6 w-6" />
                        </div>
                        <div className="flex min-w-0 flex-col gap-2">
                            <h3 className="text-sm font-bold text-[#9a0000]">
                                {result.verdict}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-[7px] text-[#656565]">
                                <span>High-confidence detection</span>
                                <span>&middot;</span>
                                <span>Human review recommended</span>
                            </div>
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
                        color="#0b7b4a"
                    />
                </div>
            </SectionBox>

            <SectionBox
                title="Detected Indicators"
                description="Indicators of forgery detected by the deep learning model."
            >
                <ul className="space-y-2 text-[10px] text-[#656565]">
                    {result.detected_indicators.map((indicator) => (
                        <li key={indicator} className="flex gap-2">
                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-[#9a0000]" />
                            <span>{indicator}</span>
                        </li>
                    ))}
                </ul>
            </SectionBox>

            <SectionBox
                title="Preprocessed Image"
                description="Standardized TOR image generated by the preprocessing pipeline before model inference."
            >
                {result.preprocessed_image_url ? (
                    <img
                        src={result.preprocessed_image_url}
                        alt="Preprocessed TOR document"
                        className="max-h-[32rem] w-full rounded-md border border-[#e2ddd8] object-contain"
                    />
                ) : (
                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-[#d3d3d3] bg-[#f9f9f9] text-[10px] text-[#919191]">
                        Preprocessed image will appear here when the model
                        pipeline returns one.
                    </div>
                )}
            </SectionBox>
        </div>
    );
}

export default function UploadTor({ latestAnalysis }: Props) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [clientError, setClientError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(
        latestAnalysis ? 3 : 1,
    );
    const [analysisStageIndex, setAnalysisStageIndex] = useState(0);
    const stageTimers = useRef<number[]>([]);

    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm<UploadForm>({
            tor_file: null,
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

    const validateFile = (file: File): string | null => {
        if (!allowedMimeTypes.includes(file.type)) {
            return 'Upload a JPG or PNG image.';
        }

        if (file.size > maxFileSize) {
            return 'Upload an image smaller than 10 MB.';
        }

        return null;
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

    const handleReset = () => {
        clearStageTimers();
        setCurrentStep(1);
        setSelectedFile(null);
        setClientError(null);
        setData('tor_file', null);
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
                            <UploadArea
                                isDragOver={isDragOver}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onChange={handleFileChange}
                            />
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

                        {clientError && (
                            <p className="text-xs text-[#9a0000]">
                                {clientError}
                            </p>
                        )}
                        <InputError message={errors.tor_file} />

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
