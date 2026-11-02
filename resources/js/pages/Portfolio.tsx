
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    ArrowDown,
    ArrowUp,
    Github,
    Mail,
    Menu,
    Moon,
    Sun,
    X,
    ExternalLink,
    Plus,
    Pencil,
    Trash2,
    Save,
    FolderOpen,
    XCircle,
} from 'lucide-react';
import { projectImageUrl } from '@/lib/project-image-url';

interface Project {
    id: number;
    title: string;
    description: string;
    tech_stack: string;
    project_url: string | null;
    repository_url: string | null;
    image: string | null;
}

interface WelcomeProps {
    [key: string]: unknown;
    projects: Project[];
    auth: {
        user: { id: number; name: string; email: string } | null;
    };
}

const skills = [
    'HTML',
    'CSS',
    'Tailwind CSS',
    'JavaScript',
    'PHP',
    'Flutter',
    'Dart',
    'Blender',
    'SketchUp',
    'MySQL',
];

const phrases = [
    'Web Development',
    'Mobile App Design',
    'UI/UX Solutions',
    'Database Systems',
    '3D Design',
];

const emptyProject = {
    title: '',
    description: '',
    tech_stack: '',
    project_url: '',
    repository_url: '',
    image: null as File | null,
    _method: 'post' as 'post' | 'put',
};

