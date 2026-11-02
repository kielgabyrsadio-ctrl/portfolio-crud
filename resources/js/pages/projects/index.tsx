
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, ExternalLink, FolderOpen } from 'lucide-react';
import { projectImageUrl } from '@/lib/project-image-url';

interface Project {
    id: number;
    title: string;
    description: string;
    tech_stack: string;
    project_url: string | null;
    repository_url: string | null;
    image: string | null;
    created_at: string;
}

interface Props {
    projects: Project[];
}

export default function ProjectsIndex({ projects }: Props) {
    const deleteProject = (id: number, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            router.delete(`/projects/${id}`);
        }
    };

    return (
        <>
            <Head title="Manage Projects" />

            <main className="min-h-screen bg-[#090a0f] px-6 py-12 text-white sm:px-10">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                                Portfolio Administration
                            </p>

                            <h1 className="text-3xl font-bold sm:text-4xl">
                                Manage Projects
                            </h1>

                            <p className="mt-2 text-gray-400">
                                Add, update, and manage your portfolio projects.
                            </p>
                        </div>

                        <Link
                            href="/projects/create"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
                        >
                            <Plus size={20} />
                            Add New Project
                        </Link>
                    </div>

                    {/* Project count */}
                    <div className="mb-8 rounded-2xl border border-[#282b39] bg-[#12141d] p-5">
                        <div className="flex items-center gap-3">
                            <FolderOpen className="text-violet-400" size={25} />

                            <div>
                                <p className="text-sm text-gray-400">
                                    Total Projects
                                </p>

                                <p className="text-2xl font-bold">
                                    {projects.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Project cards */}
                    {projects.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project) => (
                                <article
                                    key={project.id}
                                    className="overflow-hidden rounded-2xl border border-[#282b39] bg-[#12141d] transition duration-300 hover:-translate-y-1 hover:border-violet-500/60"
                                >
                                    {/* Image */}
                                    <div className="h-48 overflow-hidden bg-[#1b1d29]">
                                        {project.image ? (
                                            <img
                                                src={projectImageUrl(project.image) ?? undefined}
                                                alt={project.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-500">
                                                <FolderOpen size={40} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="p-5">
                                        <h2 className="mb-3 text-xl font-bold">
                                            {project.title}
                                        </h2>

                                        <p className="mb-4 line-clamp-3 text-sm leading-6 text-gray-400">
                                            {project.description}
                                        </p>

                                        <div className="mb-5">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
                                                Tools Used
                                            </p>

                                            <p className="text-sm text-gray-300">
                                                {project.tech_stack}
                                            </p>
                                        </div>

                                        {/* Links */}
                                        <div className="mb-5 flex flex-wrap gap-3">
                                            {project.project_url && (
                                                <a
                                                    href={project.project_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200"
                                                >
                                                    Live Project
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}

                                            {project.repository_url && (
                                                <a
                                                    href={project.repository_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200"
                                                >
                                                    Repository
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 border-t border-[#282b39] pt-4">
                                            <Link
                                                href={`/projects/${project.id}/edit`}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600/15 px-3 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-600/30"
                                            >
                                                <Pencil size={16} />
                                                Edit
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => deleteProject(project.id, project.title)}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[#282b39] bg-[#12141d] px-6 py-16 text-center">
                            <FolderOpen className="mx-auto mb-4 text-violet-400" size={45} />

                            <h2 className="text-xl font-bold">
                                No Projects Yet
                            </h2>

                            <p className="mt-2 text-gray-400">
                                Start by adding your first portfolio project.
                            </p>

                            <Link
                                href="/projects/create"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
                            >
                                <Plus size={18} />
                                Add Your First Project
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
