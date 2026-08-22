<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\UserSearchServiceInterface;

class UserSearchService implements UserSearchServiceInterface
{
    public function search(Model $exclude, string $type, ?string $q, int $perPage): LengthAwarePaginator
    {
        $model = Chat::modelForAlias($type);
        $nameField = Chat::nameFieldFor($type);

        $query = $model::query();

        if ($model === $exclude::class) {
            $query->where((new $model)->getKeyName(), '!=', $exclude->getKey());
        }

        if (! empty($q)) {
            $query->where($nameField, 'like', Chat::nameSearchPattern($q));
        }

        return $query->paginate($perPage);
    }

    public function findMany(string $type, array $ids): Collection
    {
        $model = Chat::modelForAlias($type);

        return $model::query()->whereIn((new $model)->getKeyName(), array_slice(array_unique($ids), 0, 200))->get();
    }
}
