<?php

namespace Converse\Chat\Services;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\UserSearchServiceInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class UserSearchService implements UserSearchServiceInterface
{
    public function search(Model $exclude, string $type, ?string $q, int $perPage): LengthAwarePaginator
    {
        $model = Chat::modelForAlias($type);
        $nameField = config('chat.user_search.name_field', 'name');

        $query = $model::query();

        if ($model === $exclude::class) {
            $query->where((new $model)->getKeyName(), '!=', $exclude->getKey());
        }

        if (! empty($q)) {
            $query->where($nameField, 'like', '%'.$q.'%');
        }

        return $query->paginate($perPage);
    }

    public function findMany(string $type, array $ids): Collection
    {
        $model = Chat::modelForAlias($type);

        return $model::query()->whereIn((new $model)->getKeyName(), array_slice(array_unique($ids), 0, 200))->get();
    }
}
