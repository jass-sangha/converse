<?php

namespace Converse\Chat\Tests\Fixtures;

use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * A second Authenticatable model, distinct from Fixtures\User, used to prove the
 * package's chatable_type/chatable_id polymorphism actually supports more than one
 * participant model — not just a single hardcoded `user_model`.
 */
class Agent extends Authenticatable
{
    protected $table = 'agents';

    protected $fillable = ['name', 'email', 'password'];
}
