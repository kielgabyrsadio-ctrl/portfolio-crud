
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FolderOpen, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

export default function CreateProject() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        tech_stack: '',
        project_url: '',
        repository_url: '',
        image: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (!(data.image instanceof File)) {
            setImagePreview(null);
            return;
        }

        const previewUrl = URL.createObjectURL(data.image);
        setImagePreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [data.image]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/projects', { forceFormData: true });
    };

    return (
        <>
            <Head title="Add Project" />

            <main className="min-h-screen bg-[#090a0f] px-6 py-12 text-white sm:px-10">
                <div className="mx-auto max-w-3xl">

                    <Link
                        href="/projects"
                        className="mb-8 inline-flex items-center gap-2 text-sm text-violet-300 transition hover:text-violet-200"
                    >
                        <ArrowLeft size={18} />
                        Back to Projects
                    </Link>

                    <div className="mb-8">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                            Portfolio Administration
                        </p>

                        <h1 className="text-3xl font-bold sm:text-4xl">
                            Add New Project
                        </h1>

                        <p className="mt-2 text-gray-400">
                            Enter the details of your new portfolio project.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6 rounded-2xl border border-[#282b39] bg-[#12141d] p-6 sm:p-8"
                    >
                        {/* Project Title */}
                        <div>
                            <label htmlFor="title" className="mb-2 block text-sm font-medium">
                                Project Title *
                            </label>

                            <input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                placeholder="Example: Task Tarot App"
                                className="w-full rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                            />

                            {errors.title && (
                                <p className="mt-2 text-sm text-red-400">{errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="mb-2 block text-sm font-medium">
                                Project Description *
                            </label>

                            <textarea
                                id="description"
                                rows={5}
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                placeholder="Describe what your project does..."
                                className="w-full resize-y rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                            />

                            {errors.description && (
                                <p className="mt-2 text-sm text-red-400">{errors.description}</p>
                            )}
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <label htmlFor="tech_stack" className="mb-2 block text-sm font-medium">
                                Tools / Technologies Used *
                            </label>

                            <input
                                id="tech_stack"
                                type="text"
                                value={data.tech_stack}
                                onChange={(event) => setData('tech_stack', event.target.value)}
                                placeholder="Example: Flutter, Dart"
                                className="w-full rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                            />

                            {errors.tech_stack && (
                                <p className="mt-2 text-sm text-red-400">{errors.tech_stack}</p>
                            )}
                        </div>

                        {/* Project URL */}
                        <div>
                            <label htmlFor="project_url" className="mb-2 block text-sm font-medium">
                                Live Project URL
                            </label>

                            <input
                                id="project_url"
                                type="url"
                                value={data.project_url}
                                onChange={(event) => setData('project_url', event.target.value)}
                                placeholder="https://example.com"
                                className="w-full rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                            />

                            {errors.project_url && (
                                <p className="mt-2 text-sm text-red-400">{errors.project_url}</p>
                            )}
                        </div>

                        {/* Repository URL */}
                        <div>
                            <label htmlFor="repository_url" className="mb-2 block text-sm font-medium">
                                GitHub Repository URL
                            </label>

                            <input
                                id="repository_url"
                                type="url"
                                value={data.repository_url}
                                onChange={(event) => setData('repository_url', event.target.value)}
                                placeholder="https://github.com/username/project"
                                className="w-full rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                            />

                            {errors.repository_url && (
                                <p className="mt-2 text-sm text-red-400">{errors.repository_url}</p>
                            )}
                        </div>

                        {/* Project image */}
                        <div>
                            <label htmlFor="image" className="mb-2 block text-sm font-medium">
                                Project Image
                            </label>

                            <input
                                id="image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) => setData('image', event.target.files?.[0] ?? null)}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => document.getElementById('image')?.click()}
                                className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-3 font-semibold text-violet-300 transition hover:bg-violet-500/20"
                            >
                                <FolderOpen size={19} />
                                Choose Image
                            </button>

                            <p className="mt-2 text-sm text-gray-400">
                                {data.image instanceof File
                                    ? `Selected: ${data.image.name}`
                                    : 'No new image selected.'}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Supported formats: JPG, PNG, WEBP. Maximum size: 2 MB.
                            </p>

                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Selected project image preview"
                                    className="mt-4 h-40 w-full rounded-xl object-cover sm:w-64"
                                />
                            )}

                            {errors.image && (
                                <p className="mt-2 text-sm text-red-400">{errors.image}</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col-reverse gap-3 border-t border-[#282b39] pt-6 sm:flex-row sm:justify-end">
                            <Link
                                href="/projects"
                                className="rounded-xl border border-[#282b39] px-5 py-3 text-center font-medium text-gray-300 transition hover:bg-white/5"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save size={18} />
                                {processing ? 'Saving...' : 'Save Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
