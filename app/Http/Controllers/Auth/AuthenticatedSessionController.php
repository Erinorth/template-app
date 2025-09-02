<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\LoginEGATRequest;
use App\Services\Auth\EGATAuthService;
use App\Services\User\UserManagementService;
use App\Services\Department\DepartmentChangeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use nusoap_client;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthenticatedSessionController extends Controller
{
    public function __construct(
        private EGATAuthService $egatAuthService,
        private UserManagementService $userManagementService,
        private DepartmentChangeService $departmentChangeService
    ) {}

    /**
     * แสดงหน้าล็อกอินปกติ
     */
    public function create(Request $request): Response
    {
        Log::info('แสดงหน้าล็อกอินปกติ');
        
        return Inertia::render('auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function createEGAT(Request $request): Response
    {
        return Inertia::render('auth/LoginEGAT', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * แสดงหน้าล็อกอิน EGAT
     */
    public function createEGAT(Request $request): Response
    {
        Log::info('แสดงหน้าล็อกอิน EGAT');
        
        return Inertia::render('auth/LoginEGAT', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * ประมวลผลการล็อกอินปกติ
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        Log::info('เริ่มกระบวนการล็อกอินปกติ', [
            'email' => $request->input('email'),
            'ip' => $request->ip()
        ]);

        $request->authenticate();
        $request->session()->regenerate();

        Log::info('ล็อกอินปกติสำเร็จ', [
            'user_id' => Auth::id(),
            'email' => $request->input('email')
        ]);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function storeEGAT(Request $request): RedirectResponse
    {
        $username = $request->input('egatid');
        $password = $request->input('password');

        // สร้างคีย์สำหรับ Rate Limiter โดยใช้ username + IP
        $throttleKey = Str::transliterate(Str::lower($username).'|'.$request->ip());

        // ตรวจสอบว่ามีการพยายามเกินจำนวนครั้งที่กำหนดหรือไม่
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'egatid' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        Log::info('เริ่มกระบวนการล็อกอิน EGAT', ['username' => $username]);

        Log::debug('กำลังเชื่อมต่อ SOAP Web Service');

        $client = new nusoap_client("http://webservices.egat.co.th/authentication/au_provi.php?wsdl", true);
        $client->soap_defencoding = 'UTF-8';
        $client->decode_utf8 = false;

        $result = $client->call("validate_user", [
            "a" => $username,
            "b" => $password
        ]);

        Log::debug('ผลลัพธ์จาก SOAP', ['response' => $result]);

        // ตรวจสอบค่าตรงๆ เป็น boolean
        if ($result) {
            Log::info('ตรวจสอบผู้ใช้ในฐานข้อมูล', ['email' => $username.'@egat.co.th']);
            
            // ล้าง Rate Limiter เมื่อล็อกอินสำเร็จ
            RateLimiter::clear($throttleKey);
            
            $user = User::firstOrCreate(
                ['email' => $username . '@egat.co.th'],
                [
                    'egat_id' => $username,
                    'name' => $username,
                    'password' => Hash::make($password),
                    'email_verified_at' => now()
                ]
            );

            if ($census = $user->census()->first()) {
                Log::debug('ตรวจสอบบทบาทผู้ใช้', [
                    'user_id' => $user->id,
                    'current_roles' => $user->getRoleNames()
                ]);

                $position = $census->a_position;
                $currentRoles = $user->getRoleNames();
            
                Log::info('Current roles before update', ['user_id' => $user->id, 'roles' => $currentRoles]);
            
                foreach ($currentRoles as $role) {
                    if ($role !== 'admin') {
                        $user->removeRole($role);
                        Log::info('Role removed', ['user_id' => $user->id, 'role' => $role]);
                    }
                }
            
                switch ($position) {
                    case 'ห':
                        $user->assignRole('head');
                        $user->assignRole('egat');
                        Log::info('Role assigned', ['user_id' => $user->id, 'role' => 'head']);
                        break;
                    case 'ก':
                        $user->assignRole('chift');
                        $user->assignRole('egat');
                        Log::info('Role assigned', ['user_id' => $user->id, 'role' => 'chift']);
                        break;
                    case 'อ':
                        $user->assignRole('director');
                        $user->assignRole('egat');
                        Log::info('Role assigned', ['user_id' => $user->id, 'role' => 'director']);
                        break;
                    default:
                        Log::info('No role assigned', ['user_id' => $user->id, 'position' => $position]);
                        break;
                }
            
                $updatedRoles = $user->getRoleNames();

                Log::info('อัปเดตบทบาทผู้ใช้สำเร็จ', [
                    'user_id' => $user->id,
                    'new_roles' => $user->getRoleNames()
                ]);
            }

            Auth::login($user);
            $request->session()->regenerate();

            Log::info('ล็อกอินสำเร็จ', ['user_id' => $user->id]);
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // เพิ่มจำนวนครั้งที่ล้มเหลวใน Rate Limiter
        RateLimiter::hit($throttleKey);

        Log::warning('ข้อมูลล็อกอินไม่ถูกต้อง', ['username' => $username]);
        throw ValidationException::withMessages([
            'egatid' => trans('auth.failed'),
        ]);
    }

    /**
     * ประมวลผลการล็อกอิน EGAT
     */
    public function storeEGAT(LoginEGATRequest $request): RedirectResponse
    {
        $request->ensureIsNotRateLimited();

        $username = $request->input('egatid');
        $password = $request->input('password');

        Log::info('เริ่มกระบวนการล็อกอิน EGAT', [
            'username' => $username,
            'ip' => $request->ip()
        ]);

        try {
            // ตรวจสอบผู้ใช้ผ่าน EGAT Service
            $isValidUser = $this->egatAuthService->validateUser($username, $password);
            
            if (!$isValidUser) {
                $this->handleFailedLogin($request, $username);
                throw ValidationException::withMessages([
                    'egatid' => trans('auth.failed'),
                ]);
            }

            // สร้างหรืออัปเดตผู้ใช้
            $user = $this->userManagementService->createOrUpdateEGATUser($username, $password);
            
            // ล็อกอินผู้ใช้
            $this->performLogin($user, $request);

            Log::info('ล็อกอิน EGAT สำเร็จ', [
                'user_id' => $user->id,
                'username' => $username,
                'current_department' => $user->department,
                'current_position' => $user->position
            ]);
            
            return redirect()->intended(route('dashboard', absolute: false));

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            $this->handleSystemError($request, $username, $e);
            throw ValidationException::withMessages([
                'egatid' => 'ไม่สามารถเชื่อมต่อกับระบบตรวจสอบได้ กรุณาลองใหม่อีกครั้ง',
            ]);
        }
    }

    /**
     * ดำเนินการล็อกอินผู้ใช้
     */
    private function performLogin($user, LoginEGATRequest $request): void
    {
        Auth::login($user);
        $request->session()->regenerate();
        $request->clearRateLimiting();
    }

    /**
     * จัดการล็อกอินที่ไม่สำเร็จ
     */
    private function handleFailedLogin(LoginEGATRequest $request, string $username): void
    {
        $request->recordRateLimitAttempt();
        Log::warning('ข้อมูลล็อกอินไม่ถูกต้อง', ['username' => $username, 'ip' => $request->ip()]);
    }

    /**
     * จัดการข้อผิดพลาดของระบบ
     */
    private function handleSystemError(LoginEGATRequest $request, string $username, \Exception $exception): void
    {
        $request->recordRateLimitAttempt();
        Log::error('ข้อผิดพลาดในการเชื่อมต่อ SOAP Web Service', [
            'username' => $username,
            'error' => $exception->getMessage()
        ]);
    }

    /**
     * ล็อกเอาท์ผู้ใช้
     */
    public function destroy(Request $request): RedirectResponse
    {
        Log::info('เริ่มกระบวนการล็อกเอาท์', ['user_id' => Auth::id()]);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        Log::info('ล็อกเอาท์สำเร็จ');
        return redirect('/');
    }
}
