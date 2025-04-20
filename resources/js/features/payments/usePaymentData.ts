import { ref, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';
import type { Payment } from '@/features/payments/payment';

export function usePaymentData(initialPayments: Payment[]) {
    // สร้าง reactive reference สำหรับเก็บข้อมูลการชำระเงิน
    const data = ref<Payment[]>([]);

    // เรียกใช้ฟังก์ชัน getData ใน onMounted
    onMounted(async () => {
        // ใช้ข้อมูลจาก props หรือเรียก API ถ้าจำเป็น
        data.value = initialPayments && initialPayments.length > 0 
        ? [...initialPayments]
        : await getData();
    });

    // ฟังก์ชันสำหรับโหลดข้อมูลจาก API (หากจำเป็น)
    async function getData(): Promise<Payment[]> {
        try {
            const response = await fetch(route('payments'));
            return await response.json();
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน:', error);
            return [];
        }
    }

    // ฟังก์ชันอัปเดตข้อมูลการชำระเงินด้วย Inertia
    const updatePayment = async (id: number | string, field: keyof Payment, value: any) => {
        // หาข้อมูลการชำระเงิน
        const paymentIndex = data.value.findIndex(payment => payment.id === id);
        if (paymentIndex === -1) {
            console.error('ไม่พบข้อมูลการชำระเงินที่มี ID:', id);
            return;
        }
        
        // อัปเดตข้อมูลในแอปพลิเคชัน
        data.value[paymentIndex][field] = value;
        data.value = [...data.value];
        
        // ข้อมูลสำหรับ log
        const email = data.value[paymentIndex].email;
        const amount = data.value[paymentIndex].amount;
        
        // ส่งข้อมูลผ่าน Inertia
        router.patch(route('payments.update'), {
            id: id,
            [field]: value
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // แสดง log เมื่อสำเร็จ
                console.log('✅ อัปเดตข้อมูลการชำระเงินสำเร็จ', {
                    email: email,
                    amount: amount,
                    field: field,
                    value: value,
                    timestamp: new Date().toLocaleString('th-TH')
                });
            },
            onError: (errors) => {
                // แสดง log เมื่อไม่สำเร็จ
                console.error('❌ ไม่สามารถอัปเดตข้อมูลการชำระเงินได้', {
                    email: email,
                    amount: amount,
                    field: field,
                    attemptedValue: value,
                    errors: errors,
                    timestamp: new Date().toLocaleString('th-TH')
                });
                
                // คืนค่าเดิมเมื่อเกิดข้อผิดพลาด
                data.value[paymentIndex][field] = !value;
                data.value = [...data.value];
            }
        });
    };

    return {
        data,
        updatePayment
    };
}