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
        // ค่าที่ใช้สำหรับจัดเรียงข้อมูล (sort)
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');
        $validSorts = ['id', 'citizen_id', 'birth_date', 'remark', 'created_at'];

        if (!in_array($sort, $validSorts)) {
            $sort = 'id';
        }
        if (!in_array(strtolower($direction), ['asc', 'desc'])) {
            $direction = 'desc';
        }
        $perPage = (int) $request->input('per_page', 10);

        // ตัวแปรกรองข้อมูล/ค้นหา
        $search = $request->input('search');

        // query หลัก
        $query = Citizen::query();

        // ถ้ามีค่า search ให้ filter หลายคอลัมน์
        if ($search) {
            \Log::info('Citizen search filter', ['search' => $search]);
            $query->where(function ($q) use ($search) {
                $q->where('citizen_id', 'like', '%' . $search . '%')
                  ->orWhere('remark', 'like', '%' . $search . '%')
                  ->orWhere('birth_date', 'like', '%' . $search . '%')
                  ->orWhere('id', $search); // id ให้ค้นหาตรงๆ
            });
        }

        // การจัดเรียงและแบ่งหน้า
        $citizens = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        // log
        \Log::info('Citizen index fetch', compact('sort', 'direction', 'perPage'));

        // ส่งข้อมูลไป frontend
        return Inertia::render('citizens/Index', [
            'title' => 'Citizens',
            'citizens' => $citizens,
            'sort' => $sort,
            'direction' => $direction,
            // เพิ่ม query string ทั้งหมดให้ frontend สามารถอ่านค่า search ได้ (กรณี reload)
            'query' => $request->query()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        \Log::info('Citizen create form requested');

        return Inertia::render('citizens/FormModal');
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
