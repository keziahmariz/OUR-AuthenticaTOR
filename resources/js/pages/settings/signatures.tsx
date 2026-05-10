import { Form, Head } from '@inertiajs/react';
import SignatureReferenceController from '@/actions/App/Http/Controllers/Settings/SignatureReferenceController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/signatures';

type SlotMap = Record<string, string>;

type SignatureReferenceImage = {
    id: number;
    slot: string;
    original_filename: string;
    sync_status: string;
    sync_error: string | null;
    synced_at: string | null;
};

type SignaturePersonnel = {
    id: number;
    slug: string;
    name: string;
    is_active: boolean;
    slots: string[];
    reference_images_count: number;
    latest_reference_images: SignatureReferenceImage[];
};

type Props = {
    personnel: SignaturePersonnel[];
    slots: SlotMap;
};

type FormErrors = Record<string, string>;

export default function Signatures({ personnel, slots }: Props) {
    const firstPerson = personnel[0];
    const firstSlot = firstPerson?.slots[0] ?? Object.keys(slots)[0] ?? '';

    return (
        <>
            <Head title="Signatures" />
            <div className="space-y-8">
                <Heading
                    variant="small"
                    title="Signature references"
                    description="Manage authorized signatories and upload model reference signatures"
                />

                <section className="space-y-4 rounded-lg border p-4">
                    <h2 className="text-base font-medium">Upload references</h2>
                    <Form
                        {...SignatureReferenceController.store.form()}
                        options={{ preserveScroll: true }}
                        encType="multipart/form-data"
                        className="grid gap-4 md:grid-cols-2"
                    >
                        {({ processing, errors }) => {
                            const formErrors = errors as FormErrors;

                            return (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="signature-personnel">
                                            Personnel
                                        </Label>
                                        <select
                                            id="signature-personnel"
                                            name="signature_personnel_id"
                                            defaultValue={firstPerson?.id}
                                            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                                        >
                                            {personnel.map((person) => (
                                                <option
                                                    key={person.id}
                                                    value={person.id}
                                                >
                                                    {person.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={
                                                formErrors[
                                                    'signature_personnel_id'
                                                ]
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="signature-slot">
                                            Slot
                                        </Label>
                                        <select
                                            id="signature-slot"
                                            name="slot"
                                            defaultValue={firstSlot}
                                            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                                        >
                                            {Object.entries(slots).map(
                                                ([slot, label]) => (
                                                    <option
                                                        key={slot}
                                                        value={slot}
                                                    >
                                                        {label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <InputError message={formErrors.slot} />
                                    </div>

                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="signature-images">
                                            Signature images
                                        </Label>
                                        <Input
                                            id="signature-images"
                                            type="file"
                                            name="images[]"
                                            accept="image/png,image/jpeg,image/webp,image/bmp"
                                            multiple
                                        />
                                        <InputError
                                            message={
                                                formErrors.images ??
                                                formErrors['images.0']
                                            }
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Button disabled={processing}>
                                            Upload and sync
                                        </Button>
                                    </div>
                                </>
                            );
                        }}
                    </Form>
                </section>

                <section className="space-y-4">
                    {personnel.map((person) => (
                        <div
                            key={person.id}
                            className="space-y-4 rounded-lg border p-4"
                        >
                            <Form
                                {...SignatureReferenceController.update.form(
                                    person.id,
                                )}
                                options={{ preserveScroll: true }}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => {
                                    const formErrors = errors as FormErrors;

                                    return (
                                        <>
                                            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor={`person-name-${person.id}`}
                                                    >
                                                        Name
                                                    </Label>
                                                    <Input
                                                        id={`person-name-${person.id}`}
                                                        name="name"
                                                        defaultValue={
                                                            person.name
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            formErrors.name
                                                        }
                                                    />
                                                </div>

                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="hidden"
                                                        name="is_active"
                                                        value="0"
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        name="is_active"
                                                        value="1"
                                                        defaultChecked={
                                                            person.is_active
                                                        }
                                                    />
                                                    Active
                                                </label>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Eligible slots</Label>
                                                <div className="grid gap-2 md:grid-cols-3">
                                                    {Object.entries(slots).map(
                                                        ([slot, label]) => (
                                                            <label
                                                                key={slot}
                                                                className="flex items-center gap-2 rounded-md border p-3 text-sm"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    name="slots[]"
                                                                    value={slot}
                                                                    defaultChecked={person.slots.includes(
                                                                        slot,
                                                                    )}
                                                                />
                                                                {label}
                                                            </label>
                                                        ),
                                                    )}
                                                </div>
                                                <InputError
                                                    message={
                                                        formErrors.slots ??
                                                        formErrors['slots.0']
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <p className="text-sm text-muted-foreground">
                                                    {person.reference_images_count}{' '}
                                                    reference image
                                                    {person.reference_images_count ===
                                                    1
                                                        ? ''
                                                        : 's'}
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    disabled={processing}
                                                >
                                                    Save personnel
                                                </Button>
                                            </div>
                                        </>
                                    );
                                }}
                            </Form>

                            {person.latest_reference_images.length > 0 && (
                                <div className="space-y-2 border-t pt-4">
                                    {person.latest_reference_images.map(
                                        (image) => (
                                            <div
                                                key={image.id}
                                                className="flex items-center justify-between gap-3 text-sm"
                                            >
                                                <span className="truncate">
                                                    {image.original_filename}
                                                </span>
                                                <span className="rounded-full border px-2 py-0.5 text-xs capitalize">
                                                    {image.sync_status}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            </div>
        </>
    );
}

Signatures.layout = {
    breadcrumbs: [
        {
            title: 'Signatures',
            href: edit(),
        },
    ],
};
