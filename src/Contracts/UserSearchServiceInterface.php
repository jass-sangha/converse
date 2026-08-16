<?php

namespace Converse\Chat\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface UserSearchServiceInterface
{
    /**
     * @param  string  $type  Morph alias of the chatable model to search (see chat.chatable_models).
     */
    public function search(Model $exclude, string $type, ?string $q, int $perPage): LengthAwarePaginator;

    /**
     * @param  int[]  $ids
     */
    public function findMany(string $type, array $ids): Collection;
}
