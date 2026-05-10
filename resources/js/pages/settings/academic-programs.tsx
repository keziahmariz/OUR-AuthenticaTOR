import { Form, Head, router } from '@inertiajs/react';
import AcademicProgramController from '@/actions/App/Http/Controllers/Settings/AcademicProgramController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/academic-programs';

type AcademicProgram = {
    id: number;
    campus: string;
    college: string;
    program_level: string;
    degree: string;
    specialization: string | null;
    display_name: string;
    is_active: boolean;
};

type Props = {
    programs: AcademicProgram[];
    filters: {
        search: string;
    };
};

type FormErrors = Record<string, string>;

function ProgramFields({
    program,
    errors,
}: {
    program?: AcademicProgram;
    errors: FormErrors;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
                <Label>Campus</Label>
                <Input name="campus" defaultValue={program?.campus} />
                <InputError message={errors.campus} />
            </div>
            <div className="grid gap-2">
                <Label>College</Label>
                <Input name="college" defaultValue={program?.college} />
                <InputError message={errors.college} />
            </div>
            <div className="grid gap-2">
                <Label>Program level</Label>
                <Input
                    name="program_level"
                    defaultValue={program?.program_level}
                />
                <InputError message={errors.program_level} />
            </div>
            <div className="grid gap-2">
                <Label>Specialization/Major</Label>
                <Input
                    name="specialization"
                    defaultValue={program?.specialization ?? ''}
                />
                <InputError message={errors.specialization} />
            </div>
            <div className="grid gap-2 md:col-span-2">
                <Label>Degree</Label>
                <Input name="degree" defaultValue={program?.degree} />
                <InputError message={errors.degree} />
            </div>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="hidden" name="is_active" value="0" />
                <input
                    type="checkbox"
                    name="is_active"
                    value="1"
                    defaultChecked={program?.is_active ?? true}
                />
                Active
            </label>
        </div>
    );
}

export default function AcademicPrograms({ programs, filters }: Props) {
    return (
        <>
            <Head title="Academic programs" />
            <div className="space-y-8">
                <Heading
                    variant="small"
                    title="Academic programs"
                    description="Manage the USeP program list used to validate OCR degree extraction"
                />

                <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        router.get(
                            edit.url({
                                query: {
                                    search: String(
                                        formData.get('search') ?? '',
                                    ),
                                },
                            }),
                            {},
                            { preserveState: true, preserveScroll: true },
                        );
                    }}
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search programs"
                    />
                    <Button variant="outline">Search</Button>
                </form>

                <section className="space-y-4 rounded-lg border p-4">
                    <h2 className="text-base font-medium">Add program</h2>
                    <Form
                        {...AcademicProgramController.store.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <ProgramFields
                                    errors={errors as FormErrors}
                                />
                                <Button disabled={processing}>
                                    Create program
                                </Button>
                            </>
                        )}
                    </Form>
                </section>

                <section className="space-y-4">
                    {programs.map((program) => (
                        <div
                            key={program.id}
                            className="space-y-4 rounded-lg border p-4"
                        >
                            <div>
                                <h3 className="font-medium">
                                    {program.display_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {program.campus} · {program.college}
                                </p>
                            </div>
                            <Form
                                {...AcademicProgramController.update.form(
                                    program.id,
                                )}
                                options={{ preserveScroll: true }}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <ProgramFields
                                            program={program}
                                            errors={errors as FormErrors}
                                        />
                                        <Button
                                            variant="outline"
                                            disabled={processing}
                                        >
                                            Save program
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </div>
                    ))}
                </section>
            </div>
        </>
    );
}

AcademicPrograms.layout = {
    breadcrumbs: [
        {
            title: 'Academic programs',
            href: edit(),
        },
    ],
};
