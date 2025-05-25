<?php
// app/Models/Employee.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'avatar',
        'department', 'position', 'salary', 'currency',
        'hire_date', 'employment_type', 'status', 'is_remote',
        'performance_rating', 'last_review_date', 'skills',
        'region', 'cost_center', 'manager_id', 'age',
        'experience', 'bonus', 'notes'
    ];

    protected $casts = [
        'hire_date' => 'date',
        'last_review_date' => 'date',
        'is_remote' => 'boolean',
        'performance_rating' => 'decimal:1',
        'salary' => 'decimal:2',
        'bonus' => 'decimal:2',
        'skills' => 'array',
    ];

    // Relationships
    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    public function certifications(): HasMany
    {
        return $this->hasMany(Certification::class);
    }

    public function emergencyContact(): HasOne
    {
        return $this->hasOne(EmergencyContact::class);
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class)
                    ->withPivot(['role', 'joined_at', 'left_at'])
                    ->withTimestamps();
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getFormattedSalaryAttribute(): string
    {
        return number_format($this->salary, 2) . ' ' . $this->currency;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeByDepartment($query, string $department)
    {
        return $query->where('department', $department);
    }

    public function scopeRemote($query)
    {
        return $query->where('is_remote', true);
    }
}
