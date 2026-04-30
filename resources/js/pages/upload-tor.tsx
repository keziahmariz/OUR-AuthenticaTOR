import { Head, useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadTor } from '@/routes';

type StepStatus = 'active' | 'pending' | 'inactive';

interface StepIndicatorProps {
    number: number;
    label: string;
    status: StepStatus;
}

function StepIndicator({ number, label, status }: StepIndicatorProps) {
    const baseClasses =
        'flex gap-2 items-center px-3 py-2 rounded-full shrink-0';
    const statusClasses = {
        active: 'bg-[#6f0000]',
        pending: 'bg-transparent',
        inactive: 'bg-transparent',
    };
    const numberBgClasses = {
        active: 'bg-[#9a0000]',
        pending: 'bg-[#a7a7a7]',
        inactive: 'bg-[#a7a7a7]',
    };
    const textClasses = {
        active: 'text-white font-bold',
        pending: 'text-[#a7a7a7] font-regular',
        inactive: 'text-[#a7a7a7] font-regular',
    };

    return (
        <div className={`${baseClasses} ${statusClasses[status]}`}>
            <div
                className={`${numberBgClasses[status]} flex h-4 w-4 items-center justify-center rounded-full`}
            >
                <span className="text-[8px] font-bold text-white">
                    {number}
                </span>
            </div>
            <span className={`text-[8px] ${textClasses[status]}`}>{label}</span>
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
                    <span>•</span>
                    <span>PNG</span>
                    <span>•</span>
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

export default function UploadTor() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    const { post, processing } = useForm({
        tor_file: null as File | null,
    });

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

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            setFileName(file.name);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files && files.length > 0) {
            const file = files[0];
            setFileName(file.name);
        }
    };

    const handleRunAnalysis = () => {
        setCurrentStep(2);
        // Simulate analysis
        setTimeout(() => {
            setCurrentStep(3);
        }, 2000);
    };

    return (
        <>
            <Head title="Upload Transcript of Records" />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Step Indicator */}
                <div className="flex items-center gap-4 rounded-full border border-[#e2ddd8] bg-white p-4">
                    <StepIndicator
                        number={1}
                        label="Upload TOR"
                        status={
                            currentStep === 1
                                ? 'active'
                                : currentStep > 1
                                  ? 'pending'
                                  : 'inactive'
                        }
                    />
                    <div className="h-px flex-1 bg-[#e2ddd8]" />
                    <StepIndicator
                        number={2}
                        label="Analyzing"
                        status={
                            currentStep === 2
                                ? 'active'
                                : currentStep > 2
                                  ? 'pending'
                                  : 'inactive'
                        }
                    />
                    <div className="h-px flex-1 bg-[#e2ddd8]" />
                    <StepIndicator
                        number={3}
                        label="Results"
                        status={currentStep === 3 ? 'active' : 'inactive'}
                    />
                </div>

                {/* Main Content Card */}
                <div className="flex flex-col gap-4 rounded-xl border border-[#e2ddd8] bg-white p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-base font-bold text-[#393939]">
                            Upload Transcript of Records
                        </h1>
                        <p className="text-xs text-[#919191]">
                            Upload or capture the physical TOR presented by the
                            student. Only you will see the result.
                        </p>
                    </div>

                    {/* Upload Area or File Info */}
                    {!fileName ? (
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
                                <Upload className="h-4 w-4 text-[#919191]" />
                                <span className="text-xs font-medium text-[#393939]">
                                    {fileName}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Run Forgery Analysis Button */}
                    <Button
                        onClick={handleRunAnalysis}
                        disabled={processing || !fileName || currentStep > 1}
                        className="flex gap-2 bg-[#e9e9e9] px-4 py-2 text-[#919191] hover:bg-[#ddd]"
                    >
                        {currentStep === 2 ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <span>🔍</span>
                                <span>Run Forgery Analysis</span>
                            </>
                        )}
                    </Button>

                    {/* Best Practices Box */}
                    <div className="rounded-lg border border-[#d3d3d3] bg-[#f9f9f9] p-4">
                        <h3 className="mb-3 text-xs font-bold text-[#656565]">
                            For best results
                        </h3>
                        <ul className="space-y-2 text-[10px] text-[#656565]">
                            <li className="flex gap-2">
                                <span className="mt-0.5 shrink-0">•</span>
                                <span>
                                    Ensure all four edges of the TOR are visible
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-0.5 shrink-0">•</span>
                                <span>Minimize shadows on the document</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-0.5 shrink-0">•</span>
                                <span>
                                    Upload the original TOR, not a photocopy of
                                    a photocopy
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Results Section */}
                    {currentStep === 3 && (
                        <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                            <h3 className="text-sm font-bold text-green-900">
                                Analysis Complete
                            </h3>
                            <p className="mt-1 text-xs text-green-700">
                                Your transcript has been verified. No signs of
                                forgery detected.
                            </p>
                        </div>
                    )}
                </div>
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
