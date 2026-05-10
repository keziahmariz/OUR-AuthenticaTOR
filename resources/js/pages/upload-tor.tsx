import { Head, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Camera,
    CheckCircle2,
    FileImage,
    Frown,
    RotateCcw,
    Search,
    X,
    Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { analyze } from '@/actions/App/Http/Controllers/UploadTorController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
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
    signature_verification: SignatureVerification | null;
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
    is_match: boolean;
    ink_pixels: number;
    bbox_xywh: number[];
    band_crop_url?: string | null;
    ink_mask_url?: string | null;
    error?: string;
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
                title="Signature Verification"
                description="Best-match checks for the three TOR signature positions."
            >
                <SignatureVerificationPanel
                    verification={result.signature_verification}
                />
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
        <div className="flex flex-col gap-3">
            {verification.signatures.map((signature) => (
                <SignatureResultRow
                    key={signature.slot}
                    signature={signature}
                    threshold={verification.threshold}
                />
            ))}
        </div>
    );
}

function SignatureResultRow({
    signature,
    threshold,
}: {
    signature: SignatureResult;
    threshold: number;
}) {
    const distanceLabel =
        signature.distance === null
            ? 'Unavailable'
            : signature.distance.toFixed(4);
    const scoreLabel =
        signature.score === undefined || signature.score === null
            ? 'Unavailable'
            : `${(signature.score * 100).toFixed(1)}%`;

    return (
        <div className="grid gap-3 rounded-lg border border-[#e2ddd8] bg-[#fbfaf9] p-4 md:grid-cols-[minmax(0,1fr)_9rem]">
            <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold text-[#393939]">
                        {signature.label}
                    </h3>
                    <Badge
                        variant={signature.is_match ? 'secondary' : 'outline'}
                        className={
                            signature.is_match
                                ? 'border-transparent bg-[#e7f7ef] text-[#0b7b4a]'
                                : 'border-[#ffc5c5] bg-white text-[#9a0000]'
                        }
                    >
                        {signature.is_match ? 'Matched' : 'Review'}
                    </Badge>
                </div>

                <div className="grid gap-2 text-[10px] text-[#656565] sm:grid-cols-2">
                    <div>
                        <span className="block text-[#919191]">Best match</span>
                        <span className="font-medium text-[#393939]">
                            {signature.best_match_name ?? 'No reference match'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[#919191]">
                            Distance / Threshold
                        </span>
                        <span className="font-mono font-medium text-[#393939]">
                            {distanceLabel} / {threshold.toFixed(4)}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[#919191]">
                            Similarity score
                        </span>
                        <span className="font-mono font-medium text-[#393939]">
                            {scoreLabel}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[#919191]">
                            Extracted ink
                        </span>
                        <span className="font-mono font-medium text-[#393939]">
                            {signature.ink_pixels.toLocaleString()} px
                        </span>
                    </div>
                    <div>
                        <span className="block text-[#919191]">ROI</span>
                        <span className="font-mono font-medium text-[#393939]">
                            {signature.bbox_xywh.join(', ')}
                        </span>
                    </div>
                </div>

                {signature.error && (
                    <p className="text-[10px] text-[#9a0000]">
                        {signature.error}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                <SignaturePreview
                    label="Band"
                    imageUrl={signature.band_crop_url}
                />
                <SignaturePreview
                    label="Ink"
                    imageUrl={signature.ink_mask_url}
                />
            </div>
        </div>
    );
}

function SignaturePreview({
    label,
    imageUrl,
}: {
    label: string;
    imageUrl?: string | null;
}) {
    return (
        <div className="flex h-16 flex-col overflow-hidden rounded-md border border-[#e2ddd8] bg-white">
            <div className="border-b border-[#e2ddd8] px-2 py-1 text-[8px] font-bold text-[#7b7b7b]">
                {label}
            </div>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={`${label} signature preview`}
                    className="min-h-0 flex-1 object-contain"
                />
            ) : (
                <div className="flex flex-1 items-center justify-center text-[8px] text-[#b0b0b0]">
                    No image
                </div>
            )}
        </div>
    );
}

export default function UploadTor({ latestAnalysis }: Props) {
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

    const handleReset = () => {
        clearStageTimers();
        setCurrentStep(1);
        setSelectedFile(null);
        setClientError(null);
        setCameraError(null);
        stopCamera();
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
