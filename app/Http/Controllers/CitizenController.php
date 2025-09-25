<?php

namespace App\Http\Controllers;

use App\Models\Citizen;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCitizenRequest;
use App\Http\Requests\UpdateCitizenRequest;
use Inertia\Inertia;

class CitizenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        
        $citizens = Citizen::query()
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('citizens/Index', [
            'title' => 'Citizens',
            'citizens' => $citizens,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCitizenRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Citizen $citizen)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Citizen $citizen)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCitizenRequest $request, Citizen $citizen)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Citizen $citizen)
    {
        //
    }
}
