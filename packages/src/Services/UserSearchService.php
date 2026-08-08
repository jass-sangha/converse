<?php

namespace Converse\Chat\Services;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\UserSearchServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class UserSearchService implements UserSearchServiceInterface
{
    public function search(int $excludeUserId, ?string $q, int $perPage): LengthAwarePaginator
    {
        $model = Chat::userModel();
        $nameField = config('chat.user_search.name_field', 'name');

        $query = $model::query()->where((new $model)->getKeyName(), '!=', $excludeUserId);

        if (! empty($q)) {
            $query->where($nameField, 'like', '%'.$q.'%');
        }

        return $query->paginate($perPage);
    }

    public function findMany(array $ids): Collection
    {
        $model = Chat::userModel();

        return $model::query()->whereIn((new $model)->getKeyName(), array_slice(array_unique($ids), 0, 200))->get();
    }
}
