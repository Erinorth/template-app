<?php

namespace App\Services\Census;

use App\Models\CenSus;
use Illuminate\Support\Facades\Log;

class CensusDataService
{
    /**
     * ค้นหาข้อมูลผู้ใช้จาก Census Database
     */
    public function getCensusData(string $username): ?CenSus
    {
        Log::info('ค้นหาข้อมูลใน Census Database', ['username' => $username]);
        
        $connection = app()->environment('testing') ? 'testing_mmddata' : 'mmddata';
        $census = CenSus::on($connection)->where('EMPN', $username)->first();
        
        Log::info('ผลการค้นหาข้อมูล Census', [
            'username' => $username,
            'census_found' => $census ? 'true' : 'false',
            'department' => $census?->pnang,
            'section' => $census?->gong,
            'position' => $census?->a_position,
            'connection' => $connection
        ]);

        return $census;
    }

    /**
     * ตรวจสอบว่ามีข้อมูล Census หรือไม่
     */
    public function hasCensusData(string $username): bool
    {
        $connection = app()->environment('testing') ? 'testing_mmddata' : 'mmddata';
        return CenSus::on($connection)->where('EMPN', $username)->exists();
    }

    /**
     * ดึงข้อมูลหน่วยงานจาก Census
     */
    public function getDepartmentFromCensus(string $username): ?string
    {
        $census = $this->getCensusData($username);
        return $census?->pnang;
    }
}
