<?php
// app/Models/Project.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'budget', 'status', 
        'start_date', 'end_date'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
    ];

    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class)
                    ->withPivot(['role', 'joined_at', 'left_at'])
                    ->withTimestamps();
    }
}
