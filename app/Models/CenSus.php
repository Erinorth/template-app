<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CenSus extends Model
{
    protected $connection = 'mmddata';
    protected $table = 'view_census';
    protected $primaryKey = 'EMPN';
    protected $keyType = 'string';
    public $incrementing = false;
}
