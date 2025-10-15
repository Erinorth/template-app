<?php

namespace App\Http\Controllers;

use App\Models\Citizen;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCitizenRequest;
use App\Http\Requests\UpdateCitizenRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CitizenController extends Controller
{
    /**
     * แสดงรายการข้อมูลประชาชนทั้งหมด
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
     * แสดงฟอร์มสำหรับสร้างข้อมูลประชาชนใหม่
     */
    public function create(): Response
    {
        \Log::info('Citizen create form accessed', [
            'user_id' => auth()->id(),
        ]);

        return Inertia::render('citizens/Form', [
            'title' => 'เพิ่มข้อมูลประชาชน',
            'mode' => 'create',
        ]);
    }

    /**
     * บันทึกข้อมูลประชาชนใหม่ลงในฐานข้อมูล
     */
    public function store(StoreCitizenRequest $request): RedirectResponse
    {
        try {
            // รับข้อมูลที่ผ่าน validation แล้ว
            $validated = $request->validated();

            \Log::info('Citizen store attempt', [
                'data' => $validated,
                'user_id' => auth()->id(),
            ]);

            // สร้างข้อมูล Citizen ใหม่
            $citizen = Citizen::create($validated);

            \Log::info('Citizen created successfully', [
                'id' => $citizen->id,
                'citizen_id' => $citizen->citizen_id,
                'user_id' => auth()->id(),
            ]);

            // redirect ไปหน้า index พร้อมข้อความสำเร็จ
            return redirect()
                ->route('citizens.index')
                ->with('success', 'บันทึกข้อมูลประชาชนเรียบร้อยแล้ว');

        } catch (\Illuminate\Database\QueryException $e) {
            // จัดการกรณี database error
            \Log::error('Citizen store database error', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง');

        } catch (\Exception $e) {
            // จัดการกรณี error อื่นๆ
            \Log::error('Citizen store failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    }

    /**
     * แสดงรายละเอียดข้อมูลประชาชน
     */
    public function show(Citizen $citizen): Response
    {
        \Log::info('Citizen show page accessed', [
            'id' => $citizen->id,
            'citizen_id' => $citizen->citizen_id,
            'user_id' => auth()->id(),
        ]);

        return Inertia::render('citizens/Show', [
            'title' => 'รายละเอียดข้อมูลประชาชน',
            'citizen' => [
                'id' => $citizen->id,
                'citizen_id' => $citizen->citizen_id,
                'birth_date' => $citizen->birth_date,
                'remark' => $citizen->remark,
                'created_at' => $citizen->created_at?->toIso8601String(),
                'updated_at' => $citizen->updated_at?->toIso8601String(),
            ],
            // ส่งข้อมูลสิทธิ์สำหรับ action ต่างๆ
            'can' => [
                'edit' => true, // สามารถใช้ Policy ได้
                'delete' => true, // สามารถใช้ Policy ได้
            ],
        ]);
    }

    /**
     * แสดงฟอร์มสำหรับแก้ไขข้อมูลประชาชน
     */
    public function edit(Citizen $citizen): Response
    {
        \Log::info('Citizen edit form accessed', [
            'id' => $citizen->id,
            'citizen_id' => $citizen->citizen_id,
            'user_id' => auth()->id(),
        ]);

        return Inertia::render('citizens/Form', [
            'title' => 'แก้ไขข้อมูลประชาชน',
            'mode' => 'edit',
            'citizen' => [
                'id' => $citizen->id,
                'citizen_id' => $citizen->citizen_id,
                'birth_date' => $citizen->birth_date,
                'remark' => $citizen->remark,
            ],
        ]);
    }

    /**
     * อัปเดตข้อมูลประชาชนในฐานข้อมูล
     */
    public function update(UpdateCitizenRequest $request, Citizen $citizen): RedirectResponse
    {
        try {
            // รับข้อมูลที่ผ่าน validation แล้ว
            $validated = $request->validated();

            \Log::info('Citizen update attempt', [
                'id' => $citizen->id,
                'data' => $validated,
                'user_id' => auth()->id(),
            ]);

            // อัปเดตข้อมูล Citizen
            $citizen->update($validated);

            \Log::info('Citizen updated successfully', [
                'id' => $citizen->id,
                'citizen_id' => $citizen->citizen_id,
                'user_id' => auth()->id(),
            ]);

            // redirect ไปหน้า index พร้อมข้อความสำเร็จ
            return redirect()
                ->route('citizens.index')
                ->with('success', 'อัปเดตข้อมูลประชาชนเรียบร้อยแล้ว');

        } catch (\Illuminate\Database\QueryException $e) {
            // จัดการกรณี database error
            \Log::error('Citizen update database error', [
                'id' => $citizen->id,
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลลงฐานข้อมูล กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง');

        } catch (\Exception $e) {
            // จัดการกรณี error อื่นๆ
            \Log::error('Citizen update failed', [
                'id' => $citizen->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    }

    /**
     * ลบข้อมูลประชาชนออกจากฐานข้อมูล
     */
    public function destroy(Citizen $citizen): RedirectResponse
    {
        try {
            $citizenId = $citizen->id;
            $citizenIdCard = $citizen->citizen_id;

            \Log::info('Citizen delete attempt', [
                'id' => $citizenId,
                'citizen_id' => $citizenIdCard,
                'user_id' => auth()->id(),
            ]);

            // ลบข้อมูล Citizen
            $citizen->delete();

            \Log::info('Citizen deleted successfully', [
                'id' => $citizenId,
                'citizen_id' => $citizenIdCard,
                'user_id' => auth()->id(),
            ]);

            // redirect ไปหน้า index พร้อมข้อความสำเร็จ
            return redirect()
                ->route('citizens.index')
                ->with('success', 'ลบข้อมูลประชาชนเรียบร้อยแล้ว');

        } catch (\Illuminate\Database\QueryException $e) {
            // จัดการกรณี database error (เช่น foreign key constraint)
            \Log::error('Citizen delete database error', [
                'id' => $citizen->id,
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'ไม่สามารถลบข้อมูลได้ เนื่องจากมีข้อมูลอื่นที่เกี่ยวข้องอยู่');

        } catch (\Exception $e) {
            // จัดการกรณี error อื่นๆ
            \Log::error('Citizen delete failed', [
                'id' => $citizen->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
    }
}
