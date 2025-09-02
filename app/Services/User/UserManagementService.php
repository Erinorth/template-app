<?php

namespace App\Services\User;

use App\Models\User;
use App\Models\CenSus;
use App\Services\Census\CensusDataService;
use App\Services\Department\DepartmentChangeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserManagementService
{
    public function __construct(
        private CensusDataService $censusDataService,
        private DepartmentChangeService $departmentChangeService
    ) {}

    /**
     * สร้างหรืออัปเดตผู้ใช้ EGAT
     */
    public function createOrUpdateEGATUser(string $username, string $password): User
    {
        $email = $username . '@egat.co.th';
        $existingUser = User::where('email', $email)->first();
        $censusData = $this->censusDataService->getCensusData($username);
        
        if ($existingUser) {
            return $this->updateExistingUser($existingUser, $username, $censusData);
        }
        
        return $this->createNewUser($username, $password, $censusData);
    }

    /**
     * อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว
     */
    private function updateExistingUser(User $user, string $username, ?CenSus $censusData): User
    {
        Log::info('พบผู้ใช้ที่มีอยู่แล้ว - อัปเดตข้อมูล', ['user_id' => $user->id]);
        
        // ตรวจสอบการเปลี่ยนแปลงหน่วยงาน
        $newDepartment = $censusData?->pnang ?? null;
        $this->departmentChangeService->handleDepartmentChange($user, $newDepartment);
        
        // เตรียมข้อมูลสำหรับอัปเดต
        $updateData = ['egat_id' => $username];
        
        if ($censusData) {
            $updateData = array_merge($updateData, $this->prepareCensusData($censusData));
            Log::info('อัปเดตข้อมูลจาก Census', [
                'department' => $censusData->pnang,
                'position' => $censusData->a_position
            ]);
        }
        
        DB::transaction(function () use ($user, $updateData) {
            $user->update($updateData);
        });
        
        $user->refresh();
        
        Log::info('อัปเดตข้อมูลผู้ใช้สำเร็จ', [
            'user_id' => $user->id,
            'department_updated' => $user->department,
            'position_updated' => $user->position
        ]);
        
        return $user;
    }

    /**
     * สร้างผู้ใช้ใหม่ในระบบ
     */
    private function createNewUser(string $username, string $password, ?CenSus $censusData): User
    {
        Log::info('สร้างผู้ใช้ใหม่');
        
        $userData = [
            'egat_id' => $username,
            'name' => $username,
            'email' => $username . '@egat.co.th',
            'password' => Hash::make($password),
            'email_verified_at' => now(),
            'company' => 'EGAT',
        ];
        
        if ($censusData) {
            $userData = array_merge($userData, $this->prepareCensusData($censusData));
        }
        
        $user = User::create($userData);
        
        Log::info('สร้างผู้ใช้ใหม่สำเร็จ', [
            'user_id' => $user->id,
            'department' => $user->department,
            'position' => $user->position
        ]);

        return $user;
    }

    /**
     * เตรียมข้อมูลจาก Census สำหรับบันทึก
     */
    private function prepareCensusData(CenSus $censusData): array
    {
        return [
            'company' => 'EGAT',
            'department' => $censusData->pnang,
            'position' => $censusData->a_position,
        ];
    }
}
