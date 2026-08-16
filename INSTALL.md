# Installing `jass-sangha/converse` via Composer

Private repo — Composer needs a repository entry plus credentials.

## 1. Register the repository

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/jass-sangha/converse.git"
        }
    ]
}
```

Use an SSH URL instead (`git@github.com:jass-sangha/converse.git`) if you'd rather authenticate via your existing SSH key — skip to step 3 if so.

## 2. Authenticate (HTTPS + token)

1. Create a token at github.com/settings/tokens.
    - **Fine-grained (recommended):** scope to `jass-sangha` → `converse` only, Contents: Read-only.
    - **Classic:** check `repo` scope (broader — grants access to all your private repos).
2. Give it to Composer:

    ```bash
    # machine-wide
    composer config --global github-oauth.github.com <token>

    # or per-project (writes ./auth.json — already gitignored in this repo)
    composer config github-oauth.github.com <token>
    ```

    For CI/deploy servers, skip the config step and set an env var instead:

    ```bash
    export COMPOSER_AUTH='{"github-oauth":{"github.com":"<token>"}}'
    ```

## 3. Require the package

```bash
composer require jass-sangha/converse:dev-main
```

`dev-main` tracks the main branch since there's no tagged release yet. Once you tag one (`git tag v1.0.0 && git push origin v1.0.0`), consumers can use `^1.0`.

Verify with `-vvv` — look for a successful `api.github.com` download rather than a 404/401 (a 404 on a private repo usually means the token isn't being picked up).

## 4. Finish install

```bash
php artisan migrate
# or, to also publish config/views/theme:
php artisan chat:install && php artisan migrate
```

## Notes

- Every consumer (teammate, CI runner) needs their own SSH key or token — anonymous installs can't reach a private repo.
- Store CI tokens in your secrets manager, never in the pipeline file.
- **Security:** rotate the token currently exposed in plaintext in this repo's `origin` remote URL (`.git/config`) — it's already been leaked and should not be reused.
