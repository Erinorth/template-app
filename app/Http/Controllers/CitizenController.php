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
        // รับ parameter การ sort จาก client (sort, direction)
        $sort = $request->input('sort', 'id'); // ค่า default คือ id
        $direction = $request->input('direction', 'desc'); // ค่า default คือ desc
        $validSorts = ['id', 'citizen_id', 'birth_date', 'remark', 'created_at'];

        // ตรวจสอบว่า sort ถูกต้องหรือไม่
        if (!in_array($sort, $validSorts)) {
            $sort = 'id';
        }
        if (!in_array(strtolower($direction), ['asc', 'desc'])) {
            $direction = 'desc';
        }

        $perPage = (int) $request->input('per_page', 10);

        // query ข้อมูล citizen และ sorting + paginate
        $citizens = Citizen::query()
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        // log (สำหรับ debugging)
        \Log::info('Citizen index fetch', compact('sort', 'direction', 'perPage'));

        return Inertia::render('citizens/Index', [
            'title' => 'Citizens',
            'citizens' => $citizens,
            'sort' => $sort,
            'direction' => $direction,
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
