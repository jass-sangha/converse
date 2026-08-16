<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\AttachmentServiceInterface;
use Converse\Chat\Http\Requests\StoreAttachmentRequest;
use Converse\Chat\Http\Resources\AttachmentResource;

class AttachmentController extends Controller
{
    public function __construct(
        protected AttachmentServiceInterface $attachments,
    ) {}

    public function store(StoreAttachmentRequest $request)
    {
        $attachment = $this->attachments->upload(
            $request->file('file'),
            $request->user(),
        );

        return (new AttachmentResource($attachment))->response()->setStatusCode(201);
    }
}
