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
use nusoap_client;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
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
