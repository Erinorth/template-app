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

        return Inertia::render('citizens/Form', [
            'title' => 'เพิ่มข้อมูลประชาชน'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCitizenRequest $request)
    {
        try {
            // รับข้อมูลที่ผ่าน validation แล้ว
            $validated = $request->validated();

            \Log::info('Citizen store attempt', ['data' => $validated]);

            // สร้างข้อมูล Citizen ใหม่
            $citizen = Citizen::create($validated);

            \Log::info('Citizen created successfully', ['id' => $citizen->id]);

            // redirect ไปหน้า index พร้อมข้อความสำเร็จ
            return redirect()
                ->route('citizens.index')
                ->with('success', 'บันทึกข้อมูลประชาชนเรียบร้อยแล้ว');

        } catch (\Exception $e) {
            \Log::error('Citizen store failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Citizen $citizen)
    {
        \Log::info('Citizen show requested', ['id' => $citizen->id]);

        // ส่งข้อมูล citizen ไปแสดงในหน้ารายละเอียด
        return Inertia::render('citizens/Show', [
            'title' => 'รายละเอียดประชาชน',
            'citizen' => $citizen
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Citizen $citizen)
    {
        \Log::info('Citizen edit form requested', ['id' => $citizen->id]);

        // ส่งข้อมูล citizen ไปแสดงในฟอร์มแก้ไข
        return Inertia::render('citizens/Form', [
            'title' => 'แก้ไขข้อมูลประชาชน',
            'citizen' => $citizen
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCitizenRequest $request, Citizen $citizen)
    {
        try {
            // รับข้อมูลที่ผ่าน validation แล้ว
            $validated = $request->validated();

            \Log::info('Citizen update attempt', [
                'id' => $citizen->id,
                'data' => $validated
            ]);

            // อัปเดตข้อมูล Citizen
            $citizen->update($validated);

            \Log::info('Citizen updated successfully', ['id' => $citizen->id]);

            // redirect ไปหน้า index พร้อมข้อความสำเร็จ
            return redirect()
                ->route('citizens.index')
                ->with('success', 'อัปเดตข้อมูลประชาชนเรียบร้อยแล้ว');

        } catch (\Exception $e) {
            \Log::error('Citizen update failed', [
                'id' => $citizen->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Citizen $citizen)
    {
        try {
            $citizenId = $citizen->id;

            \Log::info('Citizen delete attempt', ['id' => $citizenId]);

            // ลบข้อมูล Citizen
            $citizen->delete();

            \Log::info('Citizen deleted successfully', ['id' => $citizenId]);

            // redirect ไปหน้า index พร้อมข้อความสำเร็จ
            return redirect()
                ->route('citizens.index')
                ->with('success', 'ลบข้อมูลประชาชนเรียบร้อยแล้ว');

        } catch (\Exception $e) {
            \Log::error('Citizen delete failed', [
                'id' => $citizen->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()
                ->back()
                ->with('error', 'เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    }
}
