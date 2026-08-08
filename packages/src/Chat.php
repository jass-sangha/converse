<?php

namespace Converse\Chat;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class Chat
{
    /**
     * @return array<string, class-string<Model>> Alias => model class.
     */
    public static function chatableModels(): array
    {
        return config('chat.chatable_models', []);
    }

    /**
     * The default chatable model class — the first entry in `chat.chatable_models`.
     */
    public static function defaultChatableModel(): string
    {
        return array_values(static::chatableModels())[0];
    }

    public static function isChatable(?Model $model): bool
    {
        return $model !== null && in_array($model::class, static::chatableModels(), true);
    }

    public static function table(string $key): string
    {
        return config("chat.table_names.{$key}", "chat_{$key}");
    }

    /**
     * A stable identity string for a chatable model, safe to use in cache keys,
     * array_diff/array_unique/pluck, etc. — plain numeric ids alone aren't unique
     * once more than one chatable model type shares the same id space.
     */
    public static function identify(Model $chatable): string
    {
        return $chatable->getMorphClass().'|'.$chatable->getKey();
    }

    /**
     * Split an identity string produced by identify() back into [type, id].
     *
     * @return array{0: string, 1: int|string}
     */
    public static function split(string $identity): array
    {
        [$type, $id] = explode('|', $identity, 2);

        return [$type, is_numeric($id) ? (int) $id : $id];
    }

    /**
     * Scope a query to rows belonging to the given chatable, matching both the
     * `{prefix}_type` and `{prefix}_id` columns of a morphs()/nullableMorphs() pair.
     */
    public static function whereChatable(Builder $query, Model $chatable, string $prefix = 'chatable'): Builder
    {
        return $query
            ->where("{$prefix}_type", $chatable->getMorphClass())
            ->where("{$prefix}_id", $chatable->getKey());
    }

    /**
     * Resolve a chatable model class from its morph map alias (e.g. "user").
     */
    public static function modelForAlias(string $alias): string
    {
        $model = static::chatableModels()[$alias] ?? null;

        abort_if($model === null, 404, "Unknown chatable type [{$alias}].");

        return $model;
    }

    /**
     * Resolve a chatable alias + id (as they appear in routes/requests) into the
     * actual model instance, or abort 404 if the type is unknown or the row doesn't exist.
     */
    public static function resolveChatable(string $alias, int|string $id): Model
    {
        $model = static::modelForAlias($alias);

        return $model::query()->findOrFail($id);
    }

    /**
     * Resolve a validated `[{type, id}, ...]` array (see StoreConversationRequest /
     * AddParticipantsRequest) into their model instances, grouped by type so each
     * chatable model is queried once regardless of how many ids were requested.
     *
     * @param  array<int, array{type: string, id: int|string}>  $items
     * @return Collection<int, Model>
     */
    public static function resolveMany(array $items): Collection
    {
        return collect($items)
            ->groupBy('type')
            ->flatMap(function (Collection $group, string $alias) {
                $model = static::modelForAlias($alias);
                $ids = $group->pluck('id')->unique()->all();

                return $model::query()->findOrFail($ids);
            })
            ->values();
    }
}
