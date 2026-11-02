<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Testing\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function projectImageUpload(string $filename = 'portfolio.jpg', int $padding = 0): File
{
    $imageContents = file_get_contents(public_path('images/3d-map.jpg'));

    if ($imageContents === false) {
        throw new RuntimeException('Unable to read the project image test fixture.');
    }

    return File::createWithContent(
        $filename,
        $imageContents.str_repeat(' ', $padding),
    );
}

test('stores an uploaded image and includes the new project on the portfolio', function () {
    Storage::fake('public');

    $response = $this->actingAs(User::factory()->create())
        ->post(route('projects.store'), [
            'title' => 'Uploaded Project',
            'description' => 'A project with an uploaded image.',
            'tech_stack' => 'Laravel, React',
            'image' => projectImageUpload(),
        ]);

    $response->assertRedirect(route('home'));

    $project = Project::where('title', 'Uploaded Project')->firstOrFail();

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'image' => $project->image,
    ]);
    Storage::disk('public')->assertExists($project->image);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portfolio')
            ->has('projects', 1, fn (Assert $page) => $page
                ->where('id', $project->id)
                ->where('image', $project->image)
                ->etc()
            )
        );
});

test('includes projects without images on the portfolio', function () {
    $project = Project::create([
        'title' => 'Project Without Image',
        'description' => 'Project description.',
        'tech_stack' => 'Laravel',
        'image' => null,
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portfolio')
            ->has('projects', 1, fn (Assert $page) => $page
                ->where('id', $project->id)
                ->where('image', null)
                ->etc()
            )
        );
});

test('keeps the existing image when a project is updated without a replacement', function () {
    Storage::fake('public');
    Storage::disk('public')->put('projects/kept.jpg', 'existing image');

    $project = Project::create([
        'title' => 'Existing Project',
        'description' => 'Existing description.',
        'tech_stack' => 'Laravel',
        'image' => 'projects/kept.jpg',
    ]);

    $response = $this->actingAs(User::factory()->create())
        ->post(route('projects.update', $project), [
            '_method' => 'put',
            'title' => 'Updated Project',
            'description' => 'Updated description.',
            'tech_stack' => 'Laravel, React',
        ]);

    $response->assertRedirect(route('home'));

    expect($project->refresh()->image)->toBe('projects/kept.jpg');
    Storage::disk('public')->assertExists('projects/kept.jpg');
});

test('replaces an uploaded image when updating a project', function () {
    Storage::fake('public');
    Storage::disk('public')->put('projects/old.jpg', 'old image');

    $project = Project::create([
        'title' => 'Replace Image Project',
        'description' => 'Project description.',
        'tech_stack' => 'Laravel',
        'image' => 'projects/old.jpg',
    ]);

    $response = $this->actingAs(User::factory()->create())
        ->post(route('projects.update', $project), [
            '_method' => 'put',
            'title' => $project->title,
            'description' => $project->description,
            'tech_stack' => $project->tech_stack,
            'image' => projectImageUpload('replacement.jpg'),
        ]);

    $response->assertRedirect(route('home'));

    $project->refresh();

    expect($project->image)->not->toBe('projects/old.jpg');
    Storage::disk('public')->assertMissing('projects/old.jpg');
    Storage::disk('public')->assertExists($project->image);
});

test('rejects project image formats other than jpeg png and webp', function () {
    Storage::fake('public');

    $response = $this->actingAs(User::factory()->create())
        ->post(route('projects.store'), [
            'title' => 'Invalid Image Project',
            'description' => 'Project description.',
            'tech_stack' => 'Laravel',
            'image' => File::fake()->create('document.txt', 10, 'text/plain'),
        ]);

    $response->assertSessionHasErrors('image');
    $this->assertDatabaseCount('projects', 0);
    Storage::disk('public')->assertCount('projects', 0);
});

test('rejects project images larger than 2 MB', function () {
    Storage::fake('public');

    $response = $this->actingAs(User::factory()->create())
        ->post(route('projects.store'), [
            'title' => 'Oversized Image Project',
            'description' => 'Project description.',
            'tech_stack' => 'Laravel',
            'image' => projectImageUpload('oversized.jpg', 2 * 1024 * 1024),
        ]);

    $response->assertSessionHasErrors('image');
    $this->assertDatabaseCount('projects', 0);
    Storage::disk('public')->assertCount('projects', 0);
});

test('deletes uploaded images with their projects but preserves legacy public images', function () {
    Storage::fake('public');
    Storage::disk('public')->put('projects/uploaded.jpg', 'uploaded image');
    Storage::disk('public')->put('images/legacy.jpg', 'legacy image');

    $uploadedProject = Project::create([
        'title' => 'Uploaded Image Project',
        'description' => 'Project description.',
        'tech_stack' => 'Laravel',
        'image' => 'projects/uploaded.jpg',
    ]);

    $legacyProject = Project::create([
        'title' => 'Legacy Image Project',
        'description' => 'Project description.',
        'tech_stack' => 'Laravel',
        'image' => 'images/legacy.jpg',
    ]);

    $this->actingAs(User::factory()->create())
        ->delete(route('projects.destroy', $uploadedProject))
        ->assertRedirect(route('home'));

    Storage::disk('public')->assertMissing('projects/uploaded.jpg');
    $this->assertDatabaseMissing('projects', ['id' => $uploadedProject->id]);

    $this->delete(route('projects.destroy', $legacyProject))
        ->assertRedirect(route('home'));

    Storage::disk('public')->assertExists('images/legacy.jpg');
    $this->assertDatabaseMissing('projects', ['id' => $legacyProject->id]);
});
