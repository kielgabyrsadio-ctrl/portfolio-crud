<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ProjectController extends Controller
{
    /**
     * Display all projects.
     */
    public function index(): Response
    {
        return Inertia::render('projects/index', [
            'projects' => Project::latest()->get(),
        ]);
    }

    /**
     * Show the form for creating a project.
     */
    public function create(): Response
    {
        return Inertia::render('projects/create');
    }

    /**
     * Save a new project.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:projects,title',
            'description' => 'required|string',
            'tech_stack' => 'required|string|max:255',
            'project_url' => 'nullable|url|max:2048',
            'repository_url' => 'nullable|url|max:2048',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $image = $request->file('image');

        if ($image instanceof UploadedFile) {
            $validated['image'] = $this->storeImage($image);
        }

        Project::create($validated);

        return redirect()->route('home')->with('success', 'Project created successfully!');
    }

    /**
     * Show the form for editing a project.
     */
    public function edit(Project $project): Response
    {
        return Inertia::render('projects/edit', [
            'project' => $project,
        ]);
    }

    /**
     * Update an existing project.
     */
    public function update(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:projects,title,'.$project->id,
            'description' => 'required|string',
            'tech_stack' => 'required|string|max:255',
            'project_url' => 'nullable|url|max:2048',
            'repository_url' => 'nullable|url|max:2048',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $previousImage = $project->image;
        $image = $request->file('image');

        if ($image instanceof UploadedFile) {
            $validated['image'] = $this->storeImage($image);
        } else {
            unset($validated['image']);
        }

        $project->update($validated);

        if (
            $image instanceof UploadedFile
            && $previousImage !== null
            && $this->isManagedImage($previousImage)
        ) {
            $this->deleteImage($previousImage);
        }

        return redirect()->route('home')->with('success', 'Project updated successfully!');
    }

    /**
     * Delete a project.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $image = $project->image;

        if ($image !== null && $this->isManagedImage($image)) {
            $this->deleteImage($image);
        }

        $project->delete();

        return redirect()->route('home')
            ->with('success', 'Project deleted successfully!');
    }

    private function storeImage(UploadedFile $image): string
    {
        $path = $image->store('projects', 'public');

        if ($path === false) {
            throw new RuntimeException('Unable to store the project image.');
        }

        return $path;
    }

    private function isManagedImage(?string $path): bool
    {
        return $path !== null && preg_match('#\Aprojects/[^/]+\z#', $path) === 1;
    }

    private function deleteImage(string $path): void
    {
        $disk = Storage::disk('public');

        if ($disk->exists($path) && ! $disk->delete($path)) {
            throw new RuntimeException('Unable to delete the project image.');
        }
    }
}