export default function Welcome({ projects }: WelcomeProps) {
    const { auth } = usePage<WelcomeProps>().props;
    const isAdmin = Boolean(auth?.user);

    const [menuOpen, setMenuOpen] = useState(false);
    const [lightMode, setLightMode] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [contactStatus, setContactStatus] = useState('');

    const [showProjectForm, setShowProjectForm] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
    const [projectStatus, setProjectStatus] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm(emptyProject);

    useEffect(() => {
        if (!(data.image instanceof File)) {
            setImagePreview(null);
            return;
        }

        const previewUrl = URL.createObjectURL(data.image);
        setImagePreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [data.image]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('portfolio-theme');
        const isLight = savedTheme === 'light';

        setLightMode(isLight);
        document.documentElement.classList.toggle('light-mode', isLight);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('light-mode', lightMode);
        localStorage.setItem('portfolio-theme', lightMode ? 'light' : 'dark');
    }, [lightMode]);

    useEffect(() => {
        let phraseIndex = 0;
        let characterIndex = 0;
        let deleting = false;
        let pauseTimer: number | undefined;

        const timer = window.setInterval(() => {
            const currentPhrase = phrases[phraseIndex];

            if (!deleting) {
                characterIndex++;
                setTypedText(currentPhrase.substring(0, characterIndex));

                if (characterIndex === currentPhrase.length) {
                    deleting = true;
                    pauseTimer = window.setTimeout(() => {}, 900);
                }
            } else {
                characterIndex--;
                setTypedText(currentPhrase.substring(0, characterIndex));

                if (characterIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                }
            }
        }, 110);

        return () => {
            window.clearInterval(timer);
            if (pauseTimer) window.clearTimeout(pauseTimer);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMenu = () => setMenuOpen(false);

    const imagePath = projectImageUrl;
    const existingProjectImage = projects.find(
        (project) => project.id === editingProjectId,
    )?.image;
    const displayedImage =
        imagePreview ??
        (editingProjectId === null
            ? null
            : imagePath(existingProjectImage ?? null));

    const openCreateForm = () => {
        reset();
        clearErrors();
        setEditingProjectId(null);
        setProjectStatus('');
        setShowProjectForm(true);
    };

    const openEditForm = (project: Project) => {
        clearErrors();
        setData({
            title: project.title,
            description: project.description,
            tech_stack: project.tech_stack,
            project_url: project.project_url ?? '',
            repository_url: project.repository_url ?? '',
            image: null,
            _method: 'put',
        });

        setEditingProjectId(project.id);
        setProjectStatus('');
        setShowProjectForm(true);

        document.getElementById('project-management')?.scrollIntoView({
            behavior: 'smooth',
        });
    };

    const closeProjectForm = () => {
        reset();
        clearErrors();
        setEditingProjectId(null);
        setShowProjectForm(false);
    };

    const submitProject = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(
            editingProjectId !== null
                ? `/projects/${editingProjectId}`
                : '/projects',
            {
                forceFormData: true,
                onSuccess: () => {
                    closeProjectForm();
                    setProjectStatus(
                        editingProjectId !== null
                            ? 'Project updated successfully!'
                            : 'Project created successfully!',
                    );
                },
            },
        );
    };
    const deleteProject = (project: Project) => {
        if (
            window.confirm(
                `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
            )
        ) {
            router.delete(`/projects/${project.id}`, {
                onSuccess: () => {
                    setProjectStatus('Project deleted successfully!');
                },
            });
        }
    };

    const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (
            !contactName.trim() ||
            !contactEmail.trim() ||
            !contactMessage.trim()
        ) {
            setContactStatus('Please complete all fields.');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(contactEmail)) {
            setContactStatus('Please enter a valid email address.');
            return;
        }

        const subject = encodeURIComponent(
            `Portfolio inquiry from ${contactName}`,
        );
        const body = encodeURIComponent(
            `Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMessage}`,
        );

        window.location.href = `mailto:sadiokielgabrille@gmail.com?subject=${subject}&body=${body}`;

        setContactStatus('Your email application should open with your message.');
    };

    return (
        <>
            <Head title="Kiel Sadio | IT Student Portfolio" />

            <div className="portfolio min-h-screen bg-[#090a0f] text-white transition-colors duration-300">
                {/* Navigation */}
                <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#090a0f]/85 backdrop-blur-xl">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                        <a
                            href="#home"
                            className="text-xl font-bold tracking-wider"
                            onClick={closeMenu}
                        >
                            KIEL<span className="text-violet-400">.</span>
                        </a>

                        <div className="hidden items-center gap-8 md:flex">
                            <a className="nav-link" href="#home">HOME</a>
                            <a className="nav-link" href="#about">ABOUT</a>
                            <a className="nav-link" href="#skills">SKILLS</a>
                            <a className="nav-link" href="#projects">PROJECTS</a>
                            <a className="nav-link" href="#education">EDUCATION</a>
                            <a className="nav-link" href="#contact">CONTACT</a>
                        </div>

                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <a
                                    href="#project-management"
                                    className="hidden rounded-full border border-violet-400/40 px-4 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/10 sm:inline-flex"
                                >
                                    MANAGE
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={() => setLightMode(!lightMode)}
                                className="rounded-full border border-white/15 p-2.5 transition hover:border-violet-400 hover:text-violet-300"
                                aria-label="Toggle theme"
                            >
                                {lightMode ? <Moon size={19} /> : <Sun size={19} />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="rounded-lg border border-white/15 p-2 md:hidden"
                                aria-label="Toggle navigation"
                            >
                                {menuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </nav>

                    {menuOpen && (
                        <div className="border-t border-white/10 bg-[#12141d] px-6 py-5 md:hidden">
                            {[
                                ['HOME', '#home'],
                                ['ABOUT', '#about'],
                                ['SKILLS', '#skills'],
                                ['PROJECTS', '#projects'],
                                ['EDUCATION', '#education'],
                                ['CONTACT', '#contact'],
                                ...(isAdmin ? [['MANAGE PROJECTS', '#project-management']] : []),
                            ].map(([label, href]) => (
                                <a
                                    key={label}
                                    href={href}
                                    onClick={closeMenu}
                                    className="block py-3 text-sm tracking-widest text-gray-300 transition hover:text-violet-400"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    )}
                </header>

                <main>
                    {/* Hero */}
                    <section
                        id="home"
                        className="relative flex min-h-screen items-center overflow-hidden px-6 pb-16 pt-28"
                    >
                        <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
                        <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />

                        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 md:grid-cols-2">
                            <div>
                                <p className="mb-5 text-sm font-semibold tracking-[0.35em] text-violet-400">
                                    WELCOME TO MY PORTFOLIO
                                </p>

                                <h1 className="text-5xl leading-tight font-bold md:text-7xl">
                                    Hi, I'm
                                    <br />
                                    <span className="text-violet-400">
                                        KIEL SADIO.
                                    </span>
                                </h1>

                                <h2 className="mt-6 text-xl font-medium text-gray-300 md:text-2xl">
                                    BSIT Student |{' '}
                                    <span className="text-violet-300">
                                        {typedText}
                                        <span className="animate-pulse">|</span>
                                    </span>
                                </h2>

                                <p className="mt-6 max-w-xl leading-8 text-gray-400">
                                    I'm an IT student interested in web and app
                                    development. I enjoy exploring technology,
                                    building creative projects, and continuously
                                    improving my skills.
                                </p>

                                <div className="mt-9 flex flex-wrap gap-4">
                                    <a
                                        href="#projects"
                                        className="rounded-full bg-violet-600 px-7 py-3.5 font-semibold transition hover:-translate-y-1 hover:bg-violet-500"
                                    >
                                        Explore My Work
                                    </a>

                                    <a
                                        href="#contact"
                                        className="rounded-full border border-violet-400/50 px-7 py-3.5 font-semibold transition hover:-translate-y-1 hover:bg-violet-500/10"
                                    >
                                        Contact Me
                                    </a>
                                </div>

                                <div className="mt-9 flex gap-5">
                                    <a
                                        href="https://github.com/Kielsadio"
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="GitHub"
                                        className="text-gray-400 transition hover:text-violet-400"
                                    >
                                        <Github size={25} />
                                    </a>
                                    <a
                                        href="mailto:sadiokielgabrille@gmail.com"
                                        aria-label="Email"
                                        className="text-gray-400 transition hover:text-violet-400"
                                    >
                                        <Mail size={25} />
                                    </a>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="absolute -inset-5 rounded-full bg-violet-600/20 blur-3xl" />
                                    <div className="relative h-72 w-72 overflow-hidden rounded-full border-4 border-violet-500/50 shadow-[0_0_60px_rgba(139,92,246,0.25)] md:h-96 md:w-96">
                                        <img
                                            src="/images/Profileee.png"
                                            alt="Kiel Sadio"
                                            className="h-full w-full object-cover object-center"
                                            style={{ objectPosition: 'center 25%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <a
                            href="#about"
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-violet-300 transition hover:translate-y-1"
                            aria-label="Scroll to About"
                        >
                            <ArrowDown size={25} />
                        </a>
                    </section>

                    {/* About */}
                    <section id="about" className="section-padding scroll-mt-28">
                        <div className="mx-auto max-w-5xl">
                            <SectionHeading number="01" title="ABOUT ME" />

                            <div className="rounded-3xl border border-white/10 bg-[#12141d] p-8 md:p-12">
                                <p className="text-lg leading-9 text-gray-300">
                                    Hello! I'm <span className="font-semibold text-violet-300">Kiel Gabrille E. Sadio</span>,
                                    a Bachelor of Science in Information
                                    Technology student at Urdaneta City
                                    University. I'm interested in web and
                                    application development, databases, and
                                    3D design.
                                </p>

                                <p className="mt-5 leading-8 text-gray-400">
                                    As a student, I'm continuously learning and
                                    improving my technical skills through
                                    academic activities and personal projects.
                                    I enjoy turning ideas into useful and
                                    creative digital experiences.
                                </p>

                                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                                    <InfoItem label="NAME" value="Kiel Gabrille E. Sadio" />
                                    <InfoItem label="COURSE" value="BS Information Technology" />
                                    <InfoItem label="UNIVERSITY" value="Urdaneta City University" />
                                    <InfoItem label="INTEREST" value="Web and App Development" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Skills */}
                    <section id="skills" className="section-padding scroll-mt-28">
                        <div className="mx-auto max-w-5xl">
                            <SectionHeading number="02" title="MY SKILLS" />

                            <p className="mb-8 max-w-2xl leading-8 text-gray-400">
                                These are some of the technologies and tools
                                I've explored and used throughout my learning
                                journey.
                            </p>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                                {skills.map((skill) => (
                                    <div
                                        key={skill}
                                        className="rounded-2xl border border-white/10 bg-[#12141d] p-5 text-center font-semibold text-gray-300 transition hover:-translate-y-1 hover:border-violet-500/60 hover:text-violet-300"
                                    >
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Projects */}
                    <section id="projects" className="section-padding scroll-mt-28">
                        <div className="mx-auto max-w-6xl">
                            <SectionHeading number="03" title="MY PROJECTS" />

                            <p className="mb-10 max-w-2xl leading-8 text-gray-400">
                                Here are some of the projects I've worked on
                                while learning and exploring different areas
                                of information technology.
                            </p>

                            {projects.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-[#12141d] p-8 text-center text-gray-400">
                                    No projects have been added yet.
                                </div>
                            ) : (
                                <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                                    {projects.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            imagePath={imagePath}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Admin Project Management */}
                    {isAdmin && (
                        <section
                            id="project-management"
                            className="section-padding scroll-mt-28"
                        >
                            <div className="mx-auto max-w-6xl">
                                <SectionHeading number="ADMIN" title="MANAGE PROJECTS" />

                                <div className="mb-8 flex flex-col justify-between gap-5 rounded-3xl border border-violet-500/30 bg-[#12141d] p-6 sm:flex-row sm:items-center sm:p-8">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <FolderOpen className="text-violet-400" size={26} />
                                            <h3 className="text-xl font-bold">Project Administration</h3>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-400">
                                            Signed in as {auth.user?.name}. Add, edit, or remove your portfolio projects.
                                        </p>
                                        <p className="mt-3 text-sm font-semibold text-violet-300">
                                            Total projects: {projects.length}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={openCreateForm}
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
                                    >
                                        <Plus size={19} />
                                        Add New Project
                                    </button>
                                </div>

                                {projectStatus && (
                                    <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm text-green-300">
                                        {projectStatus}
                                    </div>
                                )}

                                {/* Create / Edit Form */}
                                {showProjectForm && (
                                    <div className="mb-10 rounded-3xl border border-violet-500/30 bg-[#12141d] p-6 sm:p-8">
                                        <div className="mb-7 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold tracking-[0.25em] text-violet-400">
                                                    PROJECT ADMINISTRATION
                                                </p>
                                                <h3 className="mt-2 text-2xl font-bold">
                                                    {editingProjectId !== null ? 'Edit Project' : 'Add New Project'}
                                                </h3>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={closeProjectForm}
                                                className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:border-red-400 hover:text-red-400"
                                                aria-label="Close project form"
                                            >
                                                <X size={21} />
                                            </button>
                                        </div>

                                        <form onSubmit={submitProject} className="space-y-6">
                                            <div>
                                                <label htmlFor="project-title" className="mb-2 block text-sm font-medium">
                                                    Project Title *
                                                </label>
                                                <input
                                                    id="project-title"
                                                    type="text"
                                                    value={data.title}
                                                    onChange={(event) => setData('title', event.target.value)}
                                                    placeholder="Example: Task Tarot App"
                                                    className="w-full rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                                                />
                                                {errors.title && <p className="mt-2 text-sm text-red-400">{errors.title}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="project-description" className="mb-2 block text-sm font-medium">
                                                    Project Description *
                                                </label>
                                                <textarea
                                                    id="project-description"
                                                    rows={5}
                                                    value={data.description}
                                                    onChange={(event) => setData('description', event.target.value)}
                                                    placeholder="Describe what your project does..."
                                                    className="w-full resize-y rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                                                />
                                                {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="project-tech-stack" className="mb-2 block text-sm font-medium">
                                                    Tools / Technologies Used *
                                                </label>
                                                <input
                                                    id="project-tech-stack"
                                                    type="text"
                                                    value={data.tech_stack}
                                                    onChange={(event) => setData('tech_stack', event.target.value)}
                                                    placeholder="Example: Flutter, Dart"
                                                    className="w-full rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                                                />
                                                {errors.tech_stack && <p className="mt-2 text-sm text-red-400">{errors.tech_stack}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="project-url" className="mb-2 block text-sm font-medium">
                                                    Live Project URL
                                                </label>
                                                <input
                                                    id="project-url"
                                                    type="text"
                                                    value={data.project_url}
                                                    onChange={(event) => setData('project_url', event.target.value)}
                                                    placeholder="https://example.com"
                                                    className="w-full rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                                                />
                                                {errors.project_url && <p className="mt-2 text-sm text-red-400">{errors.project_url}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="project-repository" className="mb-2 block text-sm font-medium">
                                                    GitHub Repository URL
                                                </label>
                                                <input
                                                    id="project-repository"
                                                    type="text"
                                                    value={data.repository_url}
                                                    onChange={(event) => setData('repository_url', event.target.value)}
                                                    placeholder="https://github.com/username/project"
                                                    className="w-full rounded-xl border border-[#282b39] bg-[#090a0f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
                                                />
                                                {errors.repository_url && <p className="mt-2 text-sm text-red-400">{errors.repository_url}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="project-image" className="mb-2 block text-sm font-medium">
                                                    Project Image
                                                </label>
                                                <input
                                                    id="project-image"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(event) => {
                                                        setData('image', event.target.files?.[0] ?? null);
                                                    }}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('project-image')?.click()}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-3 font-semibold text-violet-300 transition hover:bg-violet-500/20"
                                                >
                                                    <FolderOpen size={19} />
                                                    Choose Image
                                                </button>
                                                <p className="mt-2 text-sm text-gray-400">
                                                    {data.image instanceof File
                                                        ? `Selected: ${data.image.name}`
                                                        : editingProjectId !== null
                                                            ? 'No new image selected. The current image will be kept.'
                                                            : 'No new image selected.'}
                                                </p>
                                                {displayedImage && (
                                                    <img
                                                        src={displayedImage}
                                                        alt="Project image preview"
                                                        className="mt-4 h-40 w-full rounded-xl object-cover sm:w-64"
                                                    />
                                                )}
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Supported formats: JPG, PNG, WEBP. Maximum size: 2 MB.
                                                </p>
                                                {errors.image && <p className="mt-2 text-sm text-red-400">{errors.image}</p>}
                                            </div>

                                            <div className="flex flex-col-reverse gap-3 border-t border-[#282b39] pt-6 sm:flex-row sm:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={closeProjectForm}
                                                    className="rounded-xl border border-[#282b39] px-5 py-3 font-medium text-gray-300 transition hover:bg-white/5"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Save size={18} />
                                                    {processing
                                                        ? 'Saving...'
                                                        : editingProjectId !== null
                                                            ? 'Update Project'
                                                            : 'Save Project'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Admin Project List */}
                                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                    {projects.map((project) => (
                                        <article
                                            key={project.id}
                                            className="flex flex-col rounded-2xl border border-white/10 bg-[#12141d] p-5"
                                        >
                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold tracking-widest text-violet-400">
                                                        PROJECT #{project.id}
                                                    </p>
                                                    <h4 className="mt-2 break-words text-lg font-bold">
                                                        {project.title}
                                                    </h4>
                                                </div>
                                                <FolderOpen className="shrink-0 text-violet-400" size={22} />
                                            </div>

                                            <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-400">
                                                {project.description}
                                            </p>

                                            <p className="mb-5 text-xs text-violet-300">
                                                {project.tech_stack}
                                            </p>

                                            <div className="mt-auto flex gap-3 border-t border-white/10 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditForm(project)}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-500/40 px-3 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
                                                >
                                                    <Pencil size={16} />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteProject(project)}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {projects.length === 0 && (
                                    <div className="rounded-2xl border border-white/10 bg-[#12141d] p-8 text-center text-gray-400">
                                        No projects yet. Click Add New Project to create your first one.
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    <section id="education" className="section-padding scroll-mt-28">
                        <div className="mx-auto max-w-5xl">
                            <SectionHeading number="04" title="EDUCATION" />

                            <div className="rounded-3xl border border-white/10 bg-[#12141d] p-8 md:p-10">
                                <span className="text-sm font-semibold tracking-widest text-violet-400">
                                    CURRENTLY STUDYING
                                </span>
                                <h3 className="mt-4 text-2xl font-bold">
                                    Bachelor of Science in Information Technology
                                </h3>
                                <p className="mt-3 text-lg text-violet-300">
                                    Urdaneta City University
                                </p>
                                <p className="mt-4 leading-8 text-gray-400">
                                    Developing knowledge and practical skills
                                    in programming, web development, databases,
                                    and other areas of information technology.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="section-padding scroll-mt-28">
                        <div className="mx-auto max-w-5xl">
                            <SectionHeading number="05" title="GET IN TOUCH" />

                            <div className="grid gap-10 md:grid-cols-2">
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        Let's connect.
                                    </h3>
                                    <p className="mt-5 leading-8 text-gray-400">
                                        Have a question, project idea, or
                                        opportunity? Feel free to reach out
                                        through my email or GitHub.
                                    </p>

                                    <a
                                        href="mailto:sadiokielgabrille@gmail.com"
                                        className="mt-8 flex items-center gap-4 text-gray-300 transition hover:text-violet-300"
                                    >
                                        <Mail className="text-violet-400" />
                                        sadiokielgabrille@gmail.com
                                    </a>

                                    <a
                                        href="https://github.com/Kielsadio"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-5 flex items-center gap-4 text-gray-300 transition hover:text-violet-300"
                                    >
                                        <Github className="text-violet-400" />
                                        github.com/Kielsadio
                                    </a>
                                </div>

                                <form
                                    onSubmit={handleContactSubmit}
                                    className="space-y-5 rounded-3xl border border-white/10 bg-[#12141d] p-7"
                                >
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={contactName}
                                        onChange={(event) => setContactName(event.target.value)}
                                        className="contact-input"
                                        required
                                    />

                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        value={contactEmail}
                                        onChange={(event) => setContactEmail(event.target.value)}
                                        className="contact-input"
                                        required
                                    />

                                    <textarea
                                        placeholder="Your message"
                                        rows={5}
                                        value={contactMessage}
                                        onChange={(event) => setContactMessage(event.target.value)}
                                        className="contact-input resize-none"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="w-full rounded-full bg-violet-600 px-6 py-3.5 font-semibold transition hover:bg-violet-500"
                                    >
                                        Send Message
                                    </button>

                                    {contactStatus && (
                                        <p className="text-sm text-violet-300">
                                            {contactStatus}
                                        </p>
                                    )}
                                </form>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
                    <p>
                        © {new Date().getFullYear()} Kiel Gabrille E. Sadio.
                        All rights reserved.
                    </p>
                    <p className="mt-2">
                        Designed and developed with creativity and passion.
                    </p>
                </footer>

                {/* Back to top */}
                {showBackToTop && (
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed right-6 bottom-6 z-40 rounded-full bg-violet-600 p-3 shadow-lg transition hover:-translate-y-1 hover:bg-violet-500"
                        aria-label="Back to top"
                    >
                        <ArrowUp size={21} />
                    </button>
                )}
            </div>
        </>
    );
}

function SectionHeading({
    number,
    title,
}: {
    number: string;
    title: string;
}) {
    return (
        <div className="mb-10">
            <p className="mb-3 text-sm font-bold tracking-[0.3em] text-violet-400">
                {number} / PORTFOLIO
            </p>
            <h2 className="text-3xl font-bold tracking-wide md:text-4xl">
                {title}
            </h2>
            <div className="mt-5 h-1 w-16 rounded-full bg-violet-500" />
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-l-2 border-violet-500 pl-4">
            <p className="text-xs font-bold tracking-widest text-violet-400">
                {label}
            </p>
            <p className="mt-2 text-gray-300">{value}</p>
        </div>
    );
}

function ProjectCard({
    project,
    imagePath,
}: {
    project: Project;
    imagePath: (path: string | null) => string | null;
}) {
    const image = imagePath(project.image);

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#12141d] transition duration-300 hover:-translate-y-1 hover:border-violet-500/50">
            {image && (
                <div className="overflow-hidden">
                    <img
                        src={image}
                        alt={project.title}
                        className="h-56 w-full object-cover transition duration-500 hover:scale-105"
                    />
                </div>
            )}

            <div className="flex flex-1 flex-col p-7">
                <p className="text-xs font-bold tracking-[0.2em] text-violet-400">
                    PROJECT
                </p>

                <h3 className="mt-3 text-2xl font-bold">
                    {project.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-400">
                    {project.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                    {project.tech_stack.split(',').map((technology) => (
                        <span
                            key={technology.trim()}
                            className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300"
                        >
                            {technology.trim()}
                        </span>
                    ))}
                </div>

                {(project.project_url || project.repository_url) && (
                    <div className="mt-6 flex flex-wrap gap-5">
                        {project.project_url && (
                            <a
                                href={project.project_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200"
                            >
                                View Project <ExternalLink size={15} />
                            </a>
                        )}

                        {project.repository_url && (
                            <a
                                href={project.repository_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200"
                            >
                                Source Code <Github size={15} />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
