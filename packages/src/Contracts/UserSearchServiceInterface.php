<?php

namespace Converse\Chat\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface UserSearchServiceInterface
{
    public function search(int $excludeUserId, ?string $q, int $perPage): LengthAwarePaginator;

    /**
     * @param  int[]  $ids
     */
    public function findMany(array $ids): Collection;
}
