import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import StaffPortalLayout from '@/layouts/auth/staff-portal-layout';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({ status }: Props) {
    return (
        <StaffPortalLayout>
            <Head title="Staff Portal" />

            <div className="w-full max-w-sm rounded-2xl border border-[#d8d0c9] bg-white p-8 text-[#393939] shadow-lg transition-colors dark:border-[#4a3f3f] dark:bg-[#211b1b] dark:text-[#f7f1ed]">
                {/* Icon */}
                <div className="mb-7 flex justify-center">
                    <div className="flex h-12 w-full items-center justify-center rounded-full bg-white lg:h-32 dark:bg-[#211b1b]">
                        <img
                            src="/authenticator-icon.svg"
                            alt="Authenticator"
                            className="h-12 w-14 lg:h-24 lg:w-28"
                        />
                    </div>
                </div>

                {/* Header Text */}
                <div className="mb-7 text-center">
                    <h1 className="mb-1 text-xl leading-none font-bold text-[#393939] dark:text-[#f7f1ed]">
                        Staff Portal
                    </h1>
                    <p className="text-xs text-[#6f6f6f] dark:text-[#c9bebb]">
                        Authorized Registrar Personnel Only
                    </p>
                </div>

                {/* Warning Box */}
                <div className="mb-7 flex gap-3 rounded-lg bg-[#fff6e6] p-3 dark:bg-[#3a2a12]">
                    <img
                        src="/error-icon.svg"
                        alt="Warning"
                        className="h-4 w-4 shrink-0"
                    />
                    <p className="text-xs leading-relaxed text-[#6f4400] dark:text-[#ffd88a]">
                        This system is restricted to authorized USeP Registrar
                        staff. Unauthorized access is prohibited.
                    </p>
                </div>

                {/* Form */}
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Email Field */}
                            <div className="flex flex-col gap-1">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-medium text-[#4f4f4f] dark:text-[#e8ded8]"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="Enter email"
                                    className="rounded-md border border-[#e2ddd8] bg-white px-2 py-1.5 text-xs text-[#393939] placeholder-[#767676] dark:border-[#514646] dark:bg-[#171313] dark:text-[#f7f1ed] dark:placeholder-[#a99f9c]"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-1">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-medium text-[#4f4f4f] dark:text-[#e8ded8]"
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Enter password"
                                    className="rounded-md border border-[#e2ddd8] bg-white px-2 py-1.5 text-xs text-[#393939] placeholder-[#767676] dark:border-[#514646] dark:bg-[#171313] dark:text-[#f7f1ed] dark:placeholder-[#a99f9c]"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-1 flex items-center justify-center gap-1 rounded-md bg-[#6f0000] px-2 py-3 text-xs font-bold text-white transition-[color,box-shadow] outline-none hover:bg-[#5a0000] focus-visible:ring-2 focus-visible:ring-[#6f0000]/50 focus-visible:ring-offset-2 disabled:opacity-50"
                                tabIndex={3}
                                data-test="login-button"
                                aria-busy={processing}
                            >
                                {processing && <Spinner />}
                                <span className={processing ? 'sr-only' : ''}>
                                    {processing ? 'Signing in…' : 'Sign In'}
                                </span>
                                {!processing && (
                                    <img
                                        src="/login-icon.svg"
                                        alt=""
                                        className="h-4 w-4"
                                    />
                                )}
                            </button>

                            {/* Forgot Password Link */}
                            <div className="text-center text-xs text-[#6f6f6f] dark:text-[#c9bebb]">
                                Forgot Password?{' '}
                                <span className="text-[#6f0000] dark:text-[#ff9a9a]">
                                    Contact your administrator.
                                </span>
                            </div>

                            {status && (
                                <div className="rounded-md bg-green-50 p-3 text-center text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-200">
                                    {status}
                                </div>
                            )}
                        </>
                    )}
                </Form>
            </div>
        </StaffPortalLayout>
    );
}
