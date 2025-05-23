<script setup lang="ts">
import InputError from '@/components/InputError.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthBase from '@/layouts/AuthLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { LoaderCircle } from 'lucide-vue-next';

defineProps<{
    status?: string;
}>();

const form = useForm({
    egatid: '',
    password: '',
    remember: false,
});

const submit = () => {
    form.post(route('loginEGAT'), {
        onFinish: () => form.reset('password'),
    });
};

// Validation function to ensure EGAT ID is not more than 6 digits
const validateEGATID = () => {
    if (form.egatid.length > 6) {
        form.errors.egatid = 'EGAT ID must be a maximum of 6 digits.';
    } else {
        form.errors.egatid = null;
    }
};
</script>

<template>
    <AuthBase title="Log in to your account" description="Enter your EGAT ID and password below to log in">
        <Head title="Log in" />

        <div v-if="status" class="mb-4 text-center text-sm font-medium text-green-600">
            {{ status }}
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-6">
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label for="egatid">EGAT ID</Label>
                    <Input
                        id="egatid"
                        type="number"
                        required
                        autofocus
                        :tabindex="1"
                        autocomplete="off"
                        v-model="form.egatid"
                        placeholder="EGAT ID"
                        maxlength="6"
                        @input="validateEGATID"
                    />
                    <InputError :message="form.errors.egatid" />
                </div>

                <div class="grid gap-2">
                    <div class="flex items-center justify-between">
                        <Label for="password">Password</Label>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        :tabindex="2"
                        autocomplete="current-password"
                        v-model="form.password"
                        placeholder="Password"
                    />
                    <InputError :message="form.errors.password" />
                </div>

                <div class="flex items-center justify-between" :tabindex="3">
                    <Label for="remember" class="flex items-center space-x-3">
                        <Checkbox id="remember" v-model="form.remember" :tabindex="4" />
                        <span>Remember me</span>
                    </Label>
                </div>

                <Button type="submit" class="mt-4 w-full" :tabindex="4" :disabled="form.processing">
                    <LoaderCircle v-if="form.processing" class="h-4 w-4 animate-spin" />
                    Log in
                </Button>
            </div>

            <div class="text-center text-sm text-muted-foreground">
                Or with
                <TextLink :href="route('login')" :tabindex="5">Email</TextLink>
            </div>
        </form>
    </AuthBase>
</template>