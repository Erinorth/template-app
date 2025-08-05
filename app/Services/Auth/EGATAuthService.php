<?php

namespace App\Services\Auth;

use Illuminate\Support\Facades\Log;
use nusoap_client;

class EGATAuthService
{
    /**
     * ตรวจสอบความถูกต้องของผู้ใช้ผ่าน EGAT SOAP Service
     */
    public function validateUser(string $username, string $password): bool
    {
        Log::debug('กำลังเชื่อมต่อ SOAP Web Service');

        $client = $this->createSoapClient();
        
        $result = $client->call("validate_user", [
            "a" => $username,
            "b" => $password
        ]);

        Log::debug('ผลลัพธ์จาก SOAP Web Service', [
            'username' => $username,
            'result' => $result ? 'success' : 'failed'
        ]);

        return (bool) $result;
    }

    /**
     * สร้าง SOAP Client สำหรับเชื่อมต่อ EGAT Service
     */
    private function createSoapClient()
    {
        // ใช้ Mock SOAP Client ในขณะทดสอบ
        if (app()->bound('nusoap_client')) {
            Log::debug('ใช้ Mock SOAP Client สำหรับการทดสอบ');
            return app('nusoap_client');
        }

        // ใช้ SOAP Client จริง
        Log::debug('สร้าง SOAP Client จริง');
        $client = new nusoap_client("http://webservices.egat.co.th/authentication/au_provi.php?wsdl", true);
        $client->soap_defencoding = 'UTF-8';
        $client->decode_utf8 = false;
        
        return $client;
    }
}
